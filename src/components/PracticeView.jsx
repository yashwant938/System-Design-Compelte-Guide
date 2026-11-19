import React, { useMemo, useState } from 'react';
import {
  Award,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle2,
  RotateCcw,
  Target,
  XCircle,
} from 'lucide-react';
import {
  COMPANY_RUBRICS,
  QUIZ_BANK,
  ROADMAP_60_DAYS,
} from '../data/practiceAndCheatsheets.js';

export default function PracticeView({
  roadmapChecked,
  onToggleRoadmap,
  onSaveQuizScore,
  quizHistory,
}) {
  const [section, setSection] = useState('quiz'); // 'quiz' | 'rubrics' | 'roadmap'
  const [domainFilter, setDomainFilter] = useState('All');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const domains = useMemo(
    () => ['All', ...Array.from(new Set(QUIZ_BANK.map((q) => q.domain)))],
    []
  );

  const activeQuestions = useMemo(() => {
    if (domainFilter === 'All') return QUIZ_BANK;
    return QUIZ_BANK.filter((q) => q.domain === domainFilter);
  }, [domainFilter]);

  const currentQ = activeQuestions[qIndex] || activeQuestions[0];
  const selectedOpt = currentQ ? answers[currentQ.id] : undefined;

  const answeredCount = activeQuestions.filter((q) => answers[q.id] !== undefined).length;
  const correctCount = activeQuestions.filter((q) => answers[q.id] === q.answer).length;

  const handleChooseOption = (optIdx) => {
    if (!currentQ || answers[currentQ.id] !== undefined) return;
    const next = { ...answers, [currentQ.id]: optIdx };
    setAnswers(next);
  };

  const handleFinishQuiz = () => {
    setSubmitted(true);
    const pct = Math.round((correctCount / Math.max(1, activeQuestions.length)) * 100);
    onSaveQuizScore?.({
      date: new Date().toLocaleDateString(),
      domain: domainFilter,
      score: correctCount,
      total: activeQuestions.length,
      pct,
    });
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setQIndex(0);
    setSubmitted(false);
  };

  const domainStats = useMemo(() => {
    const map = {};
    activeQuestions.forEach((q) => {
      if (!map[q.domain]) map[q.domain] = { total: 0, correct: 0 };
      map[q.domain].total++;
      if (answers[q.id] === q.answer) map[q.domain].correct++;
    });
    return Object.entries(map);
  }, [activeQuestions, answers]);

  const roadmapPct = Math.round((roadmapChecked.length / ROADMAP_60_DAYS.length) * 100);

  return (
    <div className="mx-auto max-w-[1320px] px-3 sm:px-5 py-6 space-y-5">
      {/* Header + Sub-nav */}
      <div className="notebook-card p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-sage-strong dark:text-[#A9E49E]">
              Microsoft · Google · Amazon · Meta Interview War Room
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mt-0.5">
              Interview <span className="term-highlight">Practice</span> &amp; Rubrics
            </h1>
            <p className="text-xs sm:text-[13px] font-mono text-ink-muted dark:text-paper-ink/75 mt-1 max-w-2xl">
              Drill {QUIZ_BANK.length} Staff-level HLD, In-The-Wild &amp; LLD scenario questions, inspect exact Big Tech hiring rubrics, and track your 60-day mastery roadmap.
            </p>
          </div>
          {quizHistory?.length > 0 && (
            <div className="rounded-xl border border-ink/20 bg-paper px-3.5 py-2 text-xs font-mono dark:border-ink-border dark:bg-ink-elevated">
              Best Recent Score: <strong>{Math.max(...quizHistory.map((h) => h.pct))}%</strong>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'quiz', label: `${QUIZ_BANK.length}-Q Staff Mock Exam`, icon: Target },
            { id: 'rubrics', label: 'Microsoft & FAANG Rubrics', icon: Building2 },
            { id: 'roadmap', label: `60-Day Study Plan (${roadmapPct}%)`, icon: CalendarCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = section === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSection(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-mono font-semibold transition-all ${
                  active
                    ? 'border-ink bg-sage text-ink shadow-tactile-sm dark:border-sage dark:bg-[#2F5D34] dark:text-[#E8F8E5]'
                    : 'border-ink/20 bg-paper text-ink-muted hover:text-ink dark:border-ink-border dark:bg-ink-elevated'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: 50-QUESTION MOCK EXAM */}
      {section === 'quiz' && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-8 space-y-4">
            {/* Filter strip */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {domains.map((dom) => (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => {
                      setDomainFilter(dom);
                      setQIndex(0);
                      setSubmitted(false);
                    }}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-mono font-semibold ${
                      domainFilter === dom
                        ? 'border-ink bg-sage text-ink dark:border-sage dark:bg-sage-dark dark:text-[#C9F2BE]'
                        : 'border-ink/15 bg-paper-card text-ink-muted dark:border-ink-border dark:bg-ink-card'
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>
              <button type="button" onClick={handleResetQuiz} className="notebook-btn text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>

            {submitted ? (
              <div className="notebook-card p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-ink bg-sage text-ink dark:bg-sage-dark dark:text-[#C9F2BE]">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-ink-muted">Mock Exam Report ({domainFilter})</div>
                    <h2 className="font-display text-2xl font-bold">
                      {correctCount} / {activeQuestions.length} Correct (
                      {Math.round((correctCount / Math.max(1, activeQuestions.length)) * 100)}%)
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {domainStats.map(([dom, st]) => {
                    const pct = Math.round((st.correct / st.total) * 100);
                    return (
                      <div key={dom} className="rounded-xl border border-ink/15 dark:border-ink-border bg-paper dark:bg-ink-elevated p-3 font-mono text-xs space-y-1.5">
                        <div className="flex justify-between font-bold">
                          <span>{dom}</span>
                          <span>{st.correct}/{st.total} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-paper-subtle dark:bg-ink-card overflow-hidden">
                          <div className="h-full bg-sage-strong" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setSubmitted(false)} className="notebook-btn">
                    Review Questions
                  </button>
                  <button type="button" onClick={handleResetQuiz} className="notebook-btn-primary">
                    Retake Exam
                  </button>
                </div>
              </div>
            ) : (
              <div className="notebook-card p-5 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-ink-muted">
                    QUESTION {qIndex + 1} / {activeQuestions.length}
                  </span>
                  <div className="flex gap-1.5">
                    <span className="rounded-full bg-lavender px-2.5 py-0.5 text-[10.5px] font-bold text-lavender-strong dark:bg-lavender-dark dark:text-[#C4B5FD]">
                      {currentQ.domain}
                    </span>
                    <span className="rounded-full bg-sand px-2.5 py-0.5 text-[10.5px] font-bold text-[#92400E] dark:bg-sand-dark dark:text-[#F5CF87]">
                      {currentQ.difficulty}
                    </span>
                  </div>
                </div>

                <h2 className="font-display text-lg sm:text-xl font-bold leading-snug">
                  {currentQ.q}
                </h2>

                <div className="space-y-2.5">
                  {currentQ.options.map((opt, idx) => {
                    const isPicked = selectedOpt === idx;
                    const isCorrect = idx === currentQ.answer;
                    const revealed = selectedOpt !== undefined;

                    let style =
                      'border-ink/20 bg-paper hover:border-ink/50 dark:border-ink-border dark:bg-ink-elevated';
                    if (revealed) {
                      if (isCorrect) {
                        style = 'border-sage-strong bg-sage/45 dark:bg-sage-dark/80 font-semibold';
                      } else if (isPicked && !isCorrect) {
                        style = 'border-coral-strong bg-coral/45 dark:bg-coral-dark/80';
                      } else {
                        style = 'border-ink/10 bg-paper/50 opacity-60 dark:border-ink-border dark:bg-ink-elevated/40';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={revealed}
                        onClick={() => handleChooseOption(idx)}
                        className={`w-full flex items-start justify-between gap-3 rounded-xl border p-3.5 text-left text-xs sm:text-[13px] font-mono transition-all ${style}`}
                      >
                        <span>
                          <strong className="mr-2">{String.fromCharCode(65 + idx)}.</strong>
                          {opt}
                        </span>
                        {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-strong dark:text-[#A9E49E]" />}
                        {revealed && isPicked && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-coral-strong dark:text-[#FCA5A5]" />}
                      </button>
                    );
                  })}
                </div>

                {selectedOpt !== undefined && (
                  <div className="rounded-xl border border-lavender-strong/35 bg-lavender/40 dark:bg-lavender-dark/65 p-4 text-xs font-mono leading-relaxed">
                    <div className="font-bold uppercase tracking-wider text-lavender-strong dark:text-[#C4B5FD] mb-1">
                      Staff Engineer Explanation
                    </div>
                    {currentQ.explanation}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={qIndex === 0}
                    onClick={() => setQIndex((i) => Math.max(0, i - 1))}
                    className="notebook-btn disabled:opacity-40"
                  >
                    ← Previous
                  </button>

                  {qIndex < activeQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setQIndex((i) => Math.min(activeQuestions.length - 1, i + 1))}
                      className="notebook-btn-primary"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button type="button" onClick={handleFinishQuiz} className="notebook-btn-primary">
                      View Score Report
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Question Palette */}
          <aside className="lg:col-span-4 notebook-card p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold uppercase text-ink-muted">Question Grid</span>
              <span>
                {correctCount}/{answeredCount} right ({answeredCount}/{activeQuestions.length} done)
              </span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-1.5">
              {activeQuestions.map((q, idx) => {
                const ans = answers[q.id];
                const isCur = idx === qIndex;
                let cls = 'border-ink/20 bg-paper text-ink-muted dark:border-ink-border dark:bg-ink-elevated';
                if (ans !== undefined) {
                  cls =
                    ans === q.answer
                      ? 'border-sage-strong bg-sage/60 text-ink font-bold dark:bg-sage-dark dark:text-[#A9E49E]'
                      : 'border-coral-strong bg-coral/60 text-coral-strong font-bold dark:bg-coral-dark dark:text-[#FCA5A5]';
                }
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setQIndex(idx);
                    }}
                    className={`h-8 rounded-lg border text-xs font-mono transition-all ${cls} ${
                      isCur ? 'ring-2 ring-ink dark:ring-sage scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={handleFinishQuiz} className="notebook-btn w-full text-xs">
              Generate Score Breakdown Now
            </button>
          </aside>
        </div>
      )}

      {/* SECTION 2: MICROSOFT & FAANG RUBRICS */}
      {section === 'rubrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {COMPANY_RUBRICS.map((rubric) => (
            <div key={rubric.company} className="notebook-card p-5 space-y-3.5">
              <div>
                <h2 className="font-display text-xl font-bold">{rubric.company}</h2>
                <p className="text-xs font-mono text-sage-strong dark:text-[#A9E49E] mt-0.5">{rubric.focus}</p>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-[10.5px] uppercase font-bold text-ink-muted">Evaluation Axes</div>
                <ul className="space-y-1 list-disc pl-4 text-ink/90 dark:text-paper-ink/85">
                  {rubric.evaluationAxes.map((ax, i) => <li key={i}>{ax}</li>)}
                </ul>
              </div>

              <div className="rounded-xl border border-sage-strong/35 bg-sage/25 dark:bg-sage-dark/65 p-3 text-xs font-mono space-y-1">
                <div className="text-[10.5px] uppercase font-bold text-sage-text dark:text-[#A9E49E]">Strong Hire Signals</div>
                <ul className="space-y-1 list-disc pl-4">
                  {rubric.strongHireSignals.map((sig, i) => <li key={i}>{sig}</li>)}
                </ul>
              </div>

              <div className="rounded-xl border border-coral-strong/35 bg-coral/25 dark:bg-coral-dark/65 p-3 text-xs font-mono space-y-1">
                <div className="text-[10.5px] uppercase font-bold text-coral-strong dark:text-[#FCA5A5]">Automatic Red Flags</div>
                <ul className="space-y-1 list-disc pl-4">
                  {rubric.redFlags.map((rf, i) => <li key={i}>{rf}</li>)}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {rubric.topAsked.map((t) => (
                  <span key={t} className="rounded-full border border-ink/20 bg-paper px-2.5 py-0.5 text-[10.5px] font-mono dark:border-ink-border dark:bg-ink-elevated">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: 60-DAY STUDY ROADMAP */}
      {section === 'roadmap' && (
        <div className="notebook-card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-bold">60-Day Microsoft &amp; Big Tech Mastery Plan</h2>
              <p className="text-xs font-mono text-ink-muted">Check off milestones as you complete them — saved automatically in your browser.</p>
            </div>
            <span className="rounded-full border border-ink bg-sage px-3 py-1 text-xs font-mono font-bold text-ink dark:bg-sage-dark dark:text-[#C9F2BE]">
              {roadmapChecked.length} / {ROADMAP_60_DAYS.length} Milestones ({roadmapPct}%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ROADMAP_60_DAYS.map((item) => {
              const checked = roadmapChecked.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleRoadmap(item.id)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    checked
                      ? 'border-sage-strong/60 bg-sage/25 dark:bg-sage-dark/60'
                      : 'border-ink/15 bg-paper hover:border-ink/40 dark:border-ink-border dark:bg-ink-elevated/60'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      checked
                        ? 'border-sage-strong bg-sage text-ink dark:bg-[#2F5D34] dark:text-[#E8F8E5]'
                        : 'border-ink/35 bg-paper-card dark:border-ink-border dark:bg-ink-card'
                    }`}
                  >
                    {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </span>
                  <div className="space-y-0.5">
                    <div className="text-[10.5px] font-mono uppercase font-bold text-sage-strong dark:text-[#A9E49E]">
                      {item.week}
                    </div>
                    <div className={`font-display text-sm font-bold ${checked ? 'line-through opacity-75' : ''}`}>
                      {item.title}
                    </div>
                    <p className="text-[11.5px] font-mono text-ink-muted dark:text-paper-ink/75">
                      {item.detail}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
