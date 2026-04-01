import { DAILY_COUNTRIES, MAX_GUESSES } from './data.js';

function getDayIndex() {
  const start = new Date('2024-01-01');
  const today = new Date();
  const days  = Math.floor((today - start) / 86400000);
  return days % DAILY_COUNTRIES.length;
}

export function getTodaysCountry() {
  return DAILY_COUNTRIES[getDayIndex()];
}

export function createInitialState() {
  return {
    guesses:       [],
    revealedClues: 1,
    gameOver:      false,
    won:           false,
  };
}

export function processGuess(state, guess, country) {
  if (state.gameOver) return state;

  const guesses   = [...state.guesses, guess];
  const isCorrect = guess.toLowerCase() === country.name.toLowerCase();

  if (isCorrect) {
    return { ...state, guesses, gameOver: true, won: true };
  }

  const revealedClues = Math.min(state.revealedClues + 1, MAX_GUESSES);
  const gameOver      = guesses.length >= MAX_GUESSES;

  return { ...state, guesses, revealedClues, gameOver, won: false };
}

export function buildShareText(state, country) {
  const lines = state.guesses.map(g =>
    g.toLowerCase() === country.name.toLowerCase() ? '🟩' : '🟥'
  );

  while (lines.length < MAX_GUESSES) lines.push('⬛');

  const score = state.won ? `${state.guesses.length}/${MAX_GUESSES}` : 'X/6';
    return `BokehDaily ${score}\n${lines.join('')}\nPlay at this SITE!!;

}
