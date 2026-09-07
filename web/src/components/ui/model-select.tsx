'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
  /** Fetches the list of model IDs; undefined disables the dropdown. */
  fetchModels?: () => Promise<string[]>;
  placeholder?: string;
}

export function ModelSelect({ value, onChange, fetchModels, placeholder }: ModelSelectProps) {
  const [models, setModels] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const load = async () => {
    if (!fetchModels) return;
    setLoading(true);
    setError('');
    try {
      setModels(await fetchModels());
      setOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex gap-1">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        <button
          type="button"
          onClick={load}
          title="Load available models"
          className="flex h-10 shrink-0 items-center gap-1 rounded-md border border-input bg-card px-2.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {open && models.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-card shadow-lg">
          {models.map((m) => (
            <li key={m}>
              <button
                type="button"
                onClick={() => {
                  onChange(m);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                  m === value ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                {m}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}