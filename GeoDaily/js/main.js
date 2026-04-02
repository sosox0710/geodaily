import { getTodaysCountry, createInitialState, processGuess, getTodayKey } from './game.js';
import { loadDailyState, saveDailyState, getStreak, updateStreak } from './storage.js';
import { renderHeader, renderClues, renderGuesses, renderResult, setStatus, bindInput, showUsernamePrompt } from './ui.js';
import { submitScore, fetchLeaderboard, fetchStats } from './supabase.js';

const country = getTodaysCountry();
const dayKey  = getTodayKey();

let state = loadDailyState() ?? { ...createInitialState(), country };
state.country = country;

renderHeader(getStreak());
renderClues(state);
renderGuesses(state);

if (state.gameOver) {
  finishGame(false);
} else {
  setStatus(`Guess ${state.guesses.length + 1} of 4 — each wrong guess reveals a new clue`);
  bindInput(handleGuess);
}

function handleGuess(guess) {
  state = processGuess(state, guess, country);
  saveDailyState(state);
  renderClues(state);
  renderGuesses(state);

  if (state.gameOver) {
    updateStreak(state.won);
    finishGame(true);
  } else {
    setStatus(`Guess ${state.guesses.length + 1} of 4 — each wrong guess reveals a new clue`);
  }
}

async function finishGame(justFinished) {
  if (justFinished) {
    showUsernamePrompt(async (username) => {
      state.username = username;
      saveDailyState(state);
      await submitScore({
        username,
        country: country.name,
        dayKey,
        cluesUsed: state.cluesUsed ?? 4,
        score:     state.score ?? 0,
      });
      const [leaderboard, stats] = await Promise.all([
        fetchLeaderboard(dayKey),
        fetchStats(dayKey),
      ]);
      renderResult(state, leaderboard, stats);
    });
  } else {
    const [leaderboard, stats] = await Promise.all([
      fetchLeaderboard(dayKey),
      fetchStats(dayKey),
    ]);
    renderResult(state, leaderboard, stats);
  }
}