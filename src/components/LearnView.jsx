import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  Info,
  Layers,
  ListChecks,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import IsometricStage from './IsometricStage.jsx';
import CodeBlock from './CodeBlock.jsx';
import { renderRichText } from '../utils/richText.jsx';

const STAGE_BADGE_CLASS = {
  PROBLEM: 'bg-coral text-coral-strong border-coral-strong/40 dark:bg-coral-dark dark:text-[#FCA5A5]',
  INSIGHT: 'bg-lavender text-lavender-strong border-lavender-strong/40 dark:bg-lavender-dark dark:text-[#C4B5FD]',
  SOLUTION: 'bg-sage text-sage-text border-sage-strong/40 dark:bg-sage-dark dark:text-[#A9E49E]',
  TECHNIQUE: 'bg-periwinkle text-periwinkle-strong border-periwinkle-strong/40 dark:bg-periwinkle-dark dark:text-[#93C5FD]',
  SETUP: 'bg-sand text-[#92400E] border-sand-strong/40 dark:bg-sand-dark dark:text-[#F5CF87]',
  TRADEOFF: 'bg-sand text-[#92400E] border-sand-strong/40 dark:bg-sand-dark dark:text-[#F5CF87]',
  CODE: 'bg-lavender text-lavender-strong border-lavender-strong/40 dark:bg-lavender-dark dark:text-[#C4B5FD]',
  RECAP: 'bg-sage text-sage-text border-sage-strong/40 dark:bg-sage-dark dark:text-[#A9E49E]',
};

const CALLOUT_STYLE = {
  'WATCH OUT': {
    wrap: 'border-coral-strong/35 bg-coral/35 dark:border-coral/30 dark:bg-coral-dark/65',
    title: 'text-coral-strong dark:text-[#FCA5A5]',
    icon: AlertTriangle,
  },
  'KEY IDEA': {
    wrap: 'border-lavender-strong/35 bg-lavender/45 dark:border-lavender/30 dark:bg-lavender-dark/65',
    title: 'text-lavender-strong dark:text-[#C4B5FD]',
    icon: Sparkles,
  },
  'GOOD TO KNOW': {
    wrap: 'border-sage-strong/35 bg-sage/30 dark:border-sage/30 dark:bg-sage-dark/65',
    title: 'text-sage-text dark:text-[#A9E49E]',
    icon: Info,
  },
  'INTERVIEW SIGNAL': {
    wrap: 'border-sand-strong/35 bg-sand/40 dark:border-sand/30 dark:bg-sand-dark/65',
    title: 'text-[#92400E] dark:text-[#F5CF87]',
    icon: Compass,
  },
};

