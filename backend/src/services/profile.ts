import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';
import type { Prisma } from '@prisma/client';

// ─── Profile ────────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      experience: { orderBy: { startDate: 'desc' } },
      education: { orderBy: { startDate: 'desc' } },
      skills: true,
      customAnswers: { orderBy: { createdAt: 'desc' } },
      preferences: true,
    },
  });
  if (!profile) throw AppError.notFound('Profile not found');
  return profile;
}

export async function updateProfile(userId: string, data: Prisma.ProfileUpdateInput) {
  const profile = await prisma.profile.update({
    where: { userId },
    data,
  });
  return profile;
}

// ─── Work Experience ────────────────────────────────────────────────────────

export async function addExperience(userId: string, data: Prisma.WorkExperienceUncheckedCreateWithoutProfileInput) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) throw AppError.notFound('Profile not found');

  return prisma.workExperience.create({
    data: { ...data, profileId: profile.id },
  });
}

export async function updateExperience(userId: string, experienceId: string, data: Prisma.WorkExperienceUpdateInput) {
  await assertOwnership(userId, experienceId, 'experience');
  return prisma.workExperience.update({ where: { id: experienceId }, data });
}

export async function deleteExperience(userId: string, experienceId: string) {
  await assertOwnership(userId, experienceId, 'experience');
  return prisma.workExperience.delete({ where: { id: experienceId } });
}

// ─── Education ──────────────────────────────────────────────────────────────

export async function addEducation(userId: string, data: Prisma.EducationUncheckedCreateWithoutProfileInput) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) throw AppError.notFound('Profile not found');

  return prisma.education.create({
    data: { ...data, profileId: profile.id },
  });
}

export async function updateEducation(userId: string, educationId: string, data: Prisma.EducationUpdateInput) {
  await assertOwnership(userId, educationId, 'education');
  return prisma.education.update({ where: { id: educationId }, data });
}

export async function deleteEducation(userId: string, educationId: string) {
  await assertOwnership(userId, educationId, 'education');
  return prisma.education.delete({ where: { id: educationId } });
}

// ─── Skills ─────────────────────────────────────────────────────────────────

export async function setSkills(userId: string, skills: { name: string; category: string; proficiency: string }[]) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) throw AppError.notFound('Profile not found');

  // Delete existing and replace
  await prisma.skill.deleteMany({ where: { profileId: profile.id } });

  const created = await prisma.skill.createMany({
    data: skills.map((s) => ({
      profileId: profile.id,
      name: s.name,
      category: s.category as any,
      proficiency: s.proficiency as any,
    })),
  });
  return created;
}

// ─── Custom Answers ─────────────────────────────────────────────────────────

export async function addCustomAnswer(userId: string, question: string, answer: string) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) throw AppError.notFound('Profile not found');

  return prisma.customAnswer.create({
    data: { profileId: profile.id, question, answer },
  });
}

export async function updateCustomAnswer(userId: string, answerId: string, data: { question?: string; answer?: string }) {
  await assertOwnership(userId, answerId, 'customAnswer');
  return prisma.customAnswer.update({ where: { id: answerId }, data });
}

export async function deleteCustomAnswer(userId: string, answerId: string) {
  await assertOwnership(userId, answerId, 'customAnswer');
  return prisma.customAnswer.delete({ where: { id: answerId } });
}

// ─── Job Preferences ────────────────────────────────────────────────────────

export async function upsertPreferences(userId: string, data: {
  roles?: string[];
  locations?: string[];
  remoteOnly?: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
}) {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) throw AppError.notFound('Profile not found');

  return prisma.jobPreference.upsert({
    where: { profileId: profile.id },
    create: { profileId: profile.id, ...data },
    update: data,
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function assertOwnership(userId: string, recordId: string, model: 'experience' | 'education' | 'customAnswer') {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) throw AppError.notFound('Profile not found');

  let record: any;
  switch (model) {
    case 'experience':
      record = await prisma.workExperience.findUnique({ where: { id: recordId } });
      break;
    case 'education':
      record = await prisma.education.findUnique({ where: { id: recordId } });
      break;
    case 'customAnswer':
      record = await prisma.customAnswer.findUnique({ where: { id: recordId } });
      break;
  }

  if (!record || record.profileId !== profile.id) {
    throw AppError.notFound('Record not found');
  }
}
