import React, { useState } from 'react';
import { ArrowRight, Bookmark, CheckCircle2, ChevronDown } from 'lucide-react';
import { CURRICULUM_MODULES, findLessonById } from '../data/curriculum.js';
import { STUDY_PATHS } from '../data/studyPaths.js';

function LessonLink({ lesson, complete }) {
  return (
    <a href={`#/${lesson.id}/1`} className="flex items-baseline justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-sage/30 focus-visible:outline-offset-2">
      {lesson.title}
      {complete && <CheckCircle2 aria-label="Completed" className="h-4 w-4 shrink-0 self-center text-sage-strong" />}
    </a>
  );
}

export default function CourseMap({ progress, totalLessons }) {
  const [pathId, setPathId] = useState(STUDY_PATHS[0].id);
  const path = STUDY_PATHS.find((item) => item.id === pathId);
  const completed = new Set(progress.completedIds);
  const saved = progress.bookmarkedIds.map((id) => findLessonById(id)?.lesson).filter(Boolean);
  const last = findLessonById(progress.lastVisited?.itemId)?.lesson;
  const resume = last || CURRICULUM_MODULES[0].lessons[0];
  const step = last ? Math.min(last.steps.length, Math.max(1, progress.lastVisited.step || 1)) : 1;
  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
      <header className="notebook-card space-y-4 p-5 sm:p-7">
        <p className="text-xs font-mono text-ink-muted dark:text-paper-ink/70">{CURRICULUM_MODULES.length} modules · {totalLessons} lessons</p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">System design curriculum</h1>
        <p className="max-w-2xl text-sm">Follow a study path, explore a module, or practice explaining a design from requirements through recovery.</p>
        <div className="flex flex-wrap items-center gap-3">
          <a href={`#/${resume.id}/${step}`} className="notebook-btn-primary text-left text-xs">
            {last ? 'Resume' : 'Start'} · {resume.title} <ArrowRight className="h-4 w-4 shrink-0" />
          </a>
          <a href="#/practice/reviews" className="notebook-btn text-xs">Practice a design review</a>
        </div>
      </header>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <section className="notebook-card p-5">
          <h2 className="mb-3 font-display text-xl font-bold">All modules</h2>
          {CURRICULUM_MODULES.map((mod) => (
            <details key={mod.id} className="border-t border-ink/15 py-1 dark:border-ink-border">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded py-2.5 text-left">
                <span className="text-xs font-mono text-ink-muted dark:text-paper-ink/70">{mod.number}</span>
                <span className="flex-1 font-display font-bold">{mod.title}</span>
                <span title="Completed lessons" className="text-xs font-mono">{mod.lessons.filter((lesson) => completed.has(lesson.id)).length}/{mod.lessons.length}</span>
                <ChevronDown className="h-4 w-4" />
              </summary>
              <ul className="pb-2 pl-5">{mod.lessons.map((lesson) => (
                <li key={lesson.id}><LessonLink lesson={lesson} complete={completed.has(lesson.id)} /></li>
              ))}</ul>
            </details>
          ))}
        </section>
        <div className="space-y-5">
          <section className="notebook-card space-y-3 p-5">
            <h2 className="font-display text-xl font-bold"><label htmlFor="study-path">Study paths</label></h2>
            <select id="study-path" value={pathId} onChange={(event) => setPathId(event.target.value)} className="w-full rounded-lg border border-ink/30 bg-paper p-2 text-sm dark:bg-ink-elevated">
              {STUDY_PATHS.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
            <p className="text-sm text-ink-muted dark:text-paper-ink/75">{path.outcome}</p>
            <ol className="list-decimal pl-6 marker:font-mono marker:text-sm">
              {path.lessons.map((id) => <li key={id}><LessonLink lesson={findLessonById(id).lesson} complete={completed.has(id)} /></li>)}
            </ol>
            <a href={path.exercise.href} className="notebook-btn text-left text-xs">{path.exercise.title} <ArrowRight className="h-4 w-4 shrink-0" /></a>
          </section>
          <section className="notebook-card p-5">
            <h2 className="mb-2 flex items-center gap-2 font-display text-xl font-bold"><Bookmark className="h-4 w-4" /> Bookmarks</h2>
            {saved.length ? <ul>{saved.map((lesson) => <li key={lesson.id}><LessonLink lesson={lesson} complete={completed.has(lesson.id)} /></li>)}</ul>
              : <p className="text-sm text-ink-muted dark:text-paper-ink/75">Use the bookmark beside a lesson title to save it here.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
