import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import type { ApplicationStatus, Prisma } from '@prisma/client';

export interface ListApplicationsQuery {
  status?: ApplicationStatus;
  platform?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export async function listApplications(userId: string, query: ListApplicationsQuery) {
  const { status, platform, page = 1, limit = 20, search } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ApplicationWhereInput = {
    userId,
    ...(status && { status }),
    ...(platform && { platform }),
    ...(search && {
      OR: [
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.application.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createApplication(userId: string, data: {
  jobTitle: string;
  company: string;
  platform: string;
  jobUrl: string;
  status?: ApplicationStatus;
  notes?: string;
}) {
  return prisma.application.create({
    data: {
      userId,
      ...data,
      appliedAt: data.status === 'submitted' ? new Date() : undefined,
    },
  });
}

export async function updateApplication(userId: string, applicationId: string, data: {
  jobTitle?: string;
  company?: string;
  status?: ApplicationStatus;
  notes?: string;
}) {
  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app || app.userId !== userId) throw AppError.notFound('Application not found');

  // Auto-set appliedAt when transitioning to submitted
  const updateData: any = { ...data };
  if (data.status === 'submitted' && app.status === 'draft') {
    updateData.appliedAt = new Date();
  }

  return prisma.application.update({ where: { id: applicationId }, data: updateData });
}

export async function deleteApplication(userId: string, applicationId: string) {
  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app || app.userId !== userId) throw AppError.notFound('Application not found');

  return prisma.application.delete({ where: { id: applicationId } });
}

export async function getStats(userId: string) {
  const [total, byStatus, byPlatform, recentWeek] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    }),
    prisma.application.groupBy({
      by: ['platform'],
      where: { userId },
      _count: true,
    }),
    prisma.application.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    total,
    thisWeek: recentWeek,
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    byPlatform: Object.fromEntries(byPlatform.map((p) => [p.platform, p._count])),
  };
}
