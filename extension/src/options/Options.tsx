/**
 * File: options/Options.tsx
 * Purpose: Full-page options/profile management UI for JobHunter.
 *
 * This page opens when the user clicks "Edit Profile" in the popup or
 * navigates to the extension's options page. It provides forms for:
 * - Personal information (name, email, phone, links)
 * - Work experience (add/edit/remove entries)
 * - Education (add/edit/remove entries)
 * - Skills
 * - Job preferences
 * - Custom Q&A pairs
 *
 * All data is persisted to chrome.storage.local via the storage utility.
 */

import { useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import type { UserProfile, PersonalInfo, WorkExperience, Education, Skill, CustomAnswer, JobPreferences } from '@/types';
import { sendMessage } from '@/utils/messaging';
import '@/styles/global.css';

// ---------------------------------------------------------------------------
// Default empty profile
// ---------------------------------------------------------------------------

const EMPTY_PROFILE: UserProfile = {
  personalInfo: {
    firstName: '', lastName: '', email: '', phone: '',
    city: '', state: '', country: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '', website: '',
  },
  experience: [],
  education: [],
  skills: [],
  customAnswers: [],
  preferences: {
    roles: [], locations: [], remoteOnly: false,
    salaryMin: null, salaryMax: null, salaryCurrency: 'USD',
  },
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

function Options() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'preferences'>('personal');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await sendMessage<{ profile: UserProfile | null }>({ type: 'GET_PROFILE' });
        if (res.profile) {
          setProfile(res.profile);
        }
      } catch (error) {
        console.error('[JobHunter Options] Failed to load profile:', error);
      }
    }
    load();
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await sendMessage({ type: 'SAVE_PROFILE', data: profile });
      setSaveMessage('Profile saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Failed to save profile.');
      console.error('[JobHunter Options] Save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [profile]);

  // Tab navigation
  const tabs = [
    { id: 'personal' as const, label: 'Personal Info' },
    { id: 'experience' as const, label: 'Experience' },
    { id: 'education' as const, label: 'Education' },
    { id: 'skills' as const, label: 'Skills' },
    { id: 'preferences' as const, label: 'Preferences' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
              <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
            </div>
            <h1 className="text-lg font-bold text-white">JobHunter — Profile Setup</h1>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className={`text-sm ${saveMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                {saveMessage}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg
                         disabled:opacity-50 transition-colors text-sm"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Tab Navigation */}
        <nav className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          {activeTab === 'personal' && (
            <PersonalInfoForm
              data={profile.personalInfo}
              onChange={(personalInfo) => setProfile((p) => ({ ...p, personalInfo }))}
            />
          )}
          {activeTab === 'experience' && (
            <ExperienceForm
              data={profile.experience}
              onChange={(experience) => setProfile((p) => ({ ...p, experience }))}
            />
          )}
          {activeTab === 'education' && (
            <EducationForm
              data={profile.education}
              onChange={(education) => setProfile((p) => ({ ...p, education }))}
            />
          )}
          {activeTab === 'skills' && (
            <SkillsForm
              skills={profile.skills}
              customAnswers={profile.customAnswers}
              onSkillsChange={(skills) => setProfile((p) => ({ ...p, skills }))}
              onAnswersChange={(customAnswers) => setProfile((p) => ({ ...p, customAnswers }))}
            />
          )}
          {activeTab === 'preferences' && (
            <PreferencesForm
              data={profile.preferences}
              onChange={(preferences) => setProfile((p) => ({ ...p, preferences }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-Components: Personal Info
// ---------------------------------------------------------------------------

function PersonalInfoForm({
  data,
  onChange,
}: {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}) {
  const update = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Personal Information</h2>
      <p className="text-sm text-slate-400">This data will be used to auto-fill application forms.</p>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="First Name" value={data.firstName} onChange={(v) => update('firstName', v)} required />
        <InputField label="Last Name" value={data.lastName} onChange={(v) => update('lastName', v)} required />
        <InputField label="Email" type="email" value={data.email} onChange={(v) => update('email', v)} required />
        <InputField label="Phone" type="tel" value={data.phone} onChange={(v) => update('phone', v)} />
        <InputField label="City" value={data.city} onChange={(v) => update('city', v)} />
        <InputField label="State / Province" value={data.state} onChange={(v) => update('state', v)} />
        <InputField label="Country" value={data.country} onChange={(v) => update('country', v)} />
      </div>

      <h3 className="text-md font-medium text-slate-300 pt-4">Links</h3>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="LinkedIn URL" type="url" value={data.linkedinUrl} onChange={(v) => update('linkedinUrl', v)} placeholder="https://linkedin.com/in/..." />
        <InputField label="GitHub URL" type="url" value={data.githubUrl} onChange={(v) => update('githubUrl', v)} placeholder="https://github.com/..." />
        <InputField label="Portfolio URL" type="url" value={data.portfolioUrl} onChange={(v) => update('portfolioUrl', v)} placeholder="https://..." />
        <InputField label="Website" type="url" value={data.website} onChange={(v) => update('website', v)} placeholder="https://..." />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-Components: Work Experience
// ---------------------------------------------------------------------------

function ExperienceForm({
  data,
  onChange,
}: {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}) {
  const addEntry = () => {
    onChange([
      ...data,
      {
        id: crypto.randomUUID(),
        company: '', title: '', startDate: '', endDate: null,
        isCurrent: false, description: '', achievements: [], technologies: [],
      },
    ]);
  };

  const updateEntry = (index: number, updated: WorkExperience) => {
    const next = [...data];
    next[index] = updated;
    onChange(next);
  };

  const removeEntry = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Work Experience</h2>
          <p className="text-sm text-slate-400">Add your work history, most recent first.</p>
        </div>
        <button onClick={addEntry} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-500">
          + Add Experience
        </button>
      </div>

      {data.length === 0 && (
        <p className="text-slate-500 text-center py-8">No experience entries yet. Click "Add Experience" to start.</p>
      )}

      {data.map((exp, index) => (
        <div key={exp.id} className="border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-500">Entry {index + 1}</span>
            <button onClick={() => removeEntry(index)} className="text-red-400 text-sm hover:underline">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Company" value={exp.company} onChange={(v) => updateEntry(index, { ...exp, company: v })} />
            <InputField label="Job Title" value={exp.title} onChange={(v) => updateEntry(index, { ...exp, title: v })} />
            <InputField label="Start Date" type="date" value={exp.startDate} onChange={(v) => updateEntry(index, { ...exp, startDate: v })} />
            <InputField label="End Date" type="date" value={exp.endDate || ''} onChange={(v) => updateEntry(index, { ...exp, endDate: v || null })} disabled={exp.isCurrent} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={exp.isCurrent}
              onChange={(e) => updateEntry(index, { ...exp, isCurrent: e.target.checked, endDate: e.target.checked ? null : exp.endDate })}
              className="rounded border-slate-700 bg-slate-800"
            />
            I currently work here
          </label>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
            <textarea
              value={exp.description}
              onChange={(e) => updateEntry(index, { ...exp, description: e.target.value })}
              rows={3}
              className="w-full border border-slate-700 bg-slate-800/50 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
              placeholder="Describe your responsibilities and impact..."
            />
          </div>
          <InputField
            label="Technologies (comma-separated)"
            value={exp.technologies.join(', ')}
            onChange={(v) => updateEntry(index, { ...exp, technologies: v.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="React, TypeScript, Node.js..."
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-Components: Education
// ---------------------------------------------------------------------------

function EducationForm({
  data,
  onChange,
}: {
  data: Education[];
  onChange: (data: Education[]) => void;
}) {
  const addEntry = () => {
    onChange([...data, { id: crypto.randomUUID(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }]);
  };

  const updateEntry = (index: number, updated: Education) => {
    const next = [...data];
    next[index] = updated;
    onChange(next);
  };

  const removeEntry = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Education</h2>
          <p className="text-sm text-slate-400">Add your educational background.</p>
        </div>
        <button onClick={addEntry} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-500">
          + Add Education
        </button>
      </div>

      {data.length === 0 && (
        <p className="text-slate-500 text-center py-8">No education entries yet.</p>
      )}

      {data.map((edu, index) => (
        <div key={edu.id} className="border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-500">Entry {index + 1}</span>
            <button onClick={() => removeEntry(index)} className="text-red-400 text-sm hover:underline">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Institution" value={edu.institution} onChange={(v) => updateEntry(index, { ...edu, institution: v })} />
            <InputField label="Degree" value={edu.degree} onChange={(v) => updateEntry(index, { ...edu, degree: v })} placeholder="B.S., M.S., Ph.D...." />
            <InputField label="Field of Study" value={edu.field} onChange={(v) => updateEntry(index, { ...edu, field: v })} />
            <InputField label="GPA" value={edu.gpa} onChange={(v) => updateEntry(index, { ...edu, gpa: v })} placeholder="3.8" />
            <InputField label="Start Date" type="date" value={edu.startDate} onChange={(v) => updateEntry(index, { ...edu, startDate: v })} />
            <InputField label="End Date" type="date" value={edu.endDate} onChange={(v) => updateEntry(index, { ...edu, endDate: v })} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-Components: Skills & Custom Q&A
// ---------------------------------------------------------------------------

function SkillsForm({
  skills,
  customAnswers,
  onSkillsChange,
  onAnswersChange,
}: {
  skills: Skill[];
  customAnswers: CustomAnswer[];
  onSkillsChange: (skills: Skill[]) => void;
  onAnswersChange: (answers: CustomAnswer[]) => void;
}) {
  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState<Skill['category']>('technical');

  const addSkill = () => {
    if (!newSkill.trim()) return;
    onSkillsChange([...skills, { name: newSkill.trim(), category: newCategory, proficiency: 'intermediate' }]);
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    onSkillsChange(skills.filter((_, i) => i !== index));
  };

  const addAnswer = () => {
    onAnswersChange([...customAnswers, { id: crypto.randomUUID(), question: '', answer: '' }]);
  };

  const updateAnswer = (index: number, updated: CustomAnswer) => {
    const next = [...customAnswers];
    next[index] = updated;
    onAnswersChange(next);
  };

  const removeAnswer = (index: number) => {
    onAnswersChange(customAnswers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Skills */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Skills</h2>
        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            placeholder="Add a skill..."
            className="flex-1 border border-slate-700 bg-slate-800/50 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Skill['category'])}
            className="border border-slate-700 bg-slate-800/50 text-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="technical">Technical</option>
            <option value="soft">Soft Skill</option>
            <option value="language">Language</option>
          </select>
          <button onClick={addSkill} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-500">
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm">
              {skill.name}
              <span className="text-slate-500 text-xs">({skill.category})</span>
              <button onClick={() => removeSkill(i)} className="text-slate-500 hover:text-red-400 ml-1">×</button>
            </span>
          ))}
          {skills.length === 0 && <p className="text-slate-500 text-sm">No skills added yet.</p>}
        </div>
      </div>

      {/* Custom Q&A */}
      <div className="space-y-4 border-t border-slate-800 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Custom Q&A</h2>
            <p className="text-sm text-slate-400">Pre-write answers to common application questions.</p>
          </div>
          <button onClick={addAnswer} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-500">
            + Add Q&A
          </button>
        </div>
        {customAnswers.map((qa, i) => (
          <div key={qa.id} className="border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-slate-500">Q&A {i + 1}</span>
              <button onClick={() => removeAnswer(i)} className="text-red-400 text-sm hover:underline">Remove</button>
            </div>
            <InputField label="Question" value={qa.question} onChange={(v) => updateAnswer(i, { ...qa, question: v })} placeholder='e.g., "Why do you want to work here?"' />
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Answer</label>
              <textarea
                value={qa.answer}
                onChange={(e) => updateAnswer(i, { ...qa, answer: e.target.value })}
                rows={3}
                className="w-full border border-slate-700 bg-slate-800/50 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-Components: Preferences
// ---------------------------------------------------------------------------

function PreferencesForm({
  data,
  onChange,
}: {
  data: JobPreferences;
  onChange: (data: JobPreferences) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Job Preferences</h2>
      <p className="text-sm text-slate-400">Configure your job search preferences.</p>

      <InputField
        label="Desired Roles (comma-separated)"
        value={data.roles.join(', ')}
        onChange={(v) => onChange({ ...data, roles: v.split(',').map((s) => s.trim()).filter(Boolean) })}
        placeholder="Frontend Engineer, Full Stack Developer..."
      />

      <InputField
        label="Preferred Locations (comma-separated)"
        value={data.locations.join(', ')}
        onChange={(v) => onChange({ ...data, locations: v.split(',').map((s) => s.trim()).filter(Boolean) })}
        placeholder="San Francisco, Remote, New York..."
      />

      <label className="flex items-center gap-2 text-sm text-slate-400">
        <input
          type="checkbox"
          checked={data.remoteOnly}
          onChange={(e) => onChange({ ...data, remoteOnly: e.target.checked })}
          className="rounded border-slate-700 bg-slate-800"
        />
        Remote only
      </label>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Currency</label>
          <select
            value={data.salaryCurrency}
            onChange={(e) => onChange({ ...data, salaryCurrency: e.target.value })}
            className="w-full border border-slate-700 bg-slate-800/50 text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
          </select>
        </div>
        <InputField
          label="Min Salary"
          type="number"
          value={data.salaryMin?.toString() || ''}
          onChange={(v) => onChange({ ...data, salaryMin: v ? parseInt(v, 10) : null })}
          placeholder="80000"
        />
        <InputField
          label="Max Salary"
          type="number"
          value={data.salaryMax?.toString() || ''}
          onChange={(v) => onChange({ ...data, salaryMax: v ? parseInt(v, 10) : null })}
          placeholder="120000"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reusable Input Component
// ---------------------------------------------------------------------------

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full border border-slate-700 bg-slate-800/50 text-slate-200 rounded-lg px-3 py-2 text-sm 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500
                   disabled:bg-slate-800 disabled:text-slate-500"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<Options />);
}
