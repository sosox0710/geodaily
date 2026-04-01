const KEYS = {
  streak:     'geodaily_streak',
  lastWon:    'geodaily_last_won',
  lastPlayed: 'geodaily_last_played',
  state:      'geodaily_state',
};

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getStreak() {
  return parseInt(localStorage.getItem(KEYS.streak) || '0', 10);
}

export function updateStreak(won) {
  const today     = todayKey();
  const lastWon   = localStorage.getItem(KEYS.lastWon);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (won) {
    const streak = lastWon === yesterday ? getStreak() + 1 : 1;
    localStorage.setItem(KEYS.streak,  streak);
    localStorage.setItem(KEYS.lastWon, today);
    return streak;
  }

  return getStreak();
}

export function loadDailyState() {
  const raw = localStorage.getItem(KEYS.state);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw);
    if (state.date !== todayKey()) return null;
    return state;
  } catch {
    return null;
  }
}

export function saveDailyState(state) {
  localStorage.setItem(KEYS.state, JSON.stringify({ ...state, date: todayKey() }));
}