'use client';

import { useState } from 'react';
import { ai as aiApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Tool = 'cover-letter' | 'answer' | 'resume-optimize';

export default function AIAssistantPage() {
  const [tool, setTool] = useState<Tool>('cover-letter');
  const [jobDesc, setJobDesc] = useState('');
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<{ provider?: string; model?: string; tokensUsed?: number } | null>(null);

  const generate = async () => {
    setLoading(true);
    setError('');
    setResult('');
    setMeta(null);

    try {
      let response;
      switch (tool) {
        case 'cover-letter':
          if (!jobDesc.trim()) { setError('Please enter a job description'); setLoading(false); return; }
          response = await aiApi.coverLetter(jobDesc);
          break;
        case 'answer':
          if (!question.trim()) { setError('Please enter a question'); setLoading(false); return; }
          response = await aiApi.answer(question, context || undefined);
          break;
        case 'resume-optimize':
          if (!jobDesc.trim()) { setError('Please enter a job description'); setLoading(false); return; }
          response = await aiApi.resumeOptimize(jobDesc);
          break;
      }
      setResult(response.text);
      setMeta({ provider: response.provider, model: response.model, tokensUsed: response.tokensUsed });
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const tools: { key: Tool; icon: string; label: string; desc: string }[] = [
    { key: 'cover-letter', icon: '📝', label: 'Cover Letter', desc: 'Generate a tailored cover letter' },
    { key: 'answer', icon: '💬', label: 'Answer Question', desc: 'Answer application questions' },
    { key: 'resume-optimize', icon: '📄', label: 'Resume Tips', desc: 'Get optimization suggestions' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">
          Use AI to generate cover letters, answer questions, and optimize your resume
        </p>
      </div>

      {/* Tool Selector */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tools.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTool(t.key); setResult(''); setError(''); setMeta(null); }}
            className={`rounded-lg border p-4 text-left transition-colors ${
              tool === t.key
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="text-2xl">{t.icon}</div>
            <div className="mt-1 font-semibold">{t.label}</div>
            <div className="text-sm text-muted-foreground">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle>{tools.find((t) => t.key === tool)?.label}</CardTitle>
          <CardDescription>{tools.find((t) => t.key === tool)?.desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(tool === 'cover-letter' || tool === 'resume-optimize') && (
            <div className="space-y-2">
              <Label>Job Description</Label>
              <Textarea
                rows={8}
                placeholder="Paste the full job description here…"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />
            </div>
          )}

          {tool === 'answer' && (
            <>
              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  rows={3}
                  placeholder='e.g. "Why do you want to work at our company?"'
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Job Context (optional)</Label>
                <Textarea
                  rows={4}
                  placeholder="Paste any relevant info about the job/company…"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>
            </>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <Button onClick={generate} disabled={loading} className="w-full sm:w-auto">
            {loading ? '⏳ Generating…' : '✨ Generate'}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Result</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { navigator.clipboard.writeText(result); }}
            >
              📋 Copy
            </Button>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm leading-relaxed">
              {result}
            </div>
            {meta && (
              <p className="mt-3 text-xs text-muted-foreground">
                Provider: {meta.provider} · Model: {meta.model}
                {meta.tokensUsed && <span> · Tokens: {meta.tokensUsed}</span>}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
