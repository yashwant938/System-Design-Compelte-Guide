import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import LearnView from './components/LearnView.jsx';
import DesignLabView from './components/DesignLabView.jsx';
import PracticeView from './components/PracticeView.jsx';
import CheatsheetsView from './components/CheatsheetsView.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import { GofPatternsExplorerWidget, SolidComparatorWidget } from './components/GofPatternsExplorer.jsx';
import { CURRICULUM_MODULES, findLessonById, getAllLessons } from './data/curriculum.js';
import { GOF_PATTERNS_23 } from './data/gofPatterns23.js';
import { loadProgress, saveProgress } from './utils/storage.js';

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  if (!raw) return { tab: 'learn', lessonId: 'cdn', step: 1, subId: null };
  const parts = raw.split('/').filter(Boolean);
  if (parts[0] === 'lab' || parts[0] === 'practice' || parts[0] === 'cheatsheets') {
    return { tab: parts[0], lessonId: 'cdn', step: 1, subId: parts[1] || null };
  }
  const lessonId = parts[0];
  const step = Math.max(1, parseInt(parts[1] || '1', 10) || 1);
  return { tab: 'learn', lessonId, step, subId: null };
}

export default function App() {
  const [progress, setProgress] = useState(() => loadProgress());
  const [route, setRoute] = useState(() => parseHash());
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const isDark = progress.theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
    setRoute({ tab: 'learn', lessonId, step, subId: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateTab = useCallback(
    (tab, subId = null) => {
      if (tab === 'learn') {
        const targetId = activeEntry?.lesson?.id || 'cdn';
        window.location.hash = `#/${targetId}/${route.step || 1}`;
        setRoute({ tab: 'learn', lessonId: targetId, step: route.step || 1, subId: null });
      } else {
        window.location.hash = subId ? `#/${tab}/${subId}` : `#/${tab}`;
        setRoute((prev) => ({ ...prev, tab, subId }));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [activeEntry, route.step]
  );

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

  const handleToggleRoadmap = useCallback((milestoneId) => {
    setProgress((prev) => {
      const exists = prev.roadmapChecked.includes(milestoneId);
      return {
        ...prev,
        roadmapChecked: exists
          ? prev.roadmapChecked.filter((id) => id !== milestoneId)
          : [...prev.roadmapChecked, milestoneId],
      };
    });
  }, []);

  const handleSaveQuizScore = useCallback((record) => {
    setProgress((prev) => ({
      ...prev,
      quizHistory: [record, ...(prev.quizHistory || [])].slice(0, 10),
    }));
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

    const labItems = [
      { id: 'lab:hashing', kind: 'lab', subId: 'hashing', title: 'Consistent Hashing Ring Simulator', subtitle: 'Interactive vNodes & remapping % comparison', category: 'Design Lab' },
      { id: 'lab:ratelimiter', kind: 'lab', subId: 'ratelimiter', title: 'Rate Limiter Arena', subtitle: 'Token Bucket vs Fixed vs Sliding Window burst test', category: 'Design Lab' },
      { id: 'lab:cache', kind: 'lab', subId: 'cache', title: 'LRU Eviction & Cache Stampede Lab', subtitle: 'O(1) Doubly-Linked List + Single-Flight coalescing', category: 'Design Lab' },
      { id: 'lab:quorum', kind: 'lab', subId: 'quorum', title: 'Quorum (W+R>N) & 5-Node Raft Lab', subtitle: 'Kill nodes and test Raft majority elections', category: 'Design Lab' },
      { id: 'lab:capacity', kind: 'lab', subId: 'capacity', title: 'Back-of-the-Envelope Napkin Math Estimator', subtitle: 'QPS, 5-year TB, Gbps, Cache RAM & Shards', category: 'Design Lab' },
      { id: 'lab:lld', kind: 'lab', subId: 'lld', title: 'LLD Seat Lock Race & Elevator LOOK Lab', subtitle: 'BookMyShow concurrency + 3-car LOOK dispatcher', category: 'Design Lab' },
      { id: 'practice:exam', kind: 'practice', title: '75-Question Staff HLD, In-The-Wild & LLD Mock Exam', subtitle: 'Microsoft, Google, Amazon & Meta rubrics + 60-Day Plan', category: 'Practice War Room' },
      { id: 'cheatsheets:all', kind: 'cheatsheet', title: 'Visual Cheatsheets & Decision Matrices', subtitle: 'Latency ladder, Powers of 2, 45m blueprints & 23 GoF grid', category: 'Cheatsheets' },
    ];

    return [...lessonItems, ...labItems, ...patternItems];
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

          {route.tab === 'lab' && <DesignLabView key={route.subId || 'default'} initialLabId={route.subId} />}

          {route.tab === 'practice' && (
            <PracticeView
              roadmapChecked={progress.roadmapChecked}
              onToggleRoadmap={handleToggleRoadmap}
              onSaveQuizScore={handleSaveQuizScore}
              quizHistory={progress.quizHistory}
            />
          )}

          {route.tab === 'cheatsheets' && (
            <CheatsheetsView onJumpToLesson={(id) => navigateLesson(id, 1)} />
          )}
        </main>
      </div>

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={searchItems}
        onSelect={(item) => {
          if (item.kind === 'lesson') navigateLesson(item.lessonId, 1);
          else if (item.kind === 'lab') navigateTab('lab', item.subId);
          else if (item.kind === 'practice') navigateTab('practice');
          else if (item.kind === 'cheatsheet') navigateTab('cheatsheets');
        }}
      />
    </div>
  );
}
