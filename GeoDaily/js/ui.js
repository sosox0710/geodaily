import { ALL_COUNTRIES, CLUE_KEYS, MAX_GUESSES } from './data.js';
import { buildShareText } from './game.js';

const $ = id => document.getElementById(id);

const els = {
  dateLabel:    $('date-label'),
  streakLabel:  $('streak-label'),
  cluesList:    $('clues-list'),
  cluesCount:   $('clues-count'),
  guessesGrid:  $('guesses-grid'),
  resultArea:   $('result-area'),
  inputSection: $('input-section'),
  input:        $('country-input'),
  submitBtn:    $('submit-btn'),
  autocomplete: $('autocomplete'),
  statusMsg:    $('status-msg'),
};

export function renderHeader(streak) {
  const today = new Date();
  els.dateLabel.textContent = today.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  if (streak > 0) {
    els.streakLabel.textContent = `🔥 ${streak}-day streak`;
  }
}

export function renderClues(state) {
  els.cluesList.innerHTML = '';
  els.cluesCount.textContent = `${state.revealedClues} of ${MAX_GUESSES} revealed`;

  CLUE_KEYS.forEach((clue, i) => {
    const isRevealed = i < state.revealedClues || state.gameOver;
    const isNew      = i === state.revealedClues - 1 && !state.gameOver;

    if (isRevealed) {
      const row = document.createElement('div');
      row.className = 'clue-row' + (isNew ? ' clue-row--new' : '');

      const idx = document.createElement('div');
      idx.className = 'clue-row__index' + (isNew ? ' clue-row__index--active' : '');
      idx.textContent = i + 1;

      const content = document.createElement('div');

      const label = document.createElement('div');
      label.className = 'clue-row__label';
      label.textContent = clue.label;

      const value = document.createElement('div');
      value.className = 'clue-row__value';
      const raw = state.country[clue.key];
      value.textContent = typeof raw === 'boolean' ? (raw ? 'Yes' : 'No') : raw;

      content.append(label, value);
      row.append(idx, content);
      els.cluesList.appendChild(row);
    } else {
      const row = document.createElement('div');
      row.className = 'clue-row--locked';

      const idx = document.createElement('div');
      idx.className = 'clue-row__index';
      idx.textContent = i + 1;

      const text = document.createElement('div');
      text.className = 'clue-row__locked-text';
      text.textContent = `Unlocked after guess ${i}`;

      row.append(idx, text);
      els.cluesList.appendChild(row);
    }
  });
}

export function renderGuesses(state) {
  els.guessesGrid.innerHTML = '';

  for (let i = 0; i < MAX_GUESSES; i++) {
    const chip = document.createElement('div');

    if (i < state.guesses.length) {
      const guess     = state.guesses[i];
      const isCorrect = guess.toLowerCase() === state.country.name.toLowerCase();
      chip.className  = 'guess-chip ' + (isCorrect ? 'guess-chip--correct' : 'guess-chip--wrong');
      chip.textContent = guess;
      chip.title       = guess;
    } else {
      chip.className  = 'guess-chip';
      chip.textContent = `${i + 1}`;
    }

    els.guessesGrid.appendChild(chip);
  }
}

export function setStatus(msg, isError = false) {
  els.statusMsg.textContent = msg;
  els.statusMsg.className   = 'status-msg' + (isError ? ' status-msg--error' : '');
}

export function showUsernamePrompt(onSubmit) {
  els.resultArea.innerHTML = '';

  const saved = localStorage.getItem('bokeh_username');
  if (saved) { onSubmit(saved); return; }

  const wrap = document.createElement('div');
  wrap.className = 'username-prompt';

  const title = document.createElement('div');
  title.className = 'username-prompt__title';
  title.textContent = '✨ One last thing';

  const sub = document.createElement('div');
  sub.className = 'username-prompt__sub';
  sub.textContent = 'Pick a name to appear on the leaderboard';

  const row = document.createElement('div');
  row.className = 'username-prompt__row';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'your name...';
  input.maxLength = 20;
  input.className = 'country-input';
  input.style.flex = '1';

  const btn = document.createElement('button');
  btn.className = 'submit-btn';
  btn.textContent = 'Submit';

  const submit = () => {
    const val = input.value.trim();
    if (!val) return;
    localStorage.setItem('bokeh_username', val);
    onSubmit(val);
  };

  btn.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });

  row.append(input, btn);
  wrap.append(title, sub, row);
  els.resultArea.appendChild(wrap);
}

export function renderResult(state, leaderboard, stats) {
  els.resultArea.innerHTML = '';
  els.inputSection.style.display = 'none';
  setStatus('');

  const won    = state.won;
  const banner = document.createElement('div');
  banner.className = 'result-banner result-banner--' + (won ? 'won' : 'lost');

  const title = document.createElement('div');
  title.className = 'result-banner__title';
  title.textContent = won
    ? (state.cluesUsed === 1 ? '🎉 First clue!' : `🎉 Got it on clue ${state.cluesUsed}!`)
    : '😅 Better luck tomorrow!';

  const body = document.createElement('div');
  body.className = 'result-banner__body';
  body.innerHTML = won
    ? `The country was <strong>${state.country.name}</strong>. You scored <strong>${state.score} points</strong>.`
    : `The answer was <strong>${state.country.name}</strong>. A new country tomorrow.`;

  const shareBtn = document.createElement('button');
  shareBtn.className = 'share-btn';
  shareBtn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 1l4 4-4 4M1 8v2a4 4 0 004 4h5M15 5H6a4 4 0 00-4 4"/></svg> Share`;

  shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(buildShareText(state, state.country)).then(() => {
      shareBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        shareBtn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 1l4 4-4 4M1 8v2a4 4 0 004 4h5M15 5H6a4 4 0 00-4 4"/></svg> Share`;
      }, 2000);
    });
  });

  banner.append(title, body, shareBtn);
  els.resultArea.appendChild(banner);

  if (stats) renderStats(stats);
  if (leaderboard?.length) renderLeaderboard(leaderboard, state.username);
}

