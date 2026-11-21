import React, { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { DESIGN_REVIEWS, getStageProgress } from '../data/designReviews.js';

export default function DesignReviews({ designReviews, onChangeDesignReviews }) {
  const currentCase = DESIGN_REVIEWS.find((item) => item.id === designReviews?.activeCaseId) || DESIGN_REVIEWS[0];
  const record = designReviews?.cases?.[currentCase.id];
  const stage = currentCase.stages.find((item) => item.id === record?.stageId) || currentCase.stages[0];
  const stageIndex = currentCase.stages.indexOf(stage);
  const progress = getStageProgress(record, stage);
  const reviewedCount = currentCase.stages.filter((item) => getStageProgress(record, item).reviewed).length;
  const headingRef = useRef(null);
  const focusNextHeading = useRef(false);

  useEffect(() => {
    if (focusNextHeading.current) {
      headingRef.current?.focus();
      focusNextHeading.current = false;
    }
  }, [stage.id]);

  function updateCase(change) {
    onChangeDesignReviews((previous) => ({
      ...previous,
      activeCaseId: currentCase.id,
      cases: {
        ...previous?.cases,
        [currentCase.id]: change(previous?.cases?.[currentCase.id] || {}),
      },
    }));
  }

  function selectStage(id) {
    updateCase((saved) => ({ ...saved, stageId: id }));
  }

  function setNote(note) {
    updateCase((saved) => ({ ...saved, notes: { ...saved.notes, [stage.id]: note } }));
  }

  function setCriterion(key, selected) {
    updateCase((saved) => {
      const { checked } = getStageProgress(saved, stage);
      const next = checked.filter((criterion) => criterion !== key);
      if (selected) next.push(key);
      return { ...saved, checks: { ...saved.checks, [stage.id]: next } };
    });
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)]">
      <aside className="notebook-card p-4 sm:p-5 space-y-4">
        <div>
          <label htmlFor="design-case" className="block font-display text-lg font-bold">Choose a design review</label>
          <select
            id="design-case"
            className="mt-2 w-full rounded-lg border border-ink/30 bg-paper p-2 text-sm dark:border-ink-border dark:bg-ink-elevated"
            value={currentCase.id}
            onChange={(event) => {
              const id = event.target.value;
              onChangeDesignReviews((previous) => ({ ...previous, activeCaseId: id }));
            }}
          >
            {DESIGN_REVIEWS.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </div>

        <p className="font-display text-base leading-relaxed">{currentCase.brief}</p>
        <div>
          <h2 className="font-display font-bold">Workload and constraints</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-xs leading-relaxed">
            {currentCase.assumptions.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
        <div className="border-t border-ink/15 pt-3 dark:border-ink-border">
          <h2 className="text-xs font-bold">Related lessons</h2>
          <ul className="mt-1 space-y-1 text-xs">
            {currentCase.lessons.map((lesson) => (
              <li key={lesson.id}>
                <a href={'#/' + lesson.id + '/1'} className="inline-block py-1 underline underline-offset-4">
                  {lesson.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section aria-label={currentCase.title + ' design review'} className="notebook-card min-w-0 p-4 sm:p-6 space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold">{currentCase.title}</h2>
            <span role="status" className="text-xs font-bold text-sage-text dark:text-[#A9E49E]">
              {reviewedCount} of {currentCase.stages.length} stages reviewed
            </span>
          </div>
          <nav aria-label="Design review stages" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {currentCase.stages.map((item, index) => {
              const reviewed = getStageProgress(record, item).reviewed;
              return (
                <button
                  type="button"
                  key={item.id}
                  aria-current={stage.id === item.id ? 'step' : undefined}
                  onClick={() => selectStage(item.id)}
                  className={'flex min-h-11 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-xs font-semibold ' + (
                    item.id === stage.id
                      ? 'border-ink bg-sage text-ink dark:border-sage dark:bg-sage-dark dark:text-[#C9F2BE]'
                      : 'border-ink/20 bg-paper hover:border-ink/50 dark:border-ink-border dark:bg-ink-elevated'
                  )}
                >
                  <span>{index + 1}. {item.title}</span>
                  {reviewed && <><CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="sr-only">Reviewed</span></>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2">
          <h3 tabIndex={-1} ref={headingRef} className="font-display text-xl font-bold">{stage.title}</h3>
          <p id="design-prompt" className="text-sm leading-relaxed">{stage.prompt}</p>
        </div>

        <div>
          <label htmlFor="design-note" className="block text-sm font-bold">Your design notes</label>
          <textarea
            id="design-note"
            aria-describedby="design-prompt"
            rows={5}
            className="mt-2 block w-full resize-y rounded-xl border border-ink/30 bg-paper p-3 text-sm leading-relaxed dark:border-ink-border dark:bg-ink-elevated"
            value={progress.note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <details key={currentCase.id + '/' + stage.id} className="rounded-xl border border-lavender-strong/35 bg-lavender/30 px-3.5 dark:bg-lavender-dark/60">
          <summary className="cursor-pointer py-3 text-sm font-semibold">Compare with a worked answer</summary>
          <div className="space-y-2 pb-3 text-sm leading-relaxed">
            {stage.answer.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </details>

        <fieldset className="space-y-2">
          <legend className="font-display text-base font-bold">Evidence in your notes</legend>
          <p className="text-xs leading-relaxed">Check each point you can support. A stage counts as reviewed when it has notes and every point is checked.</p>
          {Object.entries(stage.checks).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-xs leading-relaxed dark:border-ink-border dark:bg-ink-elevated">
              <input
                type="checkbox"
                checked={progress.checked.includes(key)}
                onChange={(event) => setCriterion(key, event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-sage-strong"
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
        {stageIndex < currentCase.stages.length - 1 && (
          <button
            type="button"
            className="notebook-btn"
            onClick={() => {
              focusNextHeading.current = true;
              selectStage(currentCase.stages[stageIndex + 1].id);
            }}
          >
            Next stage →
          </button>
        )}
      </section>
    </div>
  );
}
