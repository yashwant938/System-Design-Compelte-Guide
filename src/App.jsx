import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import CourseMap from './components/CourseMap.jsx';
import LearnView from './components/LearnView.jsx';
import DesignLabView from './components/DesignLabView.jsx';
import PracticeView from './components/PracticeView.jsx';
import CheatsheetsView from './components/CheatsheetsView.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import { OneTimeLoginModal, ProfilePopover } from './components/AuthGate.jsx';
import { GofPatternsExplorerWidget, SolidComparatorWidget } from './components/GofPatternsExplorer.jsx';
import { CURRICULUM_MODULES, findLessonById, getAllLessons } from './data/curriculum.js';
import { GOF_PATTERNS_23 } from './data/gofPatterns23.js';
import {
  clearUserSession,
  loadProgress,
  loadUserSession,
  saveProgress,
  saveUserSession,
} from './utils/storage.js';

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  if (!raw || raw === 'learn') return { tab: 'learn', lessonId: null, step: 1, subId: null };
  const parts = raw.split('/').filter(Boolean);
  if (parts[0] === 'lab' || parts[0] === 'practice' || parts[0] === 'cheatsheets') {
    return { tab: parts[0], lessonId: null, step: 1, subId: parts.slice(1).join('/') || null };
  }
  const lessonId = parts[0];
  const step = Math.max(1, parseInt(parts[1] || '1', 10) || 1);
  return { tab: 'learn', lessonId, step, subId: null };
}

