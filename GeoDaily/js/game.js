import { DAILY_COUNTRIES, MAX_GUESSES } from './data.js';

function getDayIndex() {
  const start = Date.UTC(2025, 3, 30);
  const today = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );
  const days = Math.floor((today - start) / 86400000);
  return days % DAILY_COUNTRIES.length;
}

export function getTodaysCountry() {
  return DAILY_COUNTRIES[getDayIndex()];
}

export function getTodayKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}

export function createInitialState() {
  return {
    guesses:       [],
    revealedClues: 1,
    gameOver:      false,
    won:           false,
  };
}

export function calculateScore(cluesUsed, won) {
  if (!won) return 0;
  const scores = { 1: 1000, 2: 750, 3: 500, 4: 250 };
  return scores[cluesUsed] ?? 0;
}

export function processGuess(state, guess, country) {
  if (state.gameOver) return state;

  const guesses   = [...state.guesses, guess];
  const isCorrect = guess.toLowerCase() === country.name.toLowerCase();

  if (isCorrect) {
    const score = calculateScore(state.revealedClues, true);
    return { ...state, guesses, gameOver: true, won: true, score, cluesUsed: state.revealedClues };
  }

  const revealedClues = Math.min(state.revealedClues + 1, MAX_GUESSES);
  const gameOver      = guesses.length >= MAX_GUESSES;

  return { ...state, guesses, revealedClues, gameOver, won: false, ...(gameOver && { score: 0, cluesUsed: MAX_GUESSES }) };
}

export function buildShareText(state, country) {
  const lines = state.guesses.map(g =>
    g.toLowerCase() === country.name.toLowerCase() ? '🟩' : '🟥'
  );

  while (lines.length < MAX_GUESSES) lines.push('⬛');

  const score = state.won ? `${state.guesses.length}/${MAX_GUESSES}` : 'X/4';
  return `BokehDaily ${score} (${state.score ?? 0}pts)\n${lines.join('')}\nPlay at this SITE!!`;
}