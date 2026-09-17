'use client';

import { useEffect, useState } from 'react';
import { ai as aiApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Brain, Globe, Monitor, HardDrive, Sparkles, CheckCircle } from 'lucide-react';
import { ModelSelect } from '@/components/ui/model-select';

type Provider = 'openai' | 'anthropic' | 'openrouter' | 'glm' | 'ollama' | 'local';

interface AIConfig {
  activeProvider: Provider;
  openaiApiKey: string;
  openaiModel: string;
  anthropicApiKey: string;
  anthropicModel: string;
  openrouterApiKey: string;
  openrouterModel: string;
  glmApiKey: string;
  glmModel: string;
  glmBaseUrl: string;
  localLlmUrl: string;
  localLlmModel: string;
  localLlmApiKey: string;
  ollamaUrl: string;
  ollamaModel: string;
  ollamaApiKey: string;
  temperature: number;
  maxTokens: number;
  serverHasOpenaiKey?: boolean;
  serverHasAnthropicKey?: boolean;
  serverHasOpenrouterKey?: boolean;
  serverHasGlmKey?: boolean;
}

const PROVIDERS: { key: Provider; label: string; Icon: typeof Zap; description: string }[] = [
  { key: 'openai', label: 'OpenAI', Icon: Zap, description: 'GPT-4o, GPT-4o-mini' },
  { key: 'anthropic', label: 'Anthropic', Icon: Brain, description: 'Claude Sonnet, Haiku, Opus' },
  { key: 'openrouter', label: 'OpenRouter', Icon: Globe, description: 'Access 100+ models via one API' },
  { key: 'glm', label: 'GLM (Z.ai)', Icon: Sparkles, description: 'GLM-4.6, GLM-4.5 — Zhipu AI' },
  { key: 'ollama', label: 'Ollama', Icon: HardDrive, description: 'Run models locally via Ollama' },
  { key: 'local', label: 'Local LLM', Icon: Monitor, description: 'LM Studio, vLLM, other OpenAI-compatible servers' },
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
      .catch((err: any) => setMessage(`Error: ${err.message || 'Unable to load settings'}`))
      .finally(() => setLoading(false));
  }, []);

  /** Omit masked/empty API keys so we never overwrite real secrets with placeholders. */
  const configPayload = (cfg: AIConfig) => {
    const { serverHasOpenaiKey, serverHasAnthropicKey, serverHasOpenrouterKey, serverHasGlmKey, ...rest } = cfg;
    const payload: Record<string, unknown> = { ...rest };
    for (const key of ['openaiApiKey', 'anthropicApiKey', 'openrouterApiKey', 'glmApiKey', 'localLlmApiKey', 'ollamaApiKey'] as const) {
      const val = cfg[key];
      if (!val || val === '***' || val.includes('...')) {
        delete payload[key];
      }
    }
    return payload;
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setMessage('');
    try {
      const payload = configPayload(config);
      // Ensure local provider has a valid model — empty string breaks LM Studio
      if (payload.activeProvider === 'local' && !payload.localLlmModel) {
        payload.localLlmModel = 'mistralai/ministral-3-3b';
      }
      const updated = await aiApi.updateConfig(payload);
      setConfig(updated);
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
      // Save first so backend uses latest keys (masked keys are omitted)
      if (config) {
        const updated = await aiApi.updateConfig(configPayload(config));
        setConfig(updated);
      }
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

  const fetchModels = (provider: Provider) => async () => {
    // Save config first so the backend uses the latest key/URL (masked keys omitted)
    if (config) {
      const updated = await aiApi.updateConfig(configPayload(config));
      setConfig(updated);
    }
    const res = await aiApi.listModels(provider);
    return res.models as string[];
  };

  if (loading) return <div className="animate-pulse text-muted-foreground">Loading settings…</div>;
  if (!config) return <p className="text-muted-foreground">Unable to load settings.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
              <ModelSelect
                value={config.openaiModel}
                onChange={(v) => updateField('openaiModel', v)}
                fetchModels={fetchModels('openai')}
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
              <ModelSelect
                value={config.anthropicModel}
                onChange={(v) => updateField('anthropicModel', v)}
                fetchModels={fetchModels('anthropic')}
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
              <ModelSelect
                value={config.openrouterModel}
                onChange={(v) => updateField('openrouterModel', v)}
                fetchModels={fetchModels('openrouter')}
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

        {/* GLM (Z.ai) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-4 w-4 text-purple-500" /> GLM (Z.ai)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>API Key</Label>
              <PasswordInput
                placeholder="Z.ai API key"
                value={config.glmApiKey}
                onChange={(e) => updateField('glmApiKey', e.target.value)}
              />
              {config.serverHasGlmKey && !config.glmApiKey && (
                <p className="text-xs text-green-600">✓ Server key available — no personal key needed</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Model</Label>
              <ModelSelect
                value={config.glmModel}
                onChange={(v) => updateField('glmModel', v)}
                fetchModels={fetchModels('glm')}
                placeholder="glm-4.6"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testConnection('glm')}
              disabled={testing === 'glm'}
            >
              {testing === 'glm' ? 'Testing…' : 'Test Connection'}
            </Button>
          </CardContent>
        </Card>

        {/* Ollama */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><HardDrive className="h-4 w-4 text-violet-500" /> Ollama</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Server URL</Label>
              <Input
                value={config.ollamaUrl}
                onChange={(e) => updateField('ollamaUrl', e.target.value)}
                placeholder="http://localhost:11434"
              />
            </div>
            <div className="space-y-1">
              <Label>Model</Label>
              <ModelSelect
                value={config.ollamaModel}
                onChange={(v) => updateField('ollamaModel', v)}
                fetchModels={fetchModels('ollama')}
                placeholder="llama3"
              />
              <p className="text-xs text-muted-foreground">
                Click ▾ to list models installed on your Ollama server.
              </p>
            </div>
            <div className="space-y-1">
              <Label>API Key</Label>
              <PasswordInput
                placeholder="Optional — only if your Ollama instance requires auth"
                value={config.ollamaApiKey}
                onChange={(e) => updateField('ollamaApiKey', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Standard Ollama setups need no key — leave empty unless you have set OLLAMA_API_KEY.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testConnection('ollama')}
              disabled={testing === 'ollama'}
            >
              {testing === 'ollama' ? 'Testing…' : 'Test Connection'}
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
                placeholder="http://localhost:1234"
              />
            </div>
            <div className="space-y-1">
              <Label>Model</Label>
              <ModelSelect
                value={config.localLlmModel}
                onChange={(v) => updateField('localLlmModel', v)}
                fetchModels={fetchModels('local')}
                placeholder="model-name"
              />
            </div>
            <div className="space-y-1">
              <Label>API Key</Label>
              <PasswordInput
                placeholder="Optional — only if your local server requires auth"
                value={config.localLlmApiKey}
                onChange={(e) => updateField('localLlmApiKey', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For LM Studio, vLLM, etc. (OpenAI-compatible). Sent as a Bearer token.
              </p>
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
              max={16384}
              value={config.maxTokens}
              onChange={(e) => updateField('maxTokens', parseInt(e.target.value) || 1024)}
            />
            <p className="text-xs text-muted-foreground">Controls max output length (64 – 16384). Reasoning models need higher values.</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving ? 'Saving…' : 'Save All Settings'}
      </Button>
    </div>
  );
}
