'use client';

import { useState } from 'react';
import { ai as aiApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PenLine, MessageSquare, FileText, Sparkles, Copy, Loader2 } from 'lucide-react';

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

  const tools: { key: Tool; Icon: typeof PenLine; label: string; desc: string }[] = [
    { key: 'cover-letter', Icon: PenLine, label: 'Cover Letter', desc: 'Generate a tailored cover letter' },
    { key: 'answer', Icon: MessageSquare, label: 'Answer Question', desc: 'Answer application questions' },
    { key: 'resume-optimize', Icon: FileText, label: 'Resume Tips', desc: 'Get optimization suggestions' },
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
            className={`rounded-lg border p-4 text-left transition-all ${
              tool === t.key
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border/50 hover:border-primary/40'
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 mb-2">
              <t.Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="font-semibold">{t.label}</div>
            <div className="text-sm text-muted-foreground">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Input */}
      <Card className="border-border/50">
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
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <Button onClick={generate} disabled={loading} className="w-full sm:w-auto gap-2">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Result</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => { navigator.clipboard.writeText(result); }}
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm leading-relaxed">
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
