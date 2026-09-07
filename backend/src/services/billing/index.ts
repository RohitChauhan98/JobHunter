import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../utils/errors.js';
import {
  PLANS,
  PAID_PLAN_IDS,
  getPlan,
  periodMs,
  type PlanId,
  DONATION_PRESETS,
} from './plans.js';
import {
  getRazorpayKeyId,
  isRazorpayConfigured,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from './razorpay.js';

function currentUsagePeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function listPlansPublic() {
  return {
    currency: 'INR',
    razorpayConfigured: isRazorpayConfigured(),
    keyId: isRazorpayConfigured() ? getRazorpayKeyId() : null,
    plans: Object.values(PLANS).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      amount: p.amount,
      amountDisplay: `₹${(p.amount / 100).toLocaleString('en-IN')}`,
      currency: p.currency,
      interval: p.interval,
      tier: p.tier,
      popular: Boolean(p.popular),
      features: p.features,
      limits: {
        aiGenerationsPerMonth:
          p.limits.aiGenerationsPerMonth === Number.POSITIVE_INFINITY
            ? null
            : p.limits.aiGenerationsPerMonth,
      },
    })),
    donations: DONATION_PRESETS.map((d) => ({
      id: d.id,
      label: d.label,
      amount: d.amount,
      amountDisplay: `₹${(d.amount / 100).toLocaleString('en-IN')}`,
      description: d.description,
      popular: 'popular' in d && Boolean(d.popular),
    })),
  };
}

/** Resolve effective plan for a user, downgrading expired paid plans. */
export async function getBillingStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      plan: true,
      planInterval: true,
      planExpiresAt: true,
    },
  });
  if (!user) throw AppError.notFound('User not found');

  let plan = user.plan;
  let planInterval = user.planInterval;
  let planExpiresAt = user.planExpiresAt;

  if (
    plan !== 'free' &&
    plan !== 'lifetime' &&
    planExpiresAt &&
    planExpiresAt.getTime() < Date.now()
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'free', planInterval: 'none', planExpiresAt: null },
    });
    await prisma.subscription.updateMany({
      where: { userId, status: 'active' },
      data: { status: 'expired' },
    });
    plan = 'free';
    planInterval = 'none';
    planExpiresAt = null;
  }

  const planDef =
    plan === 'lifetime'
      ? PLANS.lifetime
      : plan === 'pro'
        ? planInterval === 'yearly'
          ? PLANS.pro_yearly
          : PLANS.pro_monthly
        : PLANS.free;

  const period = currentUsagePeriod();
  const usage = await prisma.usageCounter.findUnique({
    where: {
      userId_key_period: { userId, key: 'ai_generations', period },
    },
  });

  const limit = planDef.limits.aiGenerationsPerMonth;
  const used = usage?.count ?? 0;

  const recentPayments = await prisma.payment.findMany({
    where: { userId, status: 'paid' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      type: true,
      amount: true,
      currency: true,
      planId: true,
      createdAt: true,
      razorpayPaymentId: true,
    },
  });

  return {
    plan,
    planInterval,
    planExpiresAt,
    planName: planDef.name,
    isPaid: plan === 'pro' || plan === 'lifetime',
    razorpayConfigured: isRazorpayConfigured(),
    keyId: isRazorpayConfigured() ? getRazorpayKeyId() : null,
    usage: {
      aiGenerations: {
        used,
        limit: limit === Number.POSITIVE_INFINITY ? null : limit,
        period,
      },
    },
    payments: recentPayments,
  };
}

