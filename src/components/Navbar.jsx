import React from 'react';
import {
  BookOpen,
  FlaskConical,
  Layers,
  Menu,
  Moon,
  Search,
  Sun,
  Target,
} from 'lucide-react';

const NAV_TABS = [
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'lab', label: 'Design Lab', icon: FlaskConical },
  { id: 'practice', label: 'Practice', icon: Target },
  { id: 'cheatsheets', label: 'Cheatsheets', icon: Layers },
];

export default function Navbar({
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  onOpenSearch,
  onToggleSidebar,
  completedCount,
  totalLessons,
  user,
  onOpenProfile,
}) {
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-ink/15 bg-paper/95 backdrop-blur-md dark:border-ink-border dark:bg-ink-canvas/95">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-2 px-3 sm:px-5">
        {/* Left: Menu toggle + Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          {activeTab === 'learn' && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle curriculum sidebar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink/25 bg-paper-card text-ink hover:bg-paper-subtle dark:border-ink-border dark:bg-ink-card dark:text-paper-ink"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectTab('learn')}
            className="flex items-center gap-2 text-left group shrink-0"
          >
            {/* Mini isometric stack mark */}
            <svg viewBox="0 0 28 28" className="h-7 w-7 shrink-0" aria-hidden="true">
              <polygon points="14,2 25,8 14,14 3,8" fill="#B8E0A0" stroke={isDark ? '#F2EDE4' : '#1F1D1A'} strokeWidth="1.6" />
              <polygon points="3,8 14,14 14,20 3,14" fill="#D1E2FA" stroke={isDark ? '#F2EDE4' : '#1F1D1A'} strokeWidth="1.5" />
              <polygon points="25,8 14,14 14,20 25,14" fill="#E4DCF8" stroke={isDark ? '#F2EDE4' : '#1F1D1A'} strokeWidth="1.5" />
              <polygon points="6,19 14,23 22,19 14,26" fill="#F4DFB0" stroke={isDark ? '#F2EDE4' : '#1F1D1A'} strokeWidth="1.3" />
            </svg>
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-ink dark:text-paper-ink">
              System <span className="term-highlight">Design</span>
            </span>
          </button>

          {/* Desktop Mode Tabs */}
          <nav className="hidden lg:flex items-center gap-1 ml-3 rounded-xl border border-ink/15 bg-paper-subtle/75 p-1 dark:border-ink-border dark:bg-ink-card">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                    active
                      ? 'bg-paper-card text-ink border border-ink/25 shadow-sm dark:bg-sage-dark dark:text-[#C9F2BE] dark:border-sage/40'
                      : 'text-ink-muted hover:text-ink dark:text-paper-ink/65 dark:hover:text-paper-ink'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search + Progress + Theme */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search lessons, patterns, and labs"
            className="inline-flex items-center gap-2 rounded-xl border border-ink/20 bg-paper-card px-2.5 sm:px-3 py-1.5 text-xs font-mono text-ink-muted hover:border-ink/45 hover:text-ink dark:border-ink-border dark:bg-ink-card dark:text-paper-ink/70"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Search HLD, LLD, patterns…</span>
            <kbd className="hidden sm:inline-block rounded-md border border-ink/20 bg-paper px-1.5 py-0.5 text-[10px] text-ink dark:border-ink-border dark:bg-ink-elevated dark:text-paper-ink">
              Ctrl K
            </kbd>
          </button>

          {/* Progress pill */}
          <button
            type="button"
            onClick={() => onSelectTab('practice')}
            title="View mastery roadmap & practice stats"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-ink/20 bg-paper-card px-3 py-1.5 text-xs font-mono dark:border-ink-border dark:bg-ink-card"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-sage-strong" />
            <span className="font-semibold text-ink dark:text-paper-ink">
              {completedCount}/{totalLessons}
            </span>
            <span className="text-[10px] text-ink-muted dark:text-paper-ink/60">({pct}%)</span>
          </button>

          {/* User Profile Pill (One-Time Login Remembered) */}
          {user && (
            <button
              type="button"
              onClick={onOpenProfile}
              title={`Workspace profile: ${user.name} (${user.target})`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink/30 bg-sage/55 px-2.5 py-1.5 text-xs font-mono font-bold text-ink hover:bg-sage/80 dark:border-sage/40 dark:bg-sage-dark dark:text-[#C9F2BE]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-paper-card text-[10px] font-display font-bold text-ink border border-ink/25 dark:bg-ink-card dark:text-paper-ink">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="hidden md:inline max-w-[90px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle light/dark theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink/25 bg-paper-card text-ink hover:bg-paper-subtle dark:border-ink-border dark:bg-ink-card dark:text-paper-ink"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Mode Bar */}
      <div className="flex lg:hidden items-center gap-1 overflow-x-auto border-t border-ink/10 dark:border-ink-border px-3 py-1.5">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold ${
                active
                  ? 'bg-sage text-ink border border-ink/40 dark:bg-sage-dark dark:text-[#C9F2BE]'
                  : 'text-ink-muted dark:text-paper-ink/70'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
