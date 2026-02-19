'use client';

import { useEffect, useState } from 'react';
import { profile as profileApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'resume'>('personal');

  useEffect(() => {
    profileApi
      .get()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const savePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const form = e.target as HTMLFormElement;
      const fd = new FormData(form);
      const updates: Record<string, string> = {};
      fd.forEach((val, key) => (updates[key] = val as string));
      const updated = await profileApi.update(updates);
      setData((prev: any) => ({ ...prev, ...updated }));
      setMessage('Profile saved!');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ─── Experience handlers ──────────────────────────────────────────────────

  const [expForm, setExpForm] = useState({ company: '', title: '', startDate: '', endDate: '', isCurrent: false, description: '' });
  const [editingExpId, setEditingExpId] = useState<string | null>(null);

  const addExperience = async () => {
    if (!expForm.company || !expForm.title || !expForm.startDate) return;
    setSaving(true);
    try {
      const exp = await profileApi.addExperience({
        ...expForm,
        startDate: new Date(expForm.startDate).toISOString(),
        endDate: expForm.endDate ? new Date(expForm.endDate).toISOString() : null,
      });
      setData((prev: any) => ({ ...prev, experience: [exp, ...(prev.experience || [])] }));
      setExpForm({ company: '', title: '', startDate: '', endDate: '', isCurrent: false, description: '' });
      setMessage('Experience added!');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteExperience = async (id: string) => {
    try {
      await profileApi.deleteExperience(id);
      setData((prev: any) => ({ ...prev, experience: prev.experience.filter((e: any) => e.id !== id) }));
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // ─── Education handlers ───────────────────────────────────────────────────

  const [eduForm, setEduForm] = useState({ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' });

  const addEducation = async () => {
    if (!eduForm.institution || !eduForm.degree || !eduForm.field || !eduForm.startDate) return;
    setSaving(true);
    try {
      const edu = await profileApi.addEducation({
        ...eduForm,
        startDate: new Date(eduForm.startDate).toISOString(),
        endDate: eduForm.endDate ? new Date(eduForm.endDate).toISOString() : null,
      });
      setData((prev: any) => ({ ...prev, education: [edu, ...(prev.education || [])] }));
      setEduForm({ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' });
      setMessage('Education added!');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteEducation = async (id: string) => {
    try {
      await profileApi.deleteEducation(id);
      setData((prev: any) => ({ ...prev, education: prev.education.filter((e: any) => e.id !== id) }));
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  // ─── Skills handler ───────────────────────────────────────────────────────

  const [newSkill, setNewSkill] = useState({ name: '', category: 'technical', proficiency: 'intermediate' });

  const addSkill = () => {
    if (!newSkill.name) return;
    const skills = [...(data?.skills || []), { ...newSkill, id: `temp-${Date.now()}` }];
    setData((prev: any) => ({ ...prev, skills }));
    setNewSkill({ name: '', category: 'technical', proficiency: 'intermediate' });
  };

  const removeSkill = (idx: number) => {
    const skills = [...(data?.skills || [])];
    skills.splice(idx, 1);
    setData((prev: any) => ({ ...prev, skills }));
  };

  const saveSkills = async () => {
    setSaving(true);
    try {
      await profileApi.setSkills((data?.skills || []).map((s: any) => ({ name: s.name, category: s.category, proficiency: s.proficiency })));
      setMessage('Skills saved!');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse text-muted-foreground">Loading profile...</div>;

  const tabs = [
    { key: 'personal', label: '👤 Personal' },
    { key: 'experience', label: '💼 Experience' },
    { key: 'education', label: '🎓 Education' },
    { key: 'skills', label: '🛠 Skills' },
    { key: 'resume', label: '📄 Resume' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information for auto-filling applications</p>
      </div>

      {message && (
        <div className={`rounded-md p-3 text-sm ${message.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setMessage(''); }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === key ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Personal Info */}
      {tab === 'personal' && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic contact details used when filling forms</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={savePersonal} className="grid gap-4 sm:grid-cols-2">
              {[
                { key: 'firstName', label: 'First Name' },
                { key: 'lastName', label: 'Last Name' },
                { key: 'email', label: 'Contact Email', type: 'email' },
                { key: 'phone', label: 'Phone' },
                { key: 'city', label: 'City' },
                { key: 'state', label: 'State' },
                { key: 'country', label: 'Country' },
                { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'url' },
                { key: 'githubUrl', label: 'GitHub URL', type: 'url' },
                { key: 'portfolioUrl', label: 'Portfolio URL', type: 'url' },
                { key: 'website', label: 'Website', type: 'url' },
              ].map(({ key, label, type }) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={key}>{label}</Label>
                  <Input id={key} name={key} type={type || 'text'} defaultValue={data?.[key] || ''} />
                </div>
              ))}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea id="summary" name="summary" rows={4} defaultValue={data?.summary || ''} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {tab === 'experience' && (
        <div className="space-y-4">
          {/* Existing entries */}
          {(data?.experience || []).map((exp: any) => (
            <Card key={exp.id}>
              <CardContent className="flex items-start justify-between p-4">
                <div>
                  <h3 className="font-semibold">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(exp.startDate).toLocaleDateString()} —{' '}
                    {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                  {exp.description && <p className="mt-1 text-sm">{exp.description}</p>}
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteExperience(exp.id)}>
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Add form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Experience</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Company</Label>
                <Input value={expForm.company} onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Title</Label>
                <Input value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Input type="date" value={expForm.startDate} onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <Input type="date" value={expForm.endDate} onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })} disabled={expForm.isCurrent} />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" id="isCurrent" checked={expForm.isCurrent} onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked, endDate: '' })} />
                <Label htmlFor="isCurrent">I currently work here</Label>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} rows={3} />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={addExperience} disabled={saving}>Add Experience</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Education */}
      {tab === 'education' && (
        <div className="space-y-4">
          {(data?.education || []).map((edu: any) => (
            <Card key={edu.id}>
              <CardContent className="flex items-start justify-between p-4">
                <div>
                  <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(edu.startDate).toLocaleDateString()} —{' '}
                    {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                  </p>
                  {edu.gpa && <p className="text-xs">GPA: {edu.gpa}</p>}
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteEducation(edu.id)}>
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Education</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Institution</Label>
                <Input value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Degree</Label>
                <Input value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} placeholder="Bachelor of Science" />
              </div>
              <div className="space-y-1">
                <Label>Field of Study</Label>
                <Input value={eduForm.field} onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })} placeholder="Computer Science" />
              </div>
              <div className="space-y-1">
                <Label>GPA</Label>
                <Input value={eduForm.gpa} onChange={(e) => setEduForm({ ...eduForm, gpa: e.target.value })} placeholder="3.8" />
              </div>
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Input type="date" value={eduForm.startDate} onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <Input type="date" value={eduForm.endDate} onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={addEducation} disabled={saving}>Add Education</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Skills */}
      {tab === 'skills' && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Add your technical, soft, and language skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing skills */}
            <div className="flex flex-wrap gap-2">
              {(data?.skills || []).map((skill: any, idx: number) => (
                <span
                  key={skill.id || idx}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                >
                  {skill.name}
                  <span className="text-xs text-muted-foreground">({skill.proficiency})</span>
                  <button onClick={() => removeSkill(idx)} className="ml-1 text-muted-foreground hover:text-destructive">
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add skill */}
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Skill name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="w-48"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="technical">Technical</option>
                <option value="soft">Soft</option>
                <option value="language">Language</option>
              </select>
              <select
                value={newSkill.proficiency}
                onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <Button variant="outline" onClick={addSkill}>Add</Button>
            </div>

            <Button onClick={saveSkills} disabled={saving}>
              {saving ? 'Saving…' : 'Save Skills'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resume */}
      {tab === 'resume' && (
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>Add a link to your resume (Google Drive, Dropbox, personal site, etc.) and optionally note the filename.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                setMessage('');
                try {
                  const form = e.target as HTMLFormElement;
                  const fd = new FormData(form);
                  const updates: Record<string, string> = {};
                  fd.forEach((val, key) => (updates[key] = val as string));
                  const updated = await profileApi.update(updates);
                  setData((prev: any) => ({ ...prev, ...updated }));
                  setMessage('Resume info saved!');
                } catch (err: any) {
                  setMessage(`Error: ${err.message}`);
                } finally {
                  setSaving(false);
                }
              }}
              className="grid gap-4"
            >
              <div className="space-y-1">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input
                  id="resumeUrl"
                  name="resumeUrl"
                  type="url"
                  placeholder="https://drive.google.com/file/d/... or https://example.com/resume.pdf"
                  defaultValue={data?.resumeUrl || ''}
                />
                <p className="text-xs text-muted-foreground">
                  Paste a link to your resume hosted on Google Drive, Dropbox, or your website.
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="resumeFileName">Resume File Name</Label>
                <Input
                  id="resumeFileName"
                  name="resumeFileName"
                  placeholder="John_Doe_Resume_2025.pdf"
                  defaultValue={data?.resumeFileName || ''}
                />
                <p className="text-xs text-muted-foreground">
                  The original filename of your resume (for reference).
                </p>
              </div>
              <div>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Resume Info'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