export async function createCheckout(userId: string, planId: string) {
  if (!PAID_PLAN_IDS.includes(planId as PlanId)) {
    throw AppError.badRequest('Invalid plan', 'INVALID_PLAN');
  }
  const plan = getPlan(planId)!;
  if (!isRazorpayConfigured()) {
    throw AppError.internal(
      'Payments are temporarily unavailable. Razorpay keys are not configured.',
      'RAZORPAY_NOT_CONFIGURED',
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, plan: true },
  });
  if (!user) throw AppError.notFound('User not found');

  if (user.plan === 'lifetime' && plan.tier !== 'lifetime') {
    throw AppError.badRequest('You already have a lifetime plan');
  }

  const receipt = `jh_${planId}_${Date.now()}`.slice(0, 40);
  const order = await createOrder({
    amount: plan.amount,
    currency: plan.currency,
    receipt,
    notes: {
      userId,
      planId: plan.id,
      type: 'subscription',
    },
  });

  await prisma.payment.create({
    data: {
      userId,
      type: 'subscription',
      status: 'pending',
      amount: plan.amount,
      currency: plan.currency,
      planId: plan.id,
      razorpayOrderId: order.id,
    },
  });

  await prisma.subscription.create({
    data: {
      userId,
      plan: plan.tier === 'lifetime' ? 'lifetime' : 'pro',
      interval: plan.interval === 'none' ? 'monthly' : plan.interval,
      status: 'pending',
      razorpayOrderId: order.id,
      amount: plan.amount,
      currency: plan.currency,
    },
  });

  return {
    orderId: order.id,
    amount: plan.amount,
    currency: plan.currency,
    keyId: getRazorpayKeyId(),
    planId: plan.id,
    planName: plan.name,
    prefill: { email: user.email },
  };
}

export async function verifyCheckout(
  userId: string,
  payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
) {
  if (!isRazorpayConfigured()) {
    throw AppError.internal('Razorpay is not configured', 'RAZORPAY_NOT_CONFIGURED');
  }

  const valid = verifyPaymentSignature({
    orderId: payload.razorpay_order_id,
    paymentId: payload.razorpay_payment_id,
    signature: payload.razorpay_signature,
  });
  if (!valid) {
    throw AppError.badRequest('Invalid payment signature', 'INVALID_SIGNATURE');
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: payload.razorpay_order_id },
  });
  if (!payment || payment.userId !== userId) {
    throw AppError.notFound('Payment not found');
  }
  if (payment.status === 'paid') {
    return getBillingStatus(userId);
  }

  await activatePaidPlan({
    userId,
    planId: payment.planId!,
    orderId: payload.razorpay_order_id,
    paymentId: payload.razorpay_payment_id,
    signature: payload.razorpay_signature,
  });

  return getBillingStatus(userId);
}

async function activatePaidPlan(opts: {
  userId: string;
  planId: string;
  orderId: string;
  paymentId: string;
  signature?: string;
}) {
  const plan = getPlan(opts.planId);
  if (!plan || plan.tier === 'free') {
    throw AppError.badRequest('Invalid plan for activation');
  }

  const now = new Date();
  const ms = periodMs(plan.interval);
  const expiresAt = ms ? new Date(now.getTime() + ms) : null;

  await prisma.$transaction([
    prisma.payment.update({
      where: { razorpayOrderId: opts.orderId },
      data: {
        status: 'paid',
        razorpayPaymentId: opts.paymentId,
        razorpaySignature: opts.signature,
      },
    }),
    prisma.subscription.updateMany({
      where: { razorpayOrderId: opts.orderId },
      data: {
        status: 'active',
        razorpayPaymentId: opts.paymentId,
        currentPeriodStart: now,
        currentPeriodEnd: expiresAt,
      },
    }),
    prisma.user.update({
      where: { id: opts.userId },
      data: {
        plan: plan.tier,
        planInterval: plan.interval === 'none' ? 'monthly' : plan.interval,
        planExpiresAt: expiresAt,
      },
    }),
  ]);
}

export async function createDonation(opts: {
  userId?: string;
  amount: number;
  email?: string;
  message?: string;
}) {
  if (!isRazorpayConfigured()) {
    throw AppError.internal(
      'Payments are temporarily unavailable. Razorpay keys are not configured.',
      'RAZORPAY_NOT_CONFIGURED',
    );
  }

  // Amount in paise; min ₹10, max ₹100,000
  if (!Number.isInteger(opts.amount) || opts.amount < 1000 || opts.amount > 10_000_000) {
    throw AppError.badRequest('Donation must be between ₹10 and ₹100,000');
  }

  const receipt = `jh_donate_${Date.now()}`.slice(0, 40);
  const order = await createOrder({
    amount: opts.amount,
    currency: 'INR',
    receipt,
    notes: {
      type: 'donation',
      userId: opts.userId || '',
      email: opts.email || '',
      message: (opts.message || '').slice(0, 200),
    },
  });

  await prisma.payment.create({
    data: {
      userId: opts.userId,
      type: 'donation',
      status: 'pending',
      amount: opts.amount,
      currency: 'INR',
      planId: null,
      message: opts.message || opts.email || null,
      razorpayOrderId: order.id,
    },
  });

  return {
    orderId: order.id,
    amount: opts.amount,
    currency: 'INR',
    keyId: getRazorpayKeyId(),
    prefill: { email: opts.email },
  };
}

