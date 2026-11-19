import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  LogOut,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  X,
} from 'lucide-react';
import { decodeSyncCode, encodeSyncCode } from '../utils/storage.js';

const TARGETS = [
  'Microsoft (L60–L65)',
  'Google (L4–L6)',
  'Amazon (SDE2/SDE3)',
  'Meta (E4–E6)',
  'All Big Tech',
];

export function OneTimeLoginModal({ onLogin, onRestoreSync }) {
  const [mode, setMode] = useState('setup'); // 'setup' | 'restore'
  const [name, setName] = useState('');
  const [target, setTarget] = useState(TARGETS[0]);
  const [syncInput, setSyncInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'restore') {
      try {
        const restored = decodeSyncCode(syncInput);
        onRestoreSync(restored.user, restored.progress);
      } catch {
        setError('That sync code looks invalid. Paste the full code copied from your other device.');
      }
      return;
    }

    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter a display name for your study workspace.');
      return;
    }
    onLogin({ name: cleanName, target });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border-[1.5px] border-ink bg-paper-card p-6 shadow-tactile dark:border-paper-ink/40 dark:bg-ink-card space-y-5">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-sage-strong/40 bg-sage/45 px-3 py-1 text-[11px] font-mono font-bold text-sage-text dark:bg-sage-dark dark:text-[#C9F2BE]">
            <Sparkles className="h-3.5 w-3.5" /> One-Time Workspace Setup
          </div>
          <h1 className="font-display text-2xl font-bold text-ink dark:text-paper-ink">
            System <span className="term-highlight">Design</span> Study Atlas
          </h1>
          <p className="text-xs font-mono text-ink-muted dark:text-paper-ink/75">
            Set your study name once to track completed lessons (0 / 100), bookmarks, your 60-day plan, and 100-Q exam scores. Saved automatically — never asked again on this browser.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-ink/15 bg-paper p-1 dark:border-ink-border dark:bg-ink-elevated">
          <button
            type="button"
            onClick={() => { setMode('setup'); setError(''); }}
            className={`rounded-lg py-1.5 text-xs font-mono font-semibold transition-colors ${
              mode === 'setup'
                ? 'bg-sage text-ink border border-ink/30 dark:bg-sage-dark dark:text-[#C9F2BE]'
                : 'text-ink-muted'
            }`}
          >
            Start Workspace
          </button>
          <button
            type="button"
            onClick={() => { setMode('restore'); setError(''); }}
            className={`rounded-lg py-1.5 text-xs font-mono font-semibold transition-colors ${
              mode === 'restore'
                ? 'bg-sage text-ink border border-ink/30 dark:bg-sage-dark dark:text-[#C9F2BE]'
                : 'text-ink-muted'
            }`}
          >
            Restore Sync Code
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'setup' ? (
            <>
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold uppercase text-ink-muted">
                  Your Study Name / Nickname
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Yashwant"
                  className="w-full rounded-xl border border-ink/25 bg-paper px-3.5 py-2.5 text-sm font-mono text-ink dark:border-ink-border dark:bg-ink-elevated dark:text-paper-ink focus:outline-none focus:border-sage-strong"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase text-ink-muted">
                  Target Interview Track
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TARGETS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTarget(t)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors ${
                        target === t
                          ? 'border-ink bg-sage text-ink dark:border-sage dark:bg-sage-dark dark:text-[#C9F2BE]'
                          : 'border-ink/15 bg-paper text-ink-muted dark:border-ink-border dark:bg-ink-elevated'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase text-ink-muted">
                Paste Progress Sync Code
              </label>
              <textarea
                rows={4}
                value={syncInput}
                onChange={(e) => setSyncInput(e.target.value)}
                placeholder="Paste your saved Sync Code from another device..."
                className="w-full rounded-xl border border-ink/25 bg-paper p-3 text-xs font-mono text-ink dark:border-ink-border dark:bg-ink-elevated dark:text-paper-ink focus:outline-none focus:border-sage-strong"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-coral-strong/40 bg-coral/35 px-3 py-2 text-xs font-mono text-coral-strong dark:bg-coral-dark dark:text-[#FCA5A5]">
              {error}
            </div>
          )}

          <button type="submit" className="notebook-btn-primary w-full py-3 text-sm">
            {mode === 'setup' ? 'Save Once & Start Learning' : 'Restore Profile & Progress'}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-mono text-ink-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-sage-strong" />
            100% local &amp; private · No password or email required
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProfilePopover({
  open,
  onClose,
  user,
  progress,
  completedCount,
  totalLessons,
  onRestoreSync,
  onSignOut,
}) {
  const [copied, setCopied] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importErr, setImportErr] = useState('');

  if (!open || !user) return null;

  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handleCopySync = async () => {
    try {
      const code = encodeSyncCode(user, progress);
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleImport = () => {
    setImportErr('');
    try {
      const parsed = decodeSyncCode(importCode);
      onRestoreSync(parsed.user, parsed.progress);
      setImportOpen(false);
      setImportCode('');
      onClose();
    } catch {
      setImportErr('Invalid sync code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-5 bg-ink/30" onClick={onClose}>
      <div
        className="mt-12 w-full max-w-sm rounded-2xl border-[1.5px] border-ink bg-paper-card p-4 shadow-tactile dark:border-paper-ink/40 dark:bg-ink-card space-y-3.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink bg-sage font-display text-sm font-bold text-ink dark:bg-sage-dark dark:text-[#C9F2BE]">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold truncate">{user.name}</div>
              <div className="text-[10.5px] font-mono text-sage-strong dark:text-[#A9E49E] font-semibold">
                Target: {user.target}
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-ink-muted hover:bg-paper-subtle dark:hover:bg-ink-elevated">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mastery Summary */}
        <div className="rounded-xl border border-ink/15 dark:border-ink-border bg-paper dark:bg-ink-elevated p-3 space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span>Completed Lessons</span>
            <strong>{completedCount} / {totalLessons} ({pct}%)</strong>
          </div>
          <div className="h-2 rounded-full bg-paper-subtle dark:bg-ink-card overflow-hidden">
            <div className="h-full bg-sage-strong transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Cross-Device Sync */}
        <div className="space-y-2">
          <div className="text-[10.5px] font-mono uppercase font-bold text-ink-muted">
            Cross-Device Progress Sync
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={handleCopySync} className="notebook-btn text-[11px] py-2">
              {copied ? <Check className="h-3.5 w-3.5 text-sage-strong" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Code Copied!' : 'Copy Sync Code'}
            </button>
            <button type="button" onClick={() => setImportOpen((v) => !v)} className="notebook-btn text-[11px] py-2">
              <Upload className="h-3.5 w-3.5" /> Restore Code
            </button>
          </div>

          {importOpen && (
            <div className="space-y-2 pt-1">
              <textarea
                rows={3}
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Paste sync code here..."
                className="w-full rounded-lg border border-ink/20 bg-paper p-2 text-[11px] font-mono dark:border-ink-border dark:bg-ink-elevated"
              />
              {importErr && <div className="text-[11px] font-mono text-coral-strong">{importErr}</div>}
              <button type="button" onClick={handleImport} className="notebook-btn-primary w-full text-xs py-1.5">
                <Download className="h-3.5 w-3.5" /> Apply Restored Progress
              </button>
            </div>
          )}
        </div>

        {/* Switch Profile */}
        <div className="pt-2 border-t border-ink/10 dark:border-ink-border flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-ink-muted">
            <User className="h-3 w-3" /> Remembered permanently
          </span>
          <button
            type="button"
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-coral-strong/40 bg-coral/25 px-2.5 py-1 text-[11px] font-mono font-semibold text-coral-strong hover:bg-coral/40 dark:bg-coral-dark dark:text-[#FCA5A5]"
          >
            <LogOut className="h-3.5 w-3.5" /> Switch Profile
          </button>
        </div>
      </div>
    </div>
  );
}
