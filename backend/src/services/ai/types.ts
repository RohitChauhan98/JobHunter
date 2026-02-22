import type { AIProvider } from '@prisma/client';

// ─── AI Provider Interface ──────────────────────────────────────────────────

export interface AIGenerateOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerateResult {
  text: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
}

export interface IAIProvider {
  readonly name: AIProvider;
  generate(options: AIGenerateOptions, config: ProviderConfig): Promise<AIGenerateResult>;
  isAvailable(config: ProviderConfig): boolean;
}

export interface ProviderConfig {
  // OpenAI
  openaiApiKey?: string;
  openaiModel?: string;
  // Anthropic
  anthropicApiKey?: string;
  anthropicModel?: string;
  // OpenRouter
  openrouterApiKey?: string;
  openrouterModel?: string;
  // Local LLM
  localLlmUrl?: string;
  localLlmModel?: string;
  // Shared
  temperature?: number;
  maxTokens?: number;
}

// ─── Prompt Templates ───────────────────────────────────────────────────────

export function buildCoverLetterPrompt(profile: any, jobDescription: string): AIGenerateOptions {
  return {
    systemPrompt: `You are a professional career coach. Write a concise, tailored cover letter.
Do not make up experience. Use only what is provided in the candidate profile.
Keep it under 400 words. Be specific about how the candidate's experience matches the job.`,
    prompt: `Write a cover letter for this job:

--- JOB DESCRIPTION ---
${jobDescription}

--- CANDIDATE PROFILE ---
Name: ${profile.firstName} ${profile.lastName}
Summary: ${profile.summary || 'N/A'}
Experience:
${(profile.experience || []).map((e: any) =>
  `- ${e.title} at ${e.company} (${e.startDate} - ${e.isCurrent ? 'Present' : e.endDate}): ${e.description}`
).join('\n')}
Skills: ${(profile.skills || []).map((s: any) => s.name).join(', ')}
Education: ${(profile.education || []).map((e: any) => `${e.degree} in ${e.field} from ${e.institution}`).join('; ')}
`,
  };
}

export function buildAnswerPrompt(profile: any, question: string, context?: string): AIGenerateOptions {
  return {
    systemPrompt: `You are helping a job applicant answer a job application question.
Be concise, professional, and authentic. Use the candidate's actual experience.
Do not invent or exaggerate. If the candidate doesn't have relevant experience, be honest.
Answer in 2-4 sentences unless the question warrants more.`,
    prompt: `Answer this job application question:

"${question}"

${context ? `Context about the job: ${context}\n` : ''}
--- CANDIDATE PROFILE ---
Name: ${profile.firstName} ${profile.lastName}
Summary: ${profile.summary || 'N/A'}
Experience:
${(profile.experience || []).map((e: any) =>
  `- ${e.title} at ${e.company}: ${e.description}`
).join('\n')}
Skills: ${(profile.skills || []).map((s: any) => s.name).join(', ')}
`,
  };
}

export function buildSmartAnswerPrompt(profile: any, data: {
  question: string;
  companyName?: string;
  companyInfo?: string;
  jobDescription?: string;
  jobUrl?: string;
  jobTitle?: string;
  maxLength?: number;
}): AIGenerateOptions {
  const charLimitNote = data.maxLength
    ? `\nIMPORTANT: Keep your answer under ${data.maxLength} characters.`
    : '';

  const jobContext = [
    data.companyName && `Company: ${data.companyName}`,
    data.jobTitle && `Role: ${data.jobTitle}`,
    data.companyInfo && `About the company: ${data.companyInfo}`,
    data.jobDescription && `Job description: ${data.jobDescription}`,
    data.jobUrl && `Job URL: ${data.jobUrl}`,
  ].filter(Boolean).join('\n');

  return {
    systemPrompt: `You are helping a job applicant answer a question on a job application form.
Be concise, professional, and authentic. Use the candidate's actual experience.
Do not invent or exaggerate. Tailor the answer to the specific company and role.
Do not use markdown formatting — write plain text suitable for a form textarea.
Answer in 2-4 sentences unless the question clearly warrants more.${charLimitNote}`,
    prompt: `Answer this job application question:

"${data.question}"

${jobContext ? `--- JOB CONTEXT ---\n${jobContext}\n\n` : ''}
--- CANDIDATE PROFILE ---
Name: ${profile.firstName} ${profile.lastName}
Summary: ${profile.summary || 'N/A'}
Experience:
${(profile.experience || []).map((e: any) =>
  `- ${e.title} at ${e.company}: ${e.description}`
).join('\n')}
Skills: ${(profile.skills || []).map((s: any) => s.name).join(', ')}
`,
  };
}

export function buildResumeOptimizationPrompt(profile: any, jobDescription: string): AIGenerateOptions {
  return {
    systemPrompt: `You are an expert resume optimizer. Suggest specific improvements to better align
the candidate's resume with the target job. Provide actionable, concrete suggestions.
Format your response as a numbered list.`,
    prompt: `Optimize this resume for the job below:

--- JOB DESCRIPTION ---
${jobDescription}

--- CURRENT RESUME ---
${profile.firstName} ${profile.lastName}
${profile.summary || ''}

Experience:
${(profile.experience || []).map((e: any) =>
  `${e.title} at ${e.company}\n${e.description}\nAchievements: ${(e.achievements || []).join('; ')}`
).join('\n\n')}

Skills: ${(profile.skills || []).map((s: any) => `${s.name} (${s.proficiency})`).join(', ')}

Education: ${(profile.education || []).map((e: any) => `${e.degree} in ${e.field} from ${e.institution}`).join('; ')}
`,
  };
}
