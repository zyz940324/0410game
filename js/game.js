/**
 * game.js – 猜數字遊戲核心邏輯
 *
 * 職責：管理遊戲狀態、產生答案、驗證猜測。
 * 不直接操作 DOM，所有 UI 互動由 ui.js 處理。
 */

'use strict';

/* ---------- 難度設定 ---------- */
const DIFFICULTIES = {
  easy:   { min: 1, max: 50 },
  medium: { min: 1, max: 100 },
  hard:   { min: 1, max: 200 },
};

/* ---------- 遊戲狀態物件 ---------- */
const gameState = {
  answer:      null,
  guessCount:  0,
  guessHistory: [],   // [{ value, result }]
  gameActive:  false,
  difficulty:  'medium',
  rangeMin:    1,
  rangeMax:    100,
};

/* ---------- 統計資料（持久化至 localStorage） ---------- */
const STATS_KEY = 'guessingGame_stats';

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return {
    totalGames:   0,
    totalGuesses: 0,
    bestScore:    null,
    recentGames:  [],   // [{ guessCount, difficulty, date }]
  };
}

function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (_) { /* ignore */ }
}

function clearStats() {
  try {
    localStorage.removeItem(STATS_KEY);
  } catch (_) { /* ignore */ }
  return loadStats();
}

/* ---------- 遊戲初始化 ---------- */
function startGame(difficulty) {
  const diff = DIFFICULTIES[difficulty] || DIFFICULTIES.medium;

  gameState.difficulty   = difficulty;
  gameState.rangeMin     = diff.min;
  gameState.rangeMax     = diff.max;
  gameState.answer       = generateAnswer(diff.min, diff.max);
  gameState.guessCount   = 0;
  gameState.guessHistory = [];
  gameState.gameActive   = true;
}

function generateAnswer(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ---------- 提交猜測 ---------- */
/**
 * @param {number} value
 * @returns {{ result: 'correct'|'too_high'|'too_low'|'invalid', guessCount: number }}
 */
function submitGuess(value) {
  if (!gameState.gameActive) {
    return { result: 'game_inactive', guessCount: gameState.guessCount };
  }

  const num = Number(value);

  if (!isValidGuess(num)) {
    return { result: 'invalid', guessCount: gameState.guessCount };
  }

  gameState.guessCount += 1;
  let result;

  if (num === gameState.answer) {
    result = 'correct';
    gameState.gameActive = false;
    recordWin();
  } else if (num > gameState.answer) {
    result = 'too_high';
    // Narrow the range for display purposes
    if (num < gameState.rangeMax) gameState.rangeMax = num - 1;
  } else {
    result = 'too_low';
    if (num > gameState.rangeMin) gameState.rangeMin = num + 1;
  }

  gameState.guessHistory.push({ value: num, result });
  return { result, guessCount: gameState.guessCount };
}

function isValidGuess(num) {
  // Validate against the original difficulty range so players can guess
  // any number within the initial boundaries, regardless of range narrowing.
  const diff = DIFFICULTIES[gameState.difficulty];
  return Number.isInteger(num) && num >= diff.min && num <= diff.max;
}

/* ---------- 記錄勝利 ---------- */
function recordWin() {
  const stats = loadStats();
  stats.totalGames   += 1;
  stats.totalGuesses += gameState.guessCount;

  if (stats.bestScore === null || gameState.guessCount < stats.bestScore) {
    stats.bestScore = gameState.guessCount;
  }

  stats.recentGames.unshift({
    guessCount: gameState.guessCount,
    difficulty: gameState.difficulty,
    date:       new Date().toLocaleDateString('zh-TW'),
  });

  // Keep only the last 5 games
  if (stats.recentGames.length > 5) stats.recentGames.length = 5;

  saveStats(stats);
}

/* ---------- 公開介面 ---------- */
window.Game = {
  DIFFICULTIES,
  state: gameState,
  startGame,
  submitGuess,
  loadStats,
  saveStats,
  clearStats,
};
