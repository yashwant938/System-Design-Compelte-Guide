import React, { useMemo, useState } from 'react';
import { CheckCircle2, Search, XCircle } from 'lucide-react';
import { GOF_PATTERNS_23, SOLID_PRINCIPLES } from '../data/gofPatterns23.js';
import CodeBlock from './CodeBlock.jsx';

export function SolidComparatorWidget() {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = SOLID_PRINCIPLES[activeIdx];

  return (
    <section className="notebook-card p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10.5px] font-mono uppercase tracking-wider text-ink-muted dark:text-paper-ink/60">
            Interactive SOLID Code Lab
          </div>
          <h3 className="font-display text-lg font-bold text-ink dark:text-paper-ink">
            Bad Violation vs Production Refactor
          </h3>
        </div>
        <div className="flex gap-1.5">
          {SOLID_PRINCIPLES.map((p, idx) => (
            <button
              key={p.letter}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`h-9 w-9 rounded-xl border-[1.5px] font-display text-sm font-bold transition-all ${
                idx === activeIdx
                  ? 'border-ink bg-sage text-ink shadow-tactile-sm dark:border-sage dark:bg-[#2F5D34] dark:text-[#E8F8E5]'
                  : 'border-ink/25 bg-paper text-ink-muted hover:text-ink dark:border-ink-border dark:bg-ink-elevated'
              }`}
            >
              {p.letter}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-ink/15 dark:border-ink-border bg-paper/75 dark:bg-ink-elevated/55 p-3.5">
        <div className="font-display text-base font-bold text-ink dark:text-paper-ink">{current.name}</div>
        <p className="mt-1 text-xs font-mono text-ink-muted dark:text-paper-ink/80">{current.tagline}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-coral-strong dark:text-[#FCA5A5]">
            <XCircle className="h-4 w-4" /> Violates {current.letter} (Coupled / Fragile)
          </div>
          <CodeBlock snippets={{ java: current.badCode }} />
        </div>
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-sage-strong dark:text-[#A9E49E]">
            <CheckCircle2 className="h-4 w-4" /> Clean Refactored ({current.letter} Compliant)
          </div>
          <CodeBlock snippets={{ java: current.goodCode }} />
        </div>
      </div>

      <div className="rounded-xl border border-sand-strong/35 bg-sand/35 dark:bg-sand-dark/65 px-3.5 py-2.5 text-xs font-mono text-ink dark:text-paper-ink/90">
        <strong>Interview Nuance: </strong>
        {current.trap}
      </div>
    </section>
  );
}

export function GofPatternsExplorerWidget() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('strategy');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GOF_PATTERNS_23.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (!q) return true;
      return `${p.name} ${p.category} ${p.intent} ${p.realWorld}`.toLowerCase().includes(q);
    });
  }, [category, query]);

  const activePattern =
    GOF_PATTERNS_23.find((p) => p.id === selectedId) || filtered[0] || GOF_PATTERNS_23[0];

  const catBadge = (cat) => {
    if (cat === 'Creational') return 'bg-periwinkle text-periwinkle-strong dark:bg-periwinkle-dark dark:text-[#93C5FD]';
    if (cat === 'Structural') return 'bg-lavender text-lavender-strong dark:bg-lavender-dark dark:text-[#C4B5FD]';
    return 'bg-sage text-sage-text dark:bg-sage-dark dark:text-[#A9E49E]';
  };

  return (
    <section className="notebook-card p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-mono uppercase tracking-wider text-ink-muted dark:text-paper-ink/60">
            Complete Gang of Four Reference · 23 / 23 Patterns
          </div>
          <h3 className="font-display text-lg font-bold text-ink dark:text-paper-ink">
            Interactive 23 Design Patterns Explorer
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Creational', 'Structural', 'Behavioral'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold border transition-colors ${
                category === cat
                  ? 'border-ink bg-sage text-ink dark:border-sage dark:bg-sage-dark dark:text-[#C9F2BE]'
                  : 'border-ink/15 bg-paper text-ink-muted hover:text-ink dark:border-ink-border dark:bg-ink-elevated'
              }`}
            >
              {cat}
              {cat === 'All' ? ' (23)' : cat === 'Creational' ? ' (5)' : cat === 'Structural' ? ' (7)' : ' (11)'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter input */}
      <div className="relative">
        <Search className="h-3.5 w-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter patterns by name or use-case (e.g., Undo, Cache, Lock, Pricing, Tree)..."
          className="w-full rounded-xl border border-ink/20 bg-paper pl-9 pr-3 py-2 text-xs font-mono text-ink dark:border-ink-border dark:bg-ink-elevated dark:text-paper-ink focus:outline-none focus:border-sage-strong"
        />
      </div>

      {/* Pattern selector chips */}
      <div className="flex flex-wrap gap-1.5">
        {filtered.map((p) => {
          const selected = p.id === activePattern?.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-mono transition-all ${
                selected
                  ? 'border-ink bg-sage/85 text-ink font-bold shadow-tactile-sm dark:border-sage dark:bg-[#2F5D34] dark:text-[#E8F8E5]'
                  : 'border-ink/15 bg-paper-card text-ink-muted hover:border-ink/40 hover:text-ink dark:border-ink-border dark:bg-ink-elevated dark:text-paper-ink/80'
              }`}
            >
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Pattern Deep Detail Card */}
      {activePattern && (
        <div className="rounded-2xl border border-ink/20 dark:border-ink-border bg-paper/70 dark:bg-ink-elevated/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-display text-xl font-bold text-ink dark:text-paper-ink">
              {activePattern.name}
            </h4>
            <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-mono font-bold ${catBadge(activePattern.category)}`}>
              {activePattern.category}
            </span>
          </div>
          <p className="text-xs font-mono leading-relaxed text-ink dark:text-paper-ink/90">
            <strong>Intent: </strong>
            {activePattern.intent}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="rounded-xl border border-ink/10 dark:border-ink-border bg-paper-card dark:bg-ink-card p-3">
              <div className="text-[10px] uppercase tracking-wider font-bold text-sage-strong dark:text-[#A9E49E]">
                Real-World Production Uses
              </div>
              <p className="mt-1 text-ink-muted dark:text-paper-ink/80">{activePattern.realWorld}</p>
            </div>
            <div className="rounded-xl border border-ink/10 dark:border-ink-border bg-paper-card dark:bg-ink-card p-3">
              <div className="text-[10px] uppercase tracking-wider font-bold text-coral-strong dark:text-[#FCA5A5]">
                Watch Out / Anti-Pattern
              </div>
              <p className="mt-1 text-ink-muted dark:text-paper-ink/80">{activePattern.antiPattern}</p>
            </div>
          </div>
          <CodeBlock
            snippets={{ java: activePattern.code }}
            title={`${activePattern.name} Pattern — Clean Reference`}
          />
        </div>
      )}
    </section>
  );
}
