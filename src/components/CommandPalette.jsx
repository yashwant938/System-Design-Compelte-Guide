import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, FlaskConical, Layers, Search, ShieldCheck, X } from 'lucide-react';

export default function CommandPalette({ open, onClose, items, onSelect }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 14);
    return items
      .filter((it) => {
        const hay = `${it.title} ${it.subtitle || ''} ${it.category || ''} ${(it.tags || []).join(' ')}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 18);
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        onSelect(filtered[selectedIndex]);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, selectedIndex, onSelect, onClose]);

  if (!open) return null;

  const getIcon = (kind) => {
    if (kind === 'lab') return <FlaskConical className="h-4 w-4 text-lavender-strong dark:text-purple-300" />;
    if (kind === 'practice') return <ShieldCheck className="h-4 w-4 text-sage-strong dark:text-emerald-300" />;
    if (kind === 'cheatsheet') return <Layers className="h-4 w-4 text-sand-strong dark:text-amber-300" />;
    return <BookOpen className="h-4 w-4 text-periwinkle-strong dark:text-blue-300" />;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/55 backdrop-blur-sm px-4 pt-16 sm:pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border-[1.5px] border-ink bg-paper-card shadow-tactile dark:border-paper-ink/40 dark:bg-ink-card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ink/15 dark:border-ink-border">
          <Search className="h-4 w-4 text-ink-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search HLD, LLD, patterns, Kafka, Raft, Parking Lot, Uber, CDN..."
            className="w-full bg-transparent text-sm font-mono text-ink dark:text-paper-ink placeholder:text-ink-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ink-muted hover:bg-paper-subtle dark:hover:bg-ink-elevated"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs font-mono text-ink-muted">
              No matching lessons, patterns, or labs for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  idx === selectedIndex
                    ? 'bg-sage/45 dark:bg-sage-dark border border-ink/25 dark:border-sage/40'
                    : 'hover:bg-paper-subtle dark:hover:bg-ink-elevated border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/15 bg-paper dark:border-ink-border dark:bg-ink-elevated">
                    {getIcon(item.kind)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold text-ink dark:text-paper-ink truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] font-mono text-ink-muted dark:text-paper-ink/65 truncate">
                      {item.category} {item.subtitle ? `· ${item.subtitle}` : ''}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-ink/10 dark:border-ink-border bg-paper/70 dark:bg-ink-elevated/50 text-[11px] font-mono text-ink-muted">
          <span>↑↓ navigate · Enter open · Esc close</span>
          <span>{filtered.length} matches</span>
        </div>
      </div>
    </div>
  );
}
