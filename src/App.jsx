import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, FlaskConical, Layers, Target } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import LearnView from './components/LearnView.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import { GofPatternsExplorerWidget, SolidComparatorWidget } from './components/GofPatternsExplorer.jsx';
import { CURRICULUM_MODULES, findLessonById, getAllLessons } from './data/curriculum.js';
import { GOF_PATTERNS_23 } from './data/gofPatterns23.js';
import { loadProgress, saveProgress } from './utils/storage.js';

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  if (!raw) return { tab: 'learn', lessonId: 'cdn', step: 1 };
  const parts = raw.split('/').filter(Boolean);
  if (parts[0] === 'lab' || parts[0] === 'practice' || parts[0] === 'cheatsheets') {
    return { tab: parts[0], lessonId: 'cdn', step: 1, subId: parts[1] || null };
  }
  const lessonId = parts[0];
  const step = Math.max(1, parseInt(parts[1] || '1', 10) || 1);
  return { tab: 'learn', lessonId, step };
}

export default function App() {
  const [progress, setProgress] = useState(() => loadProgress());
  const [route, setRoute] = useState(() => parseHash());
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const isDark = progress.theme === 'dark';

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  // Persist progress to localStorage
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Sync with browser hash changes (#/<slug>/<step>)
  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Global Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const allLessons = useMemo(() => getAllLessons(), []);
  const activeEntry = useMemo(() => {
    return findLessonById(route.lessonId) || findLessonById('cdn') || allLessons[0] || null;
  }, [route.lessonId, allLessons]);

  const navigateLesson = useCallback((lessonId, step = 1) => {
    window.location.hash = `#/${lessonId}/${step}`;
    setRoute({ tab: 'learn', lessonId, step });
  }, []);

  const navigateTab = useCallback((tab, subId = null) => {
    if (tab === 'learn') {
      const targetId = activeEntry?.lesson?.id || 'cdn';
      window.location.hash = `#/${targetId}/${route.step || 1}`;
      setRoute({ tab: 'learn', lessonId: targetId, step: route.step || 1 });
    } else {
      window.location.hash = subId ? `#/${tab}/${subId}` : `#/${tab}`;
      setRoute((prev) => ({ ...prev, tab, subId }));
    }
  }, [activeEntry, route.step]);

  const handleToggleComplete = useCallback((lessonId, forceValue) => {
    setProgress((prev) => {
      const exists = prev.completedIds.includes(lessonId);
      const shouldBeDone = typeof forceValue === 'boolean' ? forceValue : !exists;
      if (shouldBeDone === exists) return prev;
      return {
        ...prev,
        completedIds: shouldBeDone
          ? [...prev.completedIds, lessonId]
          : prev.completedIds.filter((id) => id !== lessonId),
      };
    });
  }, []);

  const handleToggleBookmark = useCallback((lessonId) => {
    setProgress((prev) => {
      const exists = prev.bookmarkedIds.includes(lessonId);
      return {
        ...prev,
        bookmarkedIds: exists
          ? prev.bookmarkedIds.filter((id) => id !== lessonId)
          : [...prev.bookmarkedIds, lessonId],
      };
    });
  }, []);

  const handleToggleTheme = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const handleToggleSidebar = useCallback(() => {
    if (window.innerWidth >= 1280) {
      setDesktopSidebarCollapsed((v) => !v);
    } else {
      setMobileSidebarOpen((v) => !v);
    }
  }, []);

  const searchItems = useMemo(() => {
    const lessonItems = allLessons.map(({ lesson, moduleMeta }) => ({
      id: `lesson:${lesson.id}`,
      kind: 'lesson',
      lessonId: lesson.id,
      title: lesson.title,
      subtitle: lesson.subtitle,
      category: `${moduleMeta.number}. ${moduleMeta.title} (${moduleMeta.track.toUpperCase()})`,
      tags: [...(lesson.tags || []), ...(lesson.companies || [])],
    }));

    const patternItems = GOF_PATTERNS_23.map((p) => ({
      id: `pattern:${p.id}`,
      kind: 'lesson',
      lessonId: 'lld-gof-patterns',
      title: `${p.name} Pattern (${p.category})`,
      subtitle: p.intent,
      category: 'GoF Design Pattern · LLD',
      tags: [p.category, p.realWorld],
    }));

    return [...lessonItems, ...patternItems];
  }, [allLessons]);

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink dark:bg-ink-canvas dark:text-paper-ink">
      <Navbar
        activeTab={route.tab}
        onSelectTab={(t) => navigateTab(t)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleSidebar={handleToggleSidebar}
        completedCount={progress.completedIds.length}
        totalLessons={allLessons.length}
      />

      <div className="flex flex-1 min-h-0">
        {route.tab === 'learn' && (
          <Sidebar
            modules={CURRICULUM_MODULES}
            activeLessonId={activeEntry?.lesson?.id}
            completedIds={progress.completedIds}
            onSelectLesson={(id, st) => navigateLesson(id, st)}
            openMobile={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            desktopCollapsed={desktopSidebarCollapsed}
          />
        )}

        <main className="flex-1 min-w-0">
          {route.tab === 'learn' && activeEntry && (
            <LearnView
              lesson={activeEntry.lesson}
              moduleMeta={activeEntry.moduleMeta}
              lessonIndexInModule={activeEntry.lessonIndexInModule}
              stepNumber={route.step}
              onChangeStep={(st) => navigateLesson(activeEntry.lesson.id, st)}
              nextLesson={activeEntry.nextLesson}
              prevLesson={activeEntry.prevLesson}
              onSelectLesson={(id, st) => navigateLesson(id, st)}
              isCompleted={progress.completedIds.includes(activeEntry.lesson.id)}
              onToggleComplete={handleToggleComplete}
              isBookmarked={progress.bookmarkedIds.includes(activeEntry.lesson.id)}
              onToggleBookmark={handleToggleBookmark}
              isDark={isDark}
              extraBottomSlot={
                activeEntry.lesson.widget === 'solid-comparator' ? (
                  <SolidComparatorWidget />
                ) : activeEntry.lesson.widget === 'gof-explorer' ? (
                  <GofPatternsExplorerWidget />
                ) : null
              }
            />
          )}

          {route.tab !== 'learn' && (
            <div className="mx-auto max-w-4xl px-4 py-12">
              <div className="notebook-card p-8 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-ink/25 bg-sage/50 dark:bg-sage-dark">
                  {route.tab === 'lab' && <FlaskConical className="h-6 w-6" />}
                  {route.tab === 'practice' && <Target className="h-6 w-6" />}
                  {route.tab === 'cheatsheets' && <Layers className="h-6 w-6" />}
                </div>
                <h2 className="font-display text-2xl font-bold capitalize">
                  {route.tab === 'lab' ? 'Interactive Design Lab' : route.tab === 'practice' ? 'Interview Practice Arena' : 'Visual Cheatsheets'}
                </h2>
                <p className="text-xs font-mono text-ink-muted dark:text-paper-ink/75 max-w-lg mx-auto">
                  PR #1 establishes the Isometric Stage Engine and Modules 01–02. Interactive Simulators, 55-Question Mock Exam, Company Rubrics, and Visual Cheatsheets are being added cleanly in PR #6!
                </p>
                <button type="button" onClick={() => navigateTab('learn')} className="notebook-btn-primary">
                  Continue Interactive Course
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={searchItems}
        onSelect={(item) => {
          if (item.kind === 'lesson') navigateLesson(item.lessonId, 1);
        }}
      />
    </div>
  );
}