function renderStats(stats) {
  const section = document.createElement('div');
  section.className = 'leaderboard';

  const title = document.createElement('div');
  title.className = 'leaderboard__title';
  title.textContent = `📊 Today's stats — ${stats.total} ${stats.total === 1 ? 'player' : 'players'}`;

  const bars = document.createElement('div');
  bars.className = 'stats-bars';

  const max = Math.max(stats.clue1, stats.clue2, stats.clue3, stats.clue4, 1);
  [stats.clue1, stats.clue2, stats.clue3, stats.clue4].forEach((count, i) => {
    const row = document.createElement('div');
    row.className = 'stats-bar-row';

    const label = document.createElement('div');
    label.className = 'stats-bar-label';
    label.textContent = `Clue ${i + 1}`;

    const barWrap = document.createElement('div');
    barWrap.className = 'stats-bar-wrap';

    const bar = document.createElement('div');
    bar.className = 'stats-bar';
    bar.style.width = `${Math.round((count / max) * 100)}%`;

    const num = document.createElement('div');
    num.className = 'stats-bar-num';
    num.textContent = count;

    barWrap.append(bar, num);
    row.append(label, barWrap);
    bars.appendChild(row);
  });

  section.append(title, bars);
  els.resultArea.appendChild(section);
}

function renderLeaderboard(rows, currentUsername) {
  const section = document.createElement('div');
  section.className = 'leaderboard';

  const title = document.createElement('div');
  title.className = 'leaderboard__title';
  title.textContent = '🏆 Today\'s leaderboard';

  const list = document.createElement('div');
  list.className = 'leaderboard__list';

  rows.forEach((row, i) => {
    const item = document.createElement('div');
    item.className = 'leaderboard__item' + (row.username === currentUsername ? ' leaderboard__item--you' : '');

    const rank = document.createElement('div');
    rank.className = 'leaderboard__rank';
    rank.textContent = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;

    const name = document.createElement('div');
    name.className = 'leaderboard__name';
    name.textContent = row.username;

    const score = document.createElement('div');
    score.className = 'leaderboard__score';
    score.textContent = `${row.score} pts`;

    const clues = document.createElement('div');
    clues.className = 'leaderboard__clues';
    clues.textContent = `clue ${row.clues_used}`;

    item.append(rank, name, score, clues);
    list.appendChild(item);
  });

  section.append(title, list);
  els.resultArea.appendChild(section);
}

let acIndex = -1;

function updateAutocomplete(query) {
  if (!query) { els.autocomplete.style.display = 'none'; return; }

  const matches = ALL_COUNTRIES
    .filter(c => c.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 7);

  if (!matches.length) { els.autocomplete.style.display = 'none'; return; }

  acIndex = -1;
  els.autocomplete.innerHTML = matches
    .map(c => `<div class="autocomplete__item">${c}</div>`)
    .join('');

  els.autocomplete.querySelectorAll('.autocomplete__item').forEach(item => {
    item.addEventListener('click', () => {
      els.input.value = item.textContent;
      closeAutocomplete();
      els.input.focus();
    });
  });

  els.autocomplete.style.display = 'block';
}

function closeAutocomplete() {
  els.autocomplete.style.display = 'none';
  acIndex = -1;
}

function navigateAutocomplete(dir) {
  const items = els.autocomplete.querySelectorAll('.autocomplete__item');
  if (!items.length) return;
  items[acIndex]?.classList.remove('autocomplete__item--active');
  acIndex = Math.max(0, Math.min(items.length - 1, acIndex + dir));
  items[acIndex].classList.add('autocomplete__item--active');
  els.input.value = items[acIndex].textContent;
}

export function bindInput(onSubmit) {
  els.input.addEventListener('input', () => {
    updateAutocomplete(els.input.value.trim());
    setStatus('');
  });

  els.input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); navigateAutocomplete(1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); navigateAutocomplete(-1); }
    if (e.key === 'Enter')     { e.preventDefault(); submitGuess(onSubmit); }
    if (e.key === 'Escape')    closeAutocomplete();
  });

  els.submitBtn.addEventListener('click', () => submitGuess(onSubmit));

  document.addEventListener('click', e => {
    if (!els.autocomplete.contains(e.target) && e.target !== els.input) closeAutocomplete();
  });
}

function submitGuess(onSubmit) {
  const val = els.input.value.trim();
  closeAutocomplete();

  if (!val) { setStatus('Please type a country name.', true); return; }

  const match = ALL_COUNTRIES.find(c => c.toLowerCase() === val.toLowerCase());
  if (!match) { setStatus('Not a valid country — pick one from the list.', true); return; }

  els.input.value = '';
  onSubmit(match);
}