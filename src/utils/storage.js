const STORAGE_KEY = 'sd_complete_guide_v1';

const defaultState = {
  theme: 'light',
  completedIds: [],
  bookmarkedIds: [],
  roadmapChecked: [],
  quizHistory: [],
  lastVisited: {
    tab: 'home',
    itemId: null,
  },
};

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
      bookmarkedIds: Array.isArray(parsed.bookmarkedIds) ? parsed.bookmarkedIds : [],
      roadmapChecked: Array.isArray(parsed.roadmapChecked) ? parsed.roadmapChecked : [],
      quizHistory: Array.isArray(parsed.quizHistory) ? parsed.quizHistory : [],
    };
  } catch {
    return { ...defaultState };
  }
}

export function saveProgress(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota/private-mode storage errors
  }
}

export function exportProgressJson(state) {
  return JSON.stringify(state, null, 2);
}