export default function App() {
  const [user, setUser] = useState(() => loadUserSession());
  const [progress, setProgress] = useState(() => loadProgress(user?.handle || user?.email));
  const [route, setRoute] = useState(() => parseHash());
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  const isDark = progress.theme === 'dark';

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  // Persist per-account progress cleanly whenever it updates
  useEffect(() => {
    if (user) saveProgress(progress, user.handle || user.email);
  }, [progress, user?.handle, user?.email]);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
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
    return route.lessonId ? findLessonById(route.lessonId) : null;
  }, [route.lessonId]);

  useEffect(() => {
    if (!user || !activeEntry) return;
    const step = Math.min(route.step, activeEntry.lesson.steps.length);
    setProgress((prev) => {
      if (prev.lastVisited?.itemId === activeEntry.lesson.id && prev.lastVisited.step === step) return prev;
      return { ...prev, lastVisited: { tab: 'learn', itemId: activeEntry.lesson.id, step } };
    });
  }, [user, activeEntry, route.step]);

  const handleLogin = useCallback(
    (userInput) => {
      const savedUser = saveUserSession(userInput);
      const userProgress = loadProgress(savedUser.handle);
      setUser(savedUser);
      setProgress(userProgress);
      showToast(`Welcome ${savedUser.name} — workspace saved automatically!`);
    },
    [showToast]
  );

  const handleRestoreSync = useCallback(
    (restoredUser, restoredProgress) => {
      const savedUser = saveUserSession(restoredUser);
      const merged = {
        ...loadProgress(savedUser.handle),
        ...restoredProgress,
      };
      saveProgress(merged, savedUser.handle);
      setUser(savedUser);
      setProgress(merged);
      showToast(`Restored ${merged.completedIds.length}/${allLessons.length} completed lessons!`);
    },
    [allLessons.length, showToast]
  );

  const handleSignOut = useCallback(() => {
    clearUserSession();
    setUser(null);
    setProgress(loadProgress());
  }, []);

  const navigateLesson = useCallback((lessonId, step = 1) => {
    window.location.hash = `#/${lessonId}/${step}`;
  }, []);

  const navigateTab = useCallback(
    (tab, subId = null) => {
      window.location.hash = subId ? `#/${tab}/${subId}` : `#/${tab}`;
    },
    []
  );

  const handleToggleComplete = useCallback(
    (lessonId, forceValue) => {
      const lessonMeta = findLessonById(lessonId)?.lesson;
      setProgress((prev) => {
        const exists = prev.completedIds.includes(lessonId);
        const shouldBeDone = typeof forceValue === 'boolean' ? forceValue : !exists;
        if (shouldBeDone === exists) return prev;
        const nextCompleted = shouldBeDone
          ? [...prev.completedIds, lessonId]
          : prev.completedIds.filter((id) => id !== lessonId);
        const title = lessonMeta?.title || 'Lesson';
        showToast(
          shouldBeDone
            ? `Completed "${title}" (${nextCompleted.length}/${allLessons.length})`
            : `Unmarked "${title}" (${nextCompleted.length}/${allLessons.length})`
        );
        return {
          ...prev,
          completedIds: nextCompleted,
        };
      });
    },
    [allLessons.length, showToast]
  );

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

  const handleDesignReviewsChange = useCallback((update) => {
    setProgress((prev) => ({ ...prev, designReviews: update(prev.designReviews) }));
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
      { id: 'lab:backlog', kind: 'lab', subId: 'backlog', title: 'Queue backlog recovery lab', subtitle: 'Worker downtime, processing rate and drain time', category: 'Design Lab' },
      { id: 'practice:exam', kind: 'practice', title: 'System design mock exam', subtitle: 'Practice by domain with worked explanations', category: 'Practice' },
      { id: 'practice:reviews', kind: 'practice', subId: 'reviews', title: 'Design review capstones', subtitle: 'Write and review an end-to-end system design', category: 'Practice' },
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
        onToggleSidebar={activeEntry ? handleToggleSidebar : undefined}
        completedCount={progress.completedIds.length}
        totalLessons={allLessons.length}
        user={user}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <div className="flex flex-1 min-h-0">
        {route.tab === 'learn' && activeEntry && (
          <Sidebar
            modules={CURRICULUM_MODULES}
            activeLessonId={activeEntry?.lesson?.id}
            completedIds={progress.completedIds}
            onSelectLesson={(id, st) => navigateLesson(id, st)}
            onToggleComplete={handleToggleComplete}
            openMobile={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            desktopCollapsed={desktopSidebarCollapsed}
          />
        )}

        <main className="flex-1 min-w-0">
          {route.tab === 'learn' && !activeEntry && (
            <>
              {route.lessonId && <p role="status" className="mx-auto max-w-6xl px-4 pt-4 text-sm">This lesson link could not be found. Choose a lesson below.</p>}
              <CourseMap progress={progress} totalLessons={allLessons.length} />
            </>
          )}
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
              shortcutsEnabled={Boolean(user) && !searchOpen && !profileOpen && !mobileSidebarOpen}
              extraBottomSlot={
                activeEntry.lesson.widget === 'solid-comparator' ? (
                  <SolidComparatorWidget />
                ) : activeEntry.lesson.widget === 'gof-explorer' ? (
                  <GofPatternsExplorerWidget />
                ) : null
              }
            />
          )}

          {route.tab === 'lab' && <DesignLabView initialLabId={route.subId} onSelectLab={(id) => navigateTab('lab', id)} />}

          {route.tab === 'practice' && (
            <PracticeView
              sectionId={route.subId}
              onSelectSection={(id) => navigateTab('practice', id)}
              designReviews={progress.designReviews}
              onChangeDesignReviews={handleDesignReviewsChange}
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

      {/* One-Time Login Modal (asks strictly once per browser unless user signs out) */}
      {!user && (
        <OneTimeLoginModal onLogin={handleLogin} onRestoreSync={handleRestoreSync} />
      )}

      {/* Profile & Sync Code Popover */}
      <ProfilePopover
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        progress={progress}
        completedCount={progress.completedIds.length}
        totalLessons={allLessons.length}
        onRestoreSync={handleRestoreSync}
        onSignOut={handleSignOut}
      />

      {/* Instant Completion Confirmation Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border-[1.5px] border-ink bg-sage px-4 py-2.5 text-xs font-mono font-bold text-ink shadow-tactile dark:border-sage dark:bg-[#2F5D34] dark:text-[#E8F8E5]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={searchItems}
        onSelect={(item) => {
          if (item.kind === 'lesson') navigateLesson(item.lessonId, 1);
          else if (item.kind === 'lab') navigateTab('lab', item.subId);
          else if (item.kind === 'practice') navigateTab('practice', item.subId);
          else if (item.kind === 'cheatsheet') navigateTab('cheatsheets');
        }}
      />
    </div>
  );
}
