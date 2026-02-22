'use client';

import { useEffect, useState } from 'react';
import { ai as aiApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Brain, Globe, Monitor, CheckCircle } from 'lucide-react';

type Provider = 'openai' | 'anthropic' | 'openrouter' | 'local';

interface AIConfig {
  activeProvider: Provider;
  openaiApiKey: string;
  openaiModel: string;
  anthropicApiKey: string;
  anthropicModel: string;
  openrouterApiKey: string;
  openrouterModel: string;
  localLlmUrl: string;
  localLlmModel: string;
  temperature: number;
  maxTokens: number;
  serverHasOpenaiKey?: boolean;
  serverHasAnthropicKey?: boolean;
  serverHasOpenrouterKey?: boolean;
}

const PROVIDERS: { key: Provider; label: string; Icon: typeof Zap; description: string }[] = [
  { key: 'openai', label: 'OpenAI', Icon: Zap, description: 'GPT-4o, GPT-4o-mini' },
  { key: 'anthropic', label: 'Anthropic', Icon: Brain, description: 'Claude Sonnet, Haiku, Opus' },
  { key: 'openrouter', label: 'OpenRouter', Icon: Globe, description: 'Access 100+ models via one API' },
  { key: 'local', label: 'Local LLM', Icon: Monitor, description: 'Ollama, LM Studio, vLLM' },
];

export default function SettingsPage() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<Provider | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    aiApi
      .getConfig()
      .then(setConfig)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setMessage('');
    try {
      await aiApi.updateConfig(config);
      setMessage('Settings saved!');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (provider: Provider) => {
    setTesting(provider);
    setMessage('');
    try {
      // Save first so backend uses latest keys
      if (config) await aiApi.updateConfig(config);
      const result = await aiApi.testConnection(provider);
      setMessage(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
    } catch (err: any) {
      setMessage(`❌ Test failed: ${err.message}`);
    } finally {
      setTesting(null);
    }
  };

  const updateField = (key: keyof AIConfig, value: any) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (loading) return <div className="animate-pulse text-muted-foreground">Loading settings…</div>;
  if (!config) return <p className="text-muted-foreground">Unable to load settings.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your AI providers and generation preferences</p>
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.startsWith('Error') || message.startsWith('❌')
              ? 'bg-destructive/10 text-destructive'
              : 'bg-green-500/10 text-green-500'
          }`}
        >
          {message}
        </div>
      )}

      {/* Active Provider Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Active AI Provider</CardTitle>
          <CardDescription>Select which provider to use for AI generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROVIDERS.map((p) => (
              <button
                key={p.key}
                onClick={() => updateField('activeProvider', p.key)}
                className={`relative rounded-lg border p-4 text-left transition-all ${
                  config.activeProvider === p.key
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/50 hover:border-primary/40'
                }`}
              >
                {config.activeProvider === p.key && (
                  <Badge className="absolute right-2 top-2" variant="default">Active</Badge>
                )}
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <p.Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="font-semibold">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Provider Configs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* OpenAI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Zap className="h-4 w-4 text-green-500" /> OpenAI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="sk-…"
                value={config.openaiApiKey}
                onChange={(e) => updateField('openaiApiKey', e.target.value)}
              />
              {config.serverHasOpenaiKey && !config.openaiApiKey && (
                <p className="text-xs text-green-600">✓ Server key available — no personal key needed</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Model</Label>
              <Input
                value={config.openaiModel}
                onChange={(e) => updateField('openaiModel', e.target.value)}
                placeholder="gpt-4o-mini"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testConnection('openai')}
              disabled={testing === 'openai'}
            >
              {testing === 'openai' ? 'Testing…' : 'Test Connection'}
            </Button>
          </CardContent>
        </Card>

        {/* Anthropic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Brain className="h-4 w-4 text-orange-500" /> Anthropic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="sk-ant-…"
                value={config.anthropicApiKey}
                onChange={(e) => updateField('anthropicApiKey', e.target.value)}
              />
              {config.serverHasAnthropicKey && !config.anthropicApiKey && (
                <p className="text-xs text-green-600">✓ Server key available — no personal key needed</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Model</Label>
              <Input
                value={config.anthropicModel}
                onChange={(e) => updateField('anthropicModel', e.target.value)}
                placeholder="claude-sonnet-4-20250514"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testConnection('anthropic')}
              disabled={testing === 'anthropic'}
            >
              {testing === 'anthropic' ? 'Testing…' : 'Test Connection'}
            </Button>
          </CardContent>
        </Card>

        {/* OpenRouter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Globe className="h-4 w-4 text-blue-500" /> OpenRouter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="sk-or-…"
                value={config.openrouterApiKey}
                onChange={(e) => updateField('openrouterApiKey', e.target.value)}
              />
              {config.serverHasOpenrouterKey && !config.openrouterApiKey && (
                <p className="text-xs text-green-600">✓ Server key available — no personal key needed</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Model</Label>
              <Input
                value={config.openrouterModel}
                onChange={(e) => updateField('openrouterModel', e.target.value)}
                placeholder="openrouter/auto (free tier compatible)"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testConnection('openrouter')}
              disabled={testing === 'openrouter'}
            >
              {testing === 'openrouter' ? 'Testing…' : 'Test Connection'}
            </Button>
          </CardContent>
        </Card>

        {/* Local LLM */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Monitor className="h-4 w-4 text-violet-500" /> Local LLM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Server URL</Label>
              <Input
                value={config.localLlmUrl}
                onChange={(e) => updateField('localLlmUrl', e.target.value)}
                placeholder="http://localhost:11434"
              />
            </div>
            <div className="space-y-1">
              <Label>Model</Label>
              <Input
                value={config.localLlmModel}
                onChange={(e) => updateField('localLlmModel', e.target.value)}
                placeholder="llama3"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testConnection('local')}
              disabled={testing === 'local'}
            >
              {testing === 'local' ? 'Testing…' : 'Test Connection'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Settings</CardTitle>
          <CardDescription>Control the creativity and length of AI outputs</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Temperature ({config.temperature})</Label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={config.temperature}
              onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Focused (0)</span>
              <span>Creative (2)</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Max Tokens</Label>
            <Input
              type="number"
              min={64}
              max={8192}
              value={config.maxTokens}
              onChange={(e) => updateField('maxTokens', parseInt(e.target.value) || 1024)}
            />
            <p className="text-xs text-muted-foreground">Controls max output length (64 – 8192)</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving ? 'Saving…' : 'Save All Settings'}
      </Button>
    </div>
  );
}
