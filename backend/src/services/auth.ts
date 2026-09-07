import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';

const SALT_ROUNDS = 12;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function register(email: string, password: string) {
  const normalized = normalizeEmail(email);
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    throw AppError.conflict('Email already registered');
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: normalized,
      password: hash,
      profile: { create: { email: normalized } }, // auto-create empty profile
      aiConfig: { create: {} }, // auto-create default AI config
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      plan: true,
      planInterval: true,
      planExpiresAt: true,
    },
  });

  const token = signToken({ userId: user.id });

  return {
    user: { ...user, isPaid: false, planName: 'Free' },
    token,
  };
}

export async function login(email: string, password: string) {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: {
      id: true,
      email: true,
      password: true,
      createdAt: true,
      plan: true,
      planInterval: true,
      planExpiresAt: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const token = signToken({ userId: user.id });

  const { password: _, ...safeUser } = user;
  const planName =
    safeUser.plan === 'lifetime' ? 'Lifetime' : safeUser.plan === 'pro' ? 'Pro' : 'Free';
  return {
    user: {
      ...safeUser,
      isPaid: safeUser.plan === 'pro' || safeUser.plan === 'lifetime',
      planName,
    },
    token,
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      plan: true,
      planInterval: true,
      planExpiresAt: true,
    },
  });

  if (!user) throw AppError.notFound('User not found');

  // Soft-expire paid plans that have lapsed
  if (
    user.plan !== 'free' &&
    user.plan !== 'lifetime' &&
    user.planExpiresAt &&
    user.planExpiresAt.getTime() < Date.now()
  ) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { plan: 'free', planInterval: 'none', planExpiresAt: null },
      select: {
        id: true,
        email: true,
        createdAt: true,
        plan: true,
        planInterval: true,
        planExpiresAt: true,
      },
    });
    return {
      ...updated,
      isPaid: false,
      planName: 'Free',
    };
  }

  const planName =
    user.plan === 'lifetime' ? 'Lifetime' : user.plan === 'pro' ? 'Pro' : 'Free';

  return {
    ...user,
    isPaid: user.plan === 'pro' || user.plan === 'lifetime',
    planName,
  };
}
