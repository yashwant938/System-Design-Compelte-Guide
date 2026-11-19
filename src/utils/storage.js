const LEGACY_STORAGE_KEY = 'sd_complete_guide_v1';
const USER_SESSION_KEY = 'sd_active_user_v1';
const USER_COOKIE_NAME = 'sd_user_session_v1';
const PROGRESS_PREFIX = 'sd_progress_v2:';

const defaultProgress = {
  theme: 'light',
  completedIds: [],
  bookmarkedIds: [],
  roadmapChecked: [],
  quizHistory: [],
  lastVisited: {
    tab: 'learn',
    itemId: 'cdn',
  },
};

function setSessionCookie(userObj) {
  try {
    const encoded = encodeURIComponent(JSON.stringify(userObj));
    const maxAge = 60 * 60 * 24 * 365; // 1 full year — asks login once only
    document.cookie = `${USER_COOKIE_NAME}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    // Ignore cookie errors in restricted environments
  }
}

function readSessionCookie() {
  try {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${USER_COOKIE_NAME}=`));
    if (!match) return null;
    const raw = decodeURIComponent(match.split('=').slice(1).join('='));
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email && parsed.name) return parsed;
    return null;
  } catch {
    return null;
  }
}

function clearSessionCookie() {
  try {
    document.cookie = `${USER_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // Ignore
  }
}

export function loadUserSession() {
  try {
    const raw = window.localStorage.getItem(USER_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email && parsed.name) {
        setSessionCookie(parsed); // keep cookie fresh
        return parsed;
      }
    }
  } catch {
    // Fallback to cookie below
  }

  const fromCookie = readSessionCookie();
  if (fromCookie) {
    try {
      window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(fromCookie));
    } catch {
      // Ignore
    }
    return fromCookie;
  }
  return null;
}

export function saveUserSession(userObj) {
  const normalized = {
    name: String(userObj.name || '').trim(),
    email: String(userObj.email || '').trim().toLowerCase(),
    target: userObj.target || 'Microsoft & Big Tech',
    createdAt: userObj.createdAt || new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(normalized));
  } catch {
    // Ignore
  }
  setSessionCookie(normalized);
  return normalized;
}

export function clearUserSession() {
  try {
    window.localStorage.removeItem(USER_SESSION_KEY);
  } catch {
    // Ignore
  }
  clearSessionCookie();
}

function progressKeyFor(email) {
  const safe = String(email || 'guest').trim().toLowerCase();
  return `${PROGRESS_PREFIX}${safe}`;
}

export function loadProgress(email) {
  try {
    const scopedKey = progressKeyFor(email);
    let raw = window.localStorage.getItem(scopedKey);

    // Seamless one-time migration from legacy v1 storage so existing progress is never lost
    if (!raw) {
      const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
        window.localStorage.setItem(scopedKey, legacyRaw);
      }
    }

    if (!raw) return { ...defaultProgress };
    const parsed = JSON.parse(raw);
    return {
      ...defaultProgress,
      ...parsed,
      completedIds: Array.isArray(parsed.completedIds) ? Array.from(new Set(parsed.completedIds)) : [],
      bookmarkedIds: Array.isArray(parsed.bookmarkedIds) ? Array.from(new Set(parsed.bookmarkedIds)) : [],
      roadmapChecked: Array.isArray(parsed.roadmapChecked) ? Array.from(new Set(parsed.roadmapChecked)) : [],
      quizHistory: Array.isArray(parsed.quizHistory) ? parsed.quizHistory : [],
    };
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(state, email) {
  try {
    const scopedKey = progressKeyFor(email);
    const payload = JSON.stringify(state);
    window.localStorage.setItem(scopedKey, payload);
    // Keep legacy key mirrored too for backward compatibility
    window.localStorage.setItem(LEGACY_STORAGE_KEY, payload);
  } catch {
    // Ignore quota/private-mode storage errors
  }
}

export function encodeSyncCode(user, progress) {
  const payload = {
    v: 2,
    user,
    progress: {
      theme: progress.theme,
      completedIds: progress.completedIds,
      bookmarkedIds: progress.bookmarkedIds,
      roadmapChecked: progress.roadmapChecked,
      quizHistory: (progress.quizHistory || []).slice(0, 10),
    },
  };
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeSyncCode(code) {
  const cleaned = String(code || '').trim();
  if (!cleaned) throw new Error('Sync code is empty');
  const json = decodeURIComponent(escape(atob(cleaned)));
  const parsed = JSON.parse(json);
  if (!parsed || !parsed.user?.email || !parsed.progress) {
    throw new Error('Invalid sync code format');
  }
  return parsed;
}
