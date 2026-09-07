'use client';

import { useState, useEffect } from 'react';
import { useInView } from '@/hooks/useInView';
import { Crosshair } from 'lucide-react';

const FIELDS = [
  { label: 'Full name', value: 'Jordan Lee', delay: 600 },
  { label: 'Email', value: 'jordan@example.com', delay: 1200 },
  { label: 'LinkedIn', value: 'linkedin.com/in/jordanlee', delay: 1800 },
  {
    label: 'Why do you want this role?',
    value:
      "I'm drawn to your platform team's focus on developer productivity. With five years building React and Node services, I'm ready to help ship tools that remove repetitive work.",
    delay: 2600,
    multiline: true,
  },
];

export function TypingDemo() {
  const { ref, isInView } = useInView({ threshold: 0.25 });
  const [filled, setFilled] = useState<number[]>([]);
  const [typingIndex, setTypingIndex] = useState(-1);
  const [typedChars, setTypedChars] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    setFilled([]);
    setTypingIndex(-1);
    setTypedChars(0);
    setPopupVisible(false);

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPopupVisible(true), 400));

    FIELDS.forEach((field, i) => {
      timers.push(
        setTimeout(() => {
          setTypingIndex(i);
          setTypedChars(0);
        }, field.delay),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  useEffect(() => {
    if (typingIndex < 0 || typingIndex >= FIELDS.length) return;
    const target = FIELDS[typingIndex].value;
    if (typedChars >= target.length) {
      setFilled((prev) => (prev.includes(typingIndex) ? prev : [...prev, typingIndex]));
      return;
    }

    const speed = FIELDS[typingIndex].multiline ? 8 : 28;
    const t = setTimeout(() => setTypedChars((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [typingIndex, typedChars]);

  return (
    <div ref={ref} className="relative w-full max-w-3xl mx-auto">
      {/* Browser chrome */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_24px_48px_-24px_rgba(14,17,22,0.25)]">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <div className="ml-3 flex-1 truncate rounded bg-background px-3 py-1 text-xs text-muted-foreground">
            careers.acme.com/apply/senior-engineer
          </div>
        </div>

        <div className="relative grid gap-0 md:grid-cols-[1fr_200px]">
          {/* Form */}
          <div className="space-y-4 p-6 md:p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Acme Corp
              </p>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Senior Software Engineer
              </h3>
            </div>

            {FIELDS.map((field, i) => {
              const isTyping = typingIndex === i;
              const isDone = filled.includes(i);
              const display = isDone
                ? field.value
                : isTyping
                  ? field.value.slice(0, typedChars)
                  : '';

              return (
                <div key={field.label}>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {field.label}
                  </label>
                  <div
                    className={`rounded border bg-background px-3 py-2 text-sm text-foreground transition-colors ${
                      isTyping ? 'border-forest ring-2 ring-citrus/40' : 'border-border'
                    } ${field.multiline ? 'min-h-[88px]' : ''}`}
                  >
                    {display || (
                      <span className="text-muted-foreground/50">
                        {field.multiline ? 'Write your answer…' : '—'}
                      </span>
                    )}
                    {isTyping && !isDone && (
                      <span className="ml-0.5 inline-block h-4 w-0.5 bg-forest align-middle animate-[blink_1s_ease-in-out_infinite]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Extension popup mock */}
          <div
            className={`border-t border-border bg-secondary/40 p-4 transition-all duration-500 md:border-l md:border-t-0 ${
              popupVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-forest text-citrus">
                <Crosshair className="h-3 w-3" strokeWidth={2.5} />
              </div>
              <span className="font-display text-sm font-semibold">JobHunter</span>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Greenhouse detected · 4 fields
            </p>
            <div className="mb-2 rounded border border-border bg-card px-2.5 py-2 text-xs">
              <span className="text-muted-foreground">Status</span>
              <p className="mt-0.5 font-medium text-forest">
                {filled.length === FIELDS.length
                  ? 'Form filled'
                  : typingIndex >= 0
                    ? `Filling… ${filled.length + 1}/${FIELDS.length}`
                    : 'Ready'}
              </p>
            </div>
            <button
              type="button"
              className="w-full rounded bg-forest px-3 py-2 text-xs font-semibold text-citrus"
              tabIndex={-1}
            >
              Auto-fill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
