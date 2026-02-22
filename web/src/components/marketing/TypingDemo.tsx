'use client';

import { useState, useEffect } from 'react';
import { useInView } from '@/hooks/useInView';

const DEMO_QUESTION = 'Why do you want to work at Acme Corp?';
const DEMO_ANSWER =
  "I'm drawn to Acme Corp's innovative approach to building developer tools that genuinely improve productivity. With 5 years of full-stack experience building scalable applications with React, Node.js, and TypeScript, I'm excited to contribute to your platform team and help shape the future of developer experience. Your recent launch of the AI-assisted code review tool particularly resonated with me — it aligns perfectly with my passion for using technology to eliminate repetitive work.";

export function TypingDemo() {
  const { ref, isInView } = useInView({ threshold: 0.3 });
  const [phase, setPhase] = useState<'idle' | 'clicking' | 'generating' | 'done'>('idle');
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (!isInView) return;

    // Phase 1: Wait, then "click" the button
    const t1 = setTimeout(() => setPhase('clicking'), 800);
    // Phase 2: Start generating after button "press"
    const t2 = setTimeout(() => setPhase('generating'), 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isInView]);

  useEffect(() => {
    if (phase !== 'generating') return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(DEMO_ANSWER.slice(0, i));
      if (i >= DEMO_ANSWER.length) {
        clearInterval(interval);
        setPhase('done');
      }
    }, 14);

    return () => clearInterval(interval);
  }, [phase]);

  const isLoading = phase === 'clicking' || phase === 'generating';
  const charCount = typedText.length;
  const maxChars = 500;

  return (
    <div ref={ref} className="w-full max-w-2xl mx-auto">
      {/* Browser chrome */}
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
        {/* Title bar */}
        <div className="bg-slate-800/80 border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-slate-700/60 rounded-lg px-4 py-1 text-xs text-slate-400 font-mono flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              jobs.lever.co/acme-corp/apply
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="bg-slate-900/90 p-6 sm:p-8">
          {/* Company header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                AC
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Acme Corp</h4>
                <p className="text-slate-400 text-xs">Senior Full Stack Developer</p>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-2">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              {DEMO_QUESTION} <span className="text-red-400">*</span>
            </label>

            {/* Textarea */}
            <div
              className={`relative rounded-xl border transition-all duration-300 ${
                phase === 'generating' || phase === 'done'
                  ? 'border-indigo-500/50 ring-2 ring-indigo-500/20'
                  : 'border-white/10'
              }`}
            >
              <div className="bg-slate-800/50 rounded-xl p-4 min-h-[140px] text-sm leading-relaxed">
                {typedText ? (
                  <span className="text-slate-200">{typedText}</span>
                ) : (
                  <span className="text-slate-500">Your answer...</span>
                )}
                {phase === 'generating' && (
                  <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-text-bottom animate-[blink_1s_ease-in-out_infinite]" />
                )}
              </div>

              {/* Char count */}
              {(phase === 'generating' || phase === 'done') && (
                <div className="absolute bottom-2 right-3 text-xs text-slate-500">
                  {charCount}/{maxChars}
                </div>
              )}
            </div>
          </div>

          {/* Button row */}
          <div className="flex items-center gap-3 mt-3">
            <button
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                phase === 'clicking'
                  ? 'bg-indigo-600 text-white scale-95'
                  : phase === 'generating'
                    ? 'bg-indigo-600/80 text-white/80'
                    : phase === 'done'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Generate Answer</span>
                </>
              )}
            </button>

            {phase === 'done' && (
              <span className="text-emerald-400 text-xs font-medium animate-slide-up flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Generated · {charCount} chars
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
