/**
 * Seed script — creates a test user with a fully populated profile
 * so you can immediately start testing the extension + dashboard.
 *
 * Run:  npm run db:seed
 *       (or: npx tsx prisma/seed.ts)
 *
 * Test credentials:
 *   Email:    rohit@jobhunter.dev
 *   Password: password123
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'rohit@jobhunter.dev';
  const password = 'password123';
  const hash = await bcrypt.hash(password, 12);

  // Upsert user so the script is idempotent
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hash,
    },
  });

  console.log(`✅ User created/found: ${user.email} (id: ${user.id})`);

  // ─── Profile ────────────────────────────────────────────────────────────
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      firstName: 'Rohit',
      lastName: 'Sharma',
      email: 'rohit@jobhunter.dev',
      phone: '+1 (555) 123-4567',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      linkedinUrl: 'https://linkedin.com/in/rohitsharma',
      githubUrl: 'https://github.com/rohitsharma',
      portfolioUrl: 'https://rohitsharma.dev',
      website: 'https://rohitsharma.dev',
      summary:
        'Full-stack software engineer with 5+ years of experience building scalable web applications and developer tools. ' +
        'Passionate about clean architecture, developer experience, and AI-powered productivity tools. ' +
        'Proficient in TypeScript, React, Node.js, and cloud infrastructure. ' +
        'Looking for senior engineering roles at innovative product companies.',
    },
    create: {
      userId: user.id,
      firstName: 'Rohit',
      lastName: 'Sharma',
      email: 'rohit@jobhunter.dev',
      phone: '+1 (555) 123-4567',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      linkedinUrl: 'https://linkedin.com/in/rohitsharma',
      githubUrl: 'https://github.com/rohitsharma',
      portfolioUrl: 'https://rohitsharma.dev',
      website: 'https://rohitsharma.dev',
      summary:
        'Full-stack software engineer with 5+ years of experience building scalable web applications and developer tools. ' +
        'Passionate about clean architecture, developer experience, and AI-powered productivity tools. ' +
        'Proficient in TypeScript, React, Node.js, and cloud infrastructure. ' +
        'Looking for senior engineering roles at innovative product companies.',
    },
  });

  console.log(`✅ Profile set up: ${profile.firstName} ${profile.lastName}`);

  // ─── Work Experience ────────────────────────────────────────────────────
  // Clear existing and re-create
  await prisma.workExperience.deleteMany({ where: { profileId: profile.id } });

  const experiences = await Promise.all([
    prisma.workExperience.create({
      data: {
        profileId: profile.id,
        company: 'TechCorp Inc.',
        title: 'Senior Software Engineer',
        startDate: new Date('2022-03-01'),
        endDate: null,
        isCurrent: true,
        description:
          'Lead engineer on the core platform team, building scalable microservices and real-time data pipelines. ' +
          'Mentored 4 junior engineers and drove adoption of TypeScript across the org.',
        achievements: [
          'Reduced API latency by 40% by redesigning the caching layer with Redis',
          'Led migration from monolith to microservices, serving 2M+ daily requests',
          'Built real-time notification system using WebSockets and event-driven architecture',
          'Introduced CI/CD pipeline that cut deployment time from 45min to 8min',
        ],
        technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS'],
      },
    }),
    prisma.workExperience.create({
      data: {
        profileId: profile.id,
        company: 'StartupXYZ',
        title: 'Full Stack Developer',
        startDate: new Date('2020-06-01'),
        endDate: new Date('2022-02-28'),
        isCurrent: false,
        description:
          'Early engineer (#5) at a Series A startup. Built the entire customer-facing dashboard and internal admin tools from scratch.',
        achievements: [
          'Built customer dashboard from scratch serving 50K+ monthly active users',
          'Implemented OAuth2 authentication system with SSO for enterprise clients',
          'Designed and built RESTful API consumed by web, mobile, and partner integrations',
          'Reduced page load time by 60% through code splitting and lazy loading',
        ],
        technologies: ['React', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Vercel'],
      },
    }),
    prisma.workExperience.create({
      data: {
        profileId: profile.id,
        company: 'WebAgency Co.',
        title: 'Junior Frontend Developer',
        startDate: new Date('2019-01-15'),
        endDate: new Date('2020-05-31'),
        isCurrent: false,
        description:
          'Developed responsive web applications for agency clients across e-commerce, fintech, and healthcare sectors.',
        achievements: [
          'Delivered 12+ client projects on time with high satisfaction scores',
          'Built reusable component library used across 8 agency projects',
          'Introduced automated testing with Jest and Cypress, achieving 80% code coverage',
        ],
        technologies: ['JavaScript', 'React', 'Vue.js', 'SCSS', 'Jest', 'Cypress', 'Figma'],
      },
    }),
  ]);

  console.log(`✅ ${experiences.length} work experiences added`);

  // ─── Education ──────────────────────────────────────────────────────────
  await prisma.education.deleteMany({ where: { profileId: profile.id } });

  const educations = await Promise.all([
    prisma.education.create({
      data: {
        profileId: profile.id,
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2015-08-20'),
        endDate: new Date('2019-05-15'),
        gpa: '3.7',
      },
    }),
  ]);

  console.log(`✅ ${educations.length} education entries added`);

  // ─── Skills ─────────────────────────────────────────────────────────────
  await prisma.skill.deleteMany({ where: { profileId: profile.id } });

  const skillsData: { name: string; category: 'technical' | 'soft' | 'language'; proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' }[] = [
    // Technical
    { name: 'TypeScript', category: 'technical', proficiency: 'expert' },
    { name: 'JavaScript', category: 'technical', proficiency: 'expert' },
    { name: 'React', category: 'technical', proficiency: 'expert' },
    { name: 'Next.js', category: 'technical', proficiency: 'advanced' },
    { name: 'Node.js', category: 'technical', proficiency: 'expert' },
    { name: 'Express', category: 'technical', proficiency: 'advanced' },
    { name: 'PostgreSQL', category: 'technical', proficiency: 'advanced' },
    { name: 'MongoDB', category: 'technical', proficiency: 'intermediate' },
    { name: 'Redis', category: 'technical', proficiency: 'intermediate' },
    { name: 'Docker', category: 'technical', proficiency: 'advanced' },
    { name: 'Kubernetes', category: 'technical', proficiency: 'intermediate' },
    { name: 'AWS', category: 'technical', proficiency: 'advanced' },
    { name: 'GraphQL', category: 'technical', proficiency: 'intermediate' },
    { name: 'Prisma', category: 'technical', proficiency: 'advanced' },
    { name: 'Tailwind CSS', category: 'technical', proficiency: 'expert' },
    { name: 'Python', category: 'technical', proficiency: 'intermediate' },
    { name: 'Git', category: 'technical', proficiency: 'expert' },
    { name: 'CI/CD', category: 'technical', proficiency: 'advanced' },
    // Soft skills
    { name: 'Team Leadership', category: 'soft', proficiency: 'advanced' },
    { name: 'Technical Mentoring', category: 'soft', proficiency: 'advanced' },
    { name: 'Communication', category: 'soft', proficiency: 'expert' },
    { name: 'Problem Solving', category: 'soft', proficiency: 'expert' },
    { name: 'Agile / Scrum', category: 'soft', proficiency: 'advanced' },
    // Languages
    { name: 'English', category: 'language', proficiency: 'expert' },
    { name: 'Hindi', category: 'language', proficiency: 'expert' },
  ];

  await prisma.skill.createMany({
    data: skillsData.map((s) => ({ profileId: profile.id, ...s })),
  });

  console.log(`✅ ${skillsData.length} skills added`);

  // ─── Custom Answers (common application questions) ──────────────────────
  await prisma.customAnswer.deleteMany({ where: { profileId: profile.id } });

  const answers = await Promise.all([
    prisma.customAnswer.create({
      data: {
        profileId: profile.id,
        question: 'Why do you want to work at our company?',
        answer:
          "I'm drawn to companies that are solving meaningful problems with great engineering. " +
          "I'm excited about the opportunity to work on impactful products, collaborate with talented engineers, " +
          'and contribute to a culture of technical excellence. I particularly value teams that invest in developer experience and clean architecture.',
      },
    }),
    prisma.customAnswer.create({
      data: {
        profileId: profile.id,
        question: 'What is your greatest strength?',
        answer:
          'My greatest strength is the ability to bridge the gap between complex technical problems and practical, maintainable solutions. ' +
          'I have a knack for breaking down ambiguous requirements into clear technical plans and executing them iteratively. ' +
          "My colleagues often note that I'm great at simplifying complexity both in code and in communication.",
      },
    }),
    prisma.customAnswer.create({
      data: {
        profileId: profile.id,
        question: 'Tell me about a challenging project you worked on.',
        answer:
          'At TechCorp, I led the migration of our monolithic API to microservices while maintaining zero downtime. ' +
          'The challenge was decomposing tightly coupled modules while 2M+ daily requests were being served. ' +
          'I designed a strangler-fig migration pattern, set up parallel routing, and coordinated across 3 teams over 6 months. ' +
          'The result was 40% lower latency, independent deployability, and much happier developers.',
      },
    }),
    prisma.customAnswer.create({
      data: {
        profileId: profile.id,
        question: 'Are you authorized to work in the United States?',
        answer: 'Yes, I am authorized to work in the United States.',
      },
    }),
    prisma.customAnswer.create({
      data: {
        profileId: profile.id,
        question: 'Will you now or in the future require sponsorship?',
        answer: 'No, I do not require sponsorship now or in the future.',
      },
    }),
    prisma.customAnswer.create({
      data: {
        profileId: profile.id,
        question: 'What are your salary expectations?',
        answer:
          "I'm targeting a base compensation in the range of $170,000–$200,000 for a senior engineering role in the Bay Area, " +
          "but I'm flexible and open to discussing the full compensation package including equity and benefits.",
      },
    }),
    prisma.customAnswer.create({
      data: {
        profileId: profile.id,
        question: 'How did you hear about this position?',
        answer: 'I found this role through my job search and was immediately interested in the opportunity.',
      },
    }),
  ]);

  console.log(`✅ ${answers.length} custom Q&A answers added`);

  // ─── Job Preferences ────────────────────────────────────────────────────
  await prisma.jobPreference.upsert({
    where: { profileId: profile.id },
    update: {
      roles: ['Senior Software Engineer', 'Staff Engineer', 'Full Stack Engineer', 'Frontend Engineer'],
      locations: ['San Francisco, CA', 'New York, NY', 'Remote'],
      remoteOnly: false,
      salaryMin: 170000,
      salaryMax: 220000,
      salaryCurrency: 'USD',
    },
    create: {
      profileId: profile.id,
      roles: ['Senior Software Engineer', 'Staff Engineer', 'Full Stack Engineer', 'Frontend Engineer'],
      locations: ['San Francisco, CA', 'New York, NY', 'Remote'],
      remoteOnly: false,
      salaryMin: 170000,
      salaryMax: 220000,
      salaryCurrency: 'USD',
    },
  });

  console.log('✅ Job preferences set');

  // ─── Sample Applications ────────────────────────────────────────────────
  await prisma.application.deleteMany({ where: { userId: user.id } });

  const apps = await Promise.all([
    prisma.application.create({
      data: {
        userId: user.id,
        jobTitle: 'Senior Frontend Engineer',
        company: 'Stripe',
        platform: 'greenhouse',
        jobUrl: 'https://stripe.com/jobs/listing/senior-frontend-engineer',
        status: 'submitted',
        appliedAt: new Date('2026-02-10'),
        notes: 'Applied via Greenhouse. Referral from James.',
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        jobTitle: 'Staff Software Engineer',
        company: 'Vercel',
        platform: 'lever',
        jobUrl: 'https://vercel.com/careers/staff-software-engineer',
        status: 'interview',
        appliedAt: new Date('2026-02-05'),
        notes: 'Phone screen scheduled for Feb 18.',
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        jobTitle: 'Senior Full Stack Engineer',
        company: 'Notion',
        platform: 'greenhouse',
        jobUrl: 'https://notion.so/careers/senior-full-stack',
        status: 'submitted',
        appliedAt: new Date('2026-02-12'),
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        jobTitle: 'Software Engineer III',
        company: 'Google',
        platform: 'workday',
        jobUrl: 'https://careers.google.com/jobs/results/swe-iii',
        status: 'draft',
        notes: 'Need to finish cover letter.',
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        jobTitle: 'Senior Engineer, Platform',
        company: 'Linear',
        platform: 'lever',
        jobUrl: 'https://linear.app/careers/senior-engineer-platform',
        status: 'rejected',
        appliedAt: new Date('2026-01-28'),
        notes: 'Rejected after final round.',
      },
    }),
  ]);

  console.log(`✅ ${apps.length} sample applications added`);

  // ─── AI Config (defaults) ──────────────────────────────────────────────
  await prisma.aIConfig.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      activeProvider: 'openai',
      openaiModel: 'gpt-4o-mini',
      anthropicModel: 'claude-sonnet-4-20250514',
      openrouterModel: 'anthropic/claude-sonnet-4-20250514',
      localLlmUrl: 'http://localhost:11434',
      localLlmModel: 'llama3',
      temperature: 0.7,
      maxTokens: 1024,
    },
  });

  console.log('✅ AI config initialized');

  console.log('\n🎉 Seed complete! You can now log in with:');
  console.log('   Email:    rohit@jobhunter.dev');
  console.log('   Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
