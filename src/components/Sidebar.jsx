import React, { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Circle, X } from 'lucide-react';

export default function Sidebar({
  modules,
  activeLessonId,
  completedIds,
  onSelectLesson,
  onToggleComplete,
  openMobile,
  onCloseMobile,
  desktopCollapsed,
}) {
  const [trackFilter, setTrackFilter] = useState('all'); // 'all' | 'hld' | 'lld'
  const activeModuleId = useMemo(() => {
    const found = modules.find((m) => m.lessons.some((l) => l.id === activeLessonId));
    return found?.id || modules[0]?.id;
  }, [modules, activeLessonId]);

  const [expandedModules, setExpandedModules] = useState(() => ({
    [activeModuleId]: true,
  }));

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const filteredModules = useMemo(() => {
    if (trackFilter === 'all') return modules;
    return modules.filter((m) => m.track === trackFilter);
  }, [modules, trackFilter]);

  const totalLessons = useMemo(
    () => modules.reduce((acc, m) => acc + m.lessons.length, 0),
    [modules]
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-paper-card dark:bg-ink-card border-r border-ink/15 dark:border-ink-border">
      {/* Header */}
      <div className="p-3.5 border-b border-ink/10 dark:border-ink-border">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-ink-muted dark:text-paper-ink/60">
              Complete Curriculum
            </div>
            <div className="font-display text-sm font-bold text-ink dark:text-paper-ink">
              Course · {totalLessons} lessons
            </div>
          </div>
          {openMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="xl:hidden rounded-lg p-1.5 text-ink-muted hover:bg-paper-subtle dark:hover:bg-ink-elevated"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Track Filter Pills */}
        <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-xl bg-paper p-1 border border-ink/10 dark:bg-ink-elevated dark:border-ink-border">
          {[
            { id: 'all', label: 'All' },
            { id: 'hld', label: 'HLD' },
            { id: 'lld', label: 'LLD' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTrackFilter(t.id)}
              className={`rounded-lg py-1 text-[11px] font-mono font-semibold transition-colors ${
                trackFilter === t.id
                  ? 'bg-sage text-ink border border-ink/30 dark:bg-sage-dark dark:text-[#C9F2BE]'
                  : 'text-ink-muted hover:text-ink dark:text-paper-ink/65'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Module Accordion List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {filteredModules.map((mod) => {
          const isOpen = expandedModules[mod.id] ?? mod.id === activeModuleId;
          const modCompleted = mod.lessons.filter((l) => completedIds.includes(l.id)).length;
          const allDone = modCompleted === mod.lessons.length && mod.lessons.length > 0;

          return (
            <div
              key={mod.id}
              className="rounded-xl border border-ink/10 dark:border-ink-border bg-paper/55 dark:bg-ink-elevated/40 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-paper-subtle/70 dark:hover:bg-ink-elevated transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                  )}
                  <span className="font-display text-xs font-bold text-ink dark:text-paper-ink truncate">
                    {mod.number}. {mod.title}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
                    allDone
                      ? 'bg-sage text-ink dark:bg-sage-dark dark:text-[#A9E49E]'
                      : 'bg-paper-card text-ink-muted border border-ink/10 dark:bg-ink-card dark:text-paper-ink/65'
                  }`}
                >
                  {modCompleted}/{mod.lessons.length}
                </span>
              </button>

              {isOpen && (
                <div className="px-1.5 pb-2 space-y-0.5">
                  {mod.lessons.map((lesson, idx) => {
                    const isActive = lesson.id === activeLessonId;
                    const isDone = completedIds.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={`w-full flex items-center justify-between gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11.5px] font-mono transition-all ${
                          isActive
                            ? 'bg-sage/75 text-ink font-semibold border border-ink/35 dark:bg-sage-dark dark:text-[#D5F5CC] dark:border-sage/50'
                            : 'text-ink-muted hover:bg-paper-card hover:text-ink dark:text-paper-ink/75 dark:hover:bg-ink-card'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectLesson(lesson.id, 1);
                            onCloseMobile?.();
                          }}
                          className="flex-1 min-w-0 text-left truncate py-0.5"
                        >
                          {idx + 1}. {lesson.title}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete?.(lesson.id);
                          }}
                          title={isDone ? 'Completed — click to undo' : 'Click to mark complete'}
                          aria-label={isDone ? `Unmark ${lesson.title} complete` : `Mark ${lesson.title} complete`}
                          className="shrink-0 rounded-full p-0.5 hover:scale-110 transition-transform"
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-sage-strong dark:text-[#9AE68E]" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 opacity-40 hover:opacity-90" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Progress Footer */}
      <div className="p-3 border-t border-ink/10 dark:border-ink-border bg-paper/70 dark:bg-ink-elevated/50">
        <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted dark:text-paper-ink/70 mb-1.5">
          <span>Mastery Progress</span>
          <span className="font-bold text-ink dark:text-paper-ink">
            {completedIds.length} / {totalLessons}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-paper-subtle dark:bg-ink-card overflow-hidden border border-ink/15 dark:border-ink-border">
          <div
            className="h-full bg-sage-strong transition-all duration-300"
            style={{
              width: `${totalLessons > 0 ? Math.min(100, (completedIds.length / totalLessons) * 100) : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      {!desktopCollapsed && (
        <aside className="hidden xl:block w-[278px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]">
          {sidebarContent}
        </aside>
      )}

      {/* Slide-over Drawer (Mobile & Collapsed Desktop) */}
      {openMobile && (
        <div className="fixed inset-0 z-40 flex bg-ink/50 backdrop-blur-xs" onClick={onCloseMobile}>
          <div className="w-[300px] max-w-[85vw] h-full" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