export default function LearnView({
  lesson,
  moduleMeta,
  lessonIndexInModule,
  stepNumber,
  onChangeStep,
  nextLesson,
  prevLesson,
  onSelectLesson,
  isCompleted,
  onToggleComplete,
  isBookmarked,
  onToggleBookmark,
  isDark,
  extraBottomSlot,
}) {
  const [paused, setPaused] = useState(false);
  const [replayNonce, setReplayNonce] = useState(1);
  const [vaultTab, setVaultTab] = useState('tradeoffs');

  const steps = lesson?.steps || [];
  const safeStepIdx = Math.max(0, Math.min(steps.length - 1, (stepNumber || 1) - 1));
  const currentStep = steps[safeStepIdx];

  // Reset vault tab when switching lessons
  useEffect(() => {
    if (lesson?.deepDive?.codeSnippets) {
      setVaultTab('code');
    } else {
      setVaultTab('tradeoffs');
    }
  }, [lesson?.id]);

  // Keyboard shortcuts: Left/Right arrows step, R replay, Space pause
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (safeStepIdx < steps.length - 1) {
          onChangeStep(safeStepIdx + 2);
        } else if (nextLesson) {
          onSelectLesson(nextLesson.id, 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (safeStepIdx > 0) {
          onChangeStep(safeStepIdx);
        } else if (prevLesson) {
          onSelectLesson(prevLesson.id, prevLesson.steps.length);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setReplayNonce((n) => n + 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [safeStepIdx, steps.length, onChangeStep, nextLesson, prevLesson, onSelectLesson]);

  if (!lesson || !currentStep) return null;

  const isLastStep = safeStepIdx === steps.length - 1;
  const nextStepObj = !isLastStep ? steps[safeStepIdx + 1] : null;
  const calloutCfg = currentStep.callout ? CALLOUT_STYLE[currentStep.callout.type] || CALLOUT_STYLE['KEY IDEA'] : null;
  const CalloutIcon = calloutCfg?.icon;

  // How many objectives are checked off based on step progress
  const objectives = lesson.objectives || [];
  const checkedObjectiveCount = isLastStep
    ? objectives.length
    : Math.floor(((safeStepIdx + 1) / Math.max(1, steps.length)) * objectives.length);

  const deepDive = lesson.deepDive;
  const availableVaultTabs = [];
  if (deepDive?.codeSnippets) availableVaultTabs.push({ id: 'code', label: 'Production Code', icon: Code2 });
  if (deepDive?.tradeoffs?.length) availableVaultTabs.push({ id: 'tradeoffs', label: 'Trade-offs & Comparison', icon: Layers });
  if (deepDive?.capacityMath?.length) availableVaultTabs.push({ id: 'math', label: 'Numbers & Schema', icon: ListChecks });
  if (deepDive?.failureModes?.length) availableVaultTabs.push({ id: 'failures', label: 'Failures & Interview Traps', icon: ShieldAlert });
  const activeVault = availableVaultTabs.some((t) => t.id === vaultTab)
    ? vaultTab
    : availableVaultTabs[0]?.id;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-5 py-4 sm:py-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* CENTER STAGE COLUMN (8 cols on lg+) */}
        <div className="lg:col-span-8 space-y-4 min-w-0">
          {/* Lesson Header + Isometric Stage Card */}
          <section className="notebook-card p-4 sm:p-5 space-y-4">
            {/* Breadcrumb & Meta Row */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="text-[11px] font-mono text-ink-muted dark:text-paper-ink/65">
                  {moduleMeta?.number}. {moduleMeta?.title} / Lesson {lessonIndexInModule + 1} of{' '}
                  {moduleMeta?.lessons?.length || 1}
                  {lesson.companies?.length ? (
                    <span className="ml-2 text-sage-strong dark:text-[#A9E49E]">
                      · {lesson.companies.join(' · ')}
                    </span>
                  ) : null}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-paper-ink">
                  {renderRichText(lesson.title)}
                </h1>
                <p className="text-xs sm:text-[13px] font-mono text-ink-muted dark:text-paper-ink/75 max-w-2xl">
                  {renderRichText(lesson.subtitle)}
                </p>
              </div>

              {/* Badges + Mark Complete + Bookmark */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 rounded-full border border-ink/50 bg-sand px-2.5 py-1 text-[11px] font-mono font-semibold text-ink dark:border-sand/40 dark:bg-sand-dark dark:text-[#F5CF87]">
                  <Clock className="h-3 w-3" />
                  {lesson.duration}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-ink/50 bg-sage px-2.5 py-1 text-[11px] font-mono font-semibold text-ink dark:border-sage/40 dark:bg-sage-dark dark:text-[#A9E49E]">
                  {lesson.level}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-ink/50 bg-lavender px-2.5 py-1 text-[11px] font-mono font-semibold text-ink dark:border-lavender/40 dark:bg-lavender-dark dark:text-[#C4B5FD]">
                  {steps.length} steps
                </span>
                <button
                  type="button"
                  onClick={() => onToggleComplete(lesson.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-[11px] font-mono font-bold transition-colors ${
                    isCompleted
                      ? 'border-sage-strong bg-sage text-ink shadow-tactile-sm dark:border-sage dark:bg-[#2F5D34] dark:text-[#E8F8E5]'
                      : 'border-ink/60 bg-paper-card text-ink hover:bg-sage/45 dark:border-paper-ink/40 dark:bg-ink-elevated dark:text-paper-ink'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isCompleted ? 'Completed' : 'Mark Complete'}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleBookmark(lesson.id)}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                    isBookmarked
                      ? 'border-ink bg-sand text-ink dark:border-amber-400 dark:bg-sand-dark dark:text-amber-300'
                      : 'border-ink/25 bg-paper text-ink-muted hover:text-ink dark:border-ink-border dark:bg-ink-elevated'
                  }`}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Interactive 2.5D Isometric Visual Stage */}
            <IsometricStage
              scene={currentStep.scene}
              isDark={isDark}
              paused={paused}
              onTogglePause={() => setPaused((p) => !p)}
              replayNonce={replayNonce}
              onReplay={() => setReplayNonce((n) => n + 1)}
              title={`${lesson.title} — ${currentStep.title}`}
            />
          </section>

          {/* Horizontal Step Progress Bar (`IN THIS LESSON`) */}
          <section className="notebook-card p-4">
            <div className="flex items-center justify-between text-[11px] font-mono mb-3">
              <span className="font-bold uppercase tracking-wider text-ink-muted dark:text-paper-ink/70">
                IN THIS LESSON
              </span>
              <span className="text-ink-muted dark:text-paper-ink/70">
                Step {safeStepIdx + 1} of {steps.length}
              </span>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="flex items-start w-full justify-between gap-1">
                {steps.map((st, idx) => {
                  const isCurrent = idx === safeStepIdx;
                  const isVisited = idx < safeStepIdx;
                  return (
                    <React.Fragment key={idx}>
                      <button
                        type="button"
                        onClick={() => onChangeStep(idx + 1)}
                        className="group flex flex-col items-center flex-1 min-w-[60px] text-center"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] font-mono text-xs font-bold transition-all ${
                            isCurrent
                              ? 'border-ink bg-sage text-ink scale-105 shadow-tactile-sm dark:border-sage dark:bg-[#2F5D34] dark:text-[#E8F8E5]'
                              : isVisited
                              ? 'border-sage-strong/70 bg-sage/35 text-sage-text dark:border-sage/40 dark:bg-sage-dark dark:text-[#A9E49E]'
                              : 'border-ink/30 bg-paper text-ink-muted group-hover:border-ink/60 dark:border-ink-border dark:bg-ink-elevated dark:text-paper-ink/65'
                          }`}
                        >
                          {isVisited ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                        </div>
                        <span
                          className={`mt-1.5 text-[10px] font-mono leading-tight line-clamp-2 ${
                            isCurrent
                              ? 'font-bold text-ink dark:text-paper-ink'
                              : 'text-ink-muted dark:text-paper-ink/60'
                          }`}
                        >
                          {st.shortLabel || st.title}
                        </span>
                      </button>
                      {idx < steps.length - 1 && (
                        <div
                          className={`mt-4 h-[1.5px] flex-shrink w-3 sm:w-5 ${
                            idx < safeStepIdx ? 'bg-sage-strong' : 'bg-ink/20 dark:bg-ink-border'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Optional Extra Interactive Widget (e.g., 23 GoF Patterns Explorer or SOLID Comparator) */}
          {extraBottomSlot}

          {/* Deep Engineering Spec & Interview Vault */}
          {availableVaultTabs.length > 0 && (
            <section className="notebook-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/15 dark:border-ink-border bg-paper/75 dark:bg-ink-elevated/60 px-4 py-2.5">
                <div className="font-display text-sm font-bold text-ink dark:text-paper-ink">
                  Staff-Level Deep Engineering Vault
                </div>
                <div className="flex flex-wrap gap-1">
                  {availableVaultTabs.map((t) => {
                    const Icon = t.icon;
                    const active = activeVault === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setVaultTab(t.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors ${
                          active
                            ? 'bg-sage text-ink border border-ink/40 dark:bg-sage-dark dark:text-[#C9F2BE]'
                            : 'text-ink-muted hover:text-ink dark:text-paper-ink/70'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {activeVault === 'code' && deepDive?.codeSnippets && (
                  <CodeBlock
                    snippets={deepDive.codeSnippets}
                    title={deepDive.codeTitle || `${lesson.title} — Production Reference`}
                  />
                )}

                {activeVault === 'tradeoffs' && deepDive?.tradeoffs && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="border-b border-ink/20 dark:border-ink-border text-[10.5px] uppercase tracking-wider text-ink-muted dark:text-paper-ink/60">
                          <th className="py-2 pr-4">Option / Pattern</th>
                          <th className="py-2 pr-4">Best When</th>
                          <th className="py-2 pr-4">Pros</th>
                          <th className="py-2">Trade-offs / Pitfalls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/10 dark:divide-ink-border">
                        {deepDive.tradeoffs.map((row, idx) => (
                          <tr key={idx} className="align-top">
                            <td className="py-2.5 pr-4 font-bold text-ink dark:text-paper-ink whitespace-nowrap">
                              {row.option}
                            </td>
                            <td className="py-2.5 pr-4 text-ink-muted dark:text-paper-ink/80">{row.bestWhen}</td>
                            <td className="py-2.5 pr-4 text-sage-text dark:text-[#A9E49E]">{row.pros}</td>
                            <td className="py-2.5 text-coral-strong dark:text-[#FCA5A5]">{row.cons}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeVault === 'math' && deepDive?.capacityMath && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {deepDive.capacityMath.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-ink/15 dark:border-ink-border bg-paper/70 dark:bg-ink-elevated/60 p-3"
                      >
                        <div className="text-[10.5px] font-mono uppercase tracking-wider text-ink-muted dark:text-paper-ink/65">
                          {item.label}
                        </div>
                        <div className="font-display text-base font-bold text-ink dark:text-paper-ink mt-0.5">
                          {item.value}
                        </div>
                        {item.formula && (
                          <div className="mt-1 text-[11px] font-mono text-ink-muted dark:text-paper-ink/70">
                            {item.formula}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeVault === 'failures' && deepDive?.failureModes && (
                  <div className="space-y-3">
                    {deepDive.failureModes.map((fm, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-ink/15 dark:border-ink-border bg-paper/65 dark:bg-ink-elevated/50 p-3.5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-coral px-2 py-0.5 text-[10px] font-mono font-bold text-coral-strong dark:bg-coral-dark dark:text-[#FCA5A5]">
                            TRAP / FAILURE
                          </span>
                          <h4 className="font-display text-sm font-bold text-ink dark:text-paper-ink">
                            {fm.title}
                          </h4>
                        </div>
                        <p className="mt-1.5 text-xs font-mono leading-relaxed text-ink-muted dark:text-paper-ink/80">
                          <strong className="text-ink dark:text-paper-ink">Mitigation: </strong>
                          {fm.mitigation}
                        </p>
                        {fm.interviewProbe && (
                          <p className="mt-1.5 text-[11.5px] font-mono text-lavender-strong dark:text-[#C4B5FD]">
                            <strong>Interviewer Probe: </strong>
                            {fm.interviewProbe}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT NARRATIVE & OBJECTIVES COLUMN (4 cols on lg+) */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-[4.5rem]">
          {/* Step Narrative Card */}
          <div className="notebook-card p-5 space-y-4">
            {/* Step eyebrow + semantic badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-ink-muted dark:text-paper-ink/70">
                STEP {safeStepIdx + 1} / {steps.length}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-mono font-bold uppercase tracking-wider ${
                  STAGE_BADGE_CLASS[currentStep.stage] || STAGE_BADGE_CLASS.SETUP
                }`}
              >
                {currentStep.stage || 'CONCEPT'}
              </span>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug text-ink dark:text-paper-ink">
              {renderRichText(currentStep.title)}
            </h2>

            {/* Body Paragraphs */}
            <div className="space-y-3 text-[12.5px] leading-relaxed font-mono text-ink/90 dark:text-paper-ink/85">
              {(currentStep.body || []).map((para, idx) => (
                <p key={idx}>{renderRichText(para)}</p>
              ))}
            </div>

            {/* Typed Callout Box */}
            {currentStep.callout && calloutCfg && (
              <div className={`rounded-xl border p-3.5 ${calloutCfg.wrap}`}>
                <div className={`flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider ${calloutCfg.title}`}>
                  <CalloutIcon className="h-4 w-4 shrink-0" />
                  {currentStep.callout.type}
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed font-mono text-ink/90 dark:text-paper-ink/90">
                  {renderRichText(currentStep.callout.text)}
                </p>
              </div>
            )}

            {/* WHAT CHANGED Architectural Diff */}
            {currentStep.changes && currentStep.changes.length > 0 && (
              <div className="rounded-xl border border-ink/15 dark:border-ink-border bg-paper/75 dark:bg-ink-elevated/65 p-3.5 space-y-1.5">
                <div className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-ink-muted dark:text-paper-ink/65">
                  WHAT CHANGED
                </div>
                <ul className="space-y-1 text-[11.5px] font-mono">
                  {currentStep.changes.map((ch, idx) => {
                    const isAdd = ch.startsWith('+');
                    const isMod = ch.startsWith('~');
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        <span
                          className={`font-bold shrink-0 ${
                            isAdd
                              ? 'text-sage-strong dark:text-[#9AE68E]'
                              : isMod
                              ? 'text-sand-strong dark:text-[#F5CF87]'
                              : 'text-coral-strong dark:text-[#FCA5A5]'
                          }`}
                        >
                          {ch.slice(0, 1)}
                        </span>
                        <span className="text-ink/90 dark:text-paper-ink/85">{renderRichText(ch.slice(1).trim())}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Back / Next Step CTA Row */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                disabled={safeStepIdx === 0 && !prevLesson}
                onClick={() => {
                  if (safeStepIdx > 0) onChangeStep(safeStepIdx);
                  else if (prevLesson) onSelectLesson(prevLesson.id, prevLesson.steps.length);
                }}
                className="notebook-btn disabled:opacity-40 disabled:pointer-events-none shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={() => onChangeStep(safeStepIdx + 2)}
                  className="notebook-btn-primary flex-1 justify-between text-left"
                >
                  <span className="truncate">
                    Next: {nextStepObj?.shortLabel || nextStepObj?.title}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              ) : nextLesson ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!isCompleted) onToggleComplete(lesson.id, true);
                    onSelectLesson(nextLesson.id, 1);
                  }}
                  className="notebook-btn-primary flex-1 justify-between text-left"
                >
                  <span className="truncate">Complete &amp; Next: {nextLesson.title}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggleComplete(lesson.id, true)}
                  className="notebook-btn-primary flex-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isCompleted ? 'Completed ✓' : 'Complete Lesson'}
                </button>
              )}
            </div>

            {/* Direct One-Click Complete Toggle on Every Step */}
            <button
              type="button"
              onClick={() => onToggleComplete(lesson.id)}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-mono font-bold transition-colors ${
                isCompleted
                  ? 'border-sage-strong bg-sage/55 text-sage-text dark:border-sage dark:bg-sage-dark dark:text-[#C9F2BE]'
                  : 'border-ink/25 bg-paper text-ink hover:bg-sage/30 dark:border-ink-border dark:bg-ink-elevated dark:text-paper-ink'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isCompleted ? 'Lesson Completed ✓ (Click to Undo)' : 'Mark This Lesson Complete'}
            </button>

            <div className="text-center text-[10.5px] font-mono text-ink-muted dark:text-paper-ink/55">
              ← → step · R replay · Space pause
            </div>
          </div>

          {/* YOU'LL LEARN Auto-Checking Objectives Card */}
          <div className="notebook-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted dark:text-paper-ink/70">
                YOU&apos;LL LEARN
              </span>
              <button
                type="button"
                onClick={() => onToggleComplete(lesson.id, !isCompleted)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-mono font-semibold border transition-colors ${
                  isCompleted
                    ? 'border-sage-strong/50 bg-sage/50 text-sage-text dark:bg-sage-dark dark:text-[#A9E49E]'
                    : 'border-ink/20 bg-paper text-ink-muted hover:text-ink dark:border-ink-border dark:bg-ink-elevated'
                }`}
              >
                <Check className="h-3 w-3" />
                {isCompleted ? 'Mastered' : 'Mark Done'}
              </button>
            </div>
            <ul className="space-y-2.5">
              {objectives.map((obj, idx) => {
                const checked = isCompleted || idx < checkedObjectiveCount;
                return (
                  <li key={idx} className="flex items-start gap-2.5 text-xs font-mono">
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        checked
                          ? 'border-sage-strong bg-sage text-ink dark:border-sage dark:bg-[#2F5D34] dark:text-[#E8F8E5]'
                          : 'border-ink/35 bg-paper dark:border-ink-border dark:bg-ink-elevated'
                      }`}
                    >
                      {checked && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                    <span
                      className={
                        checked
                          ? 'text-ink dark:text-paper-ink'
                          : 'text-ink-muted dark:text-paper-ink/70'
                      }
                    >
                      {renderRichText(obj)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