export async function verifyDonation(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId?: string;
}) {
  if (!isRazorpayConfigured()) {
    throw AppError.internal('Razorpay is not configured', 'RAZORPAY_NOT_CONFIGURED');
  }

  const valid = verifyPaymentSignature({
    orderId: payload.razorpay_order_id,
    paymentId: payload.razorpay_payment_id,
    signature: payload.razorpay_signature,
  });
  if (!valid) {
    throw AppError.badRequest('Invalid payment signature', 'INVALID_SIGNATURE');
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: payload.razorpay_order_id },
  });
  if (!payment || payment.type !== 'donation') {
    throw AppError.notFound('Donation not found');
  }
  if (payload.userId && payment.userId && payment.userId !== payload.userId) {
    throw AppError.forbidden('Donation does not belong to this user');
  }

  if (payment.status !== 'paid') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'paid',
        razorpayPaymentId: payload.razorpay_payment_id,
        razorpaySignature: payload.razorpay_signature,
      },
    });
  }

  return {
    ok: true,
    amount: payment.amount,
    amountDisplay: `₹${(payment.amount / 100).toLocaleString('en-IN')}`,
  };
}

export async function handleWebhook(rawBody: string, signature: string | undefined) {
  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    throw AppError.unauthorized('Invalid webhook signature');
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload: {
      payment?: { entity: { id: string; order_id: string; status: string; notes?: Record<string, string> } };
      order?: { entity: { id: string; notes?: Record<string, string> } };
    };
  };

  if (event.event === 'payment.captured') {
    const entity = event.payload.payment?.entity;
    if (!entity?.order_id) return { ok: true };

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: entity.order_id },
    });
    if (!payment || payment.status === 'paid') return { ok: true };

    if (payment.type === 'donation') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'paid', razorpayPaymentId: entity.id },
      });
    } else if (payment.type === 'subscription' && payment.userId && payment.planId) {
      await activatePaidPlan({
        userId: payment.userId,
        planId: payment.planId,
        orderId: entity.order_id,
        paymentId: entity.id,
      });
    }
  }

  if (event.event === 'payment.failed') {
    const entity = event.payload.payment?.entity;
    if (!entity?.order_id) return { ok: true };
    await prisma.payment.updateMany({
      where: { razorpayOrderId: entity.order_id, status: 'pending' },
      data: { status: 'failed', razorpayPaymentId: entity.id },
    });
    await prisma.subscription.updateMany({
      where: { razorpayOrderId: entity.order_id, status: 'pending' },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });
  }

  return { ok: true };
}

/** Enforce free-tier AI limits; increments counter on success path. */
export async function assertAiAllowance(userId: string) {
  const status = await getBillingStatus(userId);
  const { used, limit } = status.usage.aiGenerations;
  if (limit !== null && used >= limit) {
    throw AppError.forbidden(
      `Free plan limit reached (${limit} AI generations this month). Upgrade to Pro for unlimited AI.`,
      'PLAN_LIMIT',
    );
  }
}

export async function recordAiUsage(userId: string) {
  const period = currentUsagePeriod();
  await prisma.usageCounter.upsert({
    where: {
      userId_key_period: { userId, key: 'ai_generations', period },
    },
    create: { userId, key: 'ai_generations', period, count: 1 },
    update: { count: { increment: 1 } },
  });
}

export async function getUserPlanSummary(userId: string) {
  const status = await getBillingStatus(userId);
  return {
    plan: status.plan,
    planInterval: status.planInterval,
    planExpiresAt: status.planExpiresAt,
    planName: status.planName,
    isPaid: status.isPaid,
  };
}
