import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';

const SALT_ROUNDS = 12;

export async function register(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw AppError.conflict('Email already registered');
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      profile: { create: { email } },       // auto-create empty profile
      aiConfig: { create: {} },              // auto-create default AI config
    },
    select: { id: true, email: true, createdAt: true },
  });

  const token = signToken({ userId: user.id });

  return { user, token };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, createdAt: true },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const token = signToken({ userId: user.id });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, createdAt: true },
  });

  if (!user) throw AppError.notFound('User not found');
  return user;
}
