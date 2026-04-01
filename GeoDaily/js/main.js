import { getTodaysCountry, createInitialState, processGuess } from './game.js';
import { loadDailyState, saveDailyState, getStreak, updateStreak } from './storage.js';
import { renderHeader, renderClues, renderGuesses, renderResult, setStatus, bindInput } from './ui.js';

const country = getTodaysCountry();

let state = loadDailyState() ?? { ...createInitialState(), country };
state.country = country;

renderHeader(getStreak());
renderClues(state);
renderGuesses(state);

if (state.gameOver) {
  renderResult(state);
} else {
  setStatus(`Guess ${state.guesses.length + 1} of 6 wrong guesses reveal new clues`);
  bindInput(handleGuess);
}

function handleGuess(guess) {
  state = processGuess(state, guess, country);

  saveDailyState(state);
  renderClues(state);
  renderGuesses(state);

  if (state.gameOver) {
    updateStreak(state.won);
    renderResult(state);
  } else {
    setStatus(`Guess ${state.guesses.length + 1} of 6  wrong guesses reveal new clues`);
  }
}
