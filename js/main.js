/**
 * main.js – 應用程式入口點
 *
 * 職責：初始化應用、綁定事件、協調 Game 與 UI 模組。
 */

'use strict';

/* ---------- 初始化 ---------- */
function init() {
  const stats = Game.loadStats();
  UI.updateStats(stats);

  // Start with medium difficulty
  startNewGame('medium');

  bindEvents();
}

/* ---------- 事件綁定 ---------- */
function bindEvents() {
  const { els } = UI;

  // Difficulty buttons
  document.querySelectorAll('.btn-diff').forEach((btn) => {
    btn.addEventListener('click', () => {
      const diff = btn.dataset.diff;
      UI.setActiveDifficulty(diff);
      startNewGame(diff);
    });
  });

  // Submit guess
  els.submitBtn.addEventListener('click', handleGuess);

  // Enter key submits guess
  els.guessInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleGuess();
  });

  // Reset button
  els.resetBtn.addEventListener('click', () => {
    startNewGame(Game.state.difficulty);
  });

  // Modal close / play again
  els.modalCloseBtn.addEventListener('click', () => {
    UI.hideModal();
    startNewGame(Game.state.difficulty);
  });

  // Close modal clicking backdrop
  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) {
      UI.hideModal();
      startNewGame(Game.state.difficulty);
    }
  });

  // Clear statistics
  els.clearStatsBtn.addEventListener('click', () => {
    if (confirm('確定要清除所有統計資料嗎？')) {
      const stats = Game.clearStats();
      UI.updateStats(stats);
    }
  });
}

/* ---------- 開始新遊戲 ---------- */
function startNewGame(difficulty) {
  Game.startGame(difficulty);
  UI.resetUI(difficulty);
}

/* ---------- 處理猜測 ---------- */
function handleGuess() {
  const rawValue = UI.els.guessInput.value.trim();
  const num = parseInt(rawValue, 10);
  // Validate against original difficulty boundaries (not the narrowed display range)
  const diff = Game.DIFFICULTIES[Game.state.difficulty];
  const { min: diffMin, max: diffMax } = diff;

  // Client-side validation before calling game logic
  if (rawValue === '' || isNaN(num)) {
    UI.showMessage('請輸入一個整數！', 'warning');
    UI.shakeInput();
    UI.els.guessInput.focus();
    return;
  }

  if (num < diffMin || num > diffMax) {
    UI.showMessage(`請輸入 ${diffMin}–${diffMax} 之間的整數！`, 'warning');
    UI.shakeInput();
    UI.els.guessInput.focus();
    return;
  }

  const { result, guessCount } = Game.submitGuess(num);

  UI.addHistoryTag(num, result);
  UI.updateGuessCount(guessCount);
  UI.clearInput();

  switch (result) {
    case 'correct':
      UI.showMessage(`🎉 答對了！答案就是 ${num}！`, 'success');
      UI.setInputEnabled(false);
      UI.updateStats(Game.loadStats());
      // Small delay before modal so the message is visible
      setTimeout(() => UI.showWinModal(num, guessCount), 600);
      break;

    case 'too_high':
      UI.showMessage(`📉 太大了！試試比 ${num} 更小的數字。`, 'danger');
      UI.updateRange(Game.state.rangeMin, Game.state.rangeMax);
      UI.els.guessInput.focus();
      break;

    case 'too_low':
      UI.showMessage(`📈 太小了！試試比 ${num} 更大的數字。`, 'warning');
      UI.updateRange(Game.state.rangeMin, Game.state.rangeMax);
      UI.els.guessInput.focus();
      break;

    case 'invalid':
      UI.showMessage(`請輸入 ${diffMin}–${diffMax} 之間的整數！`, 'warning');
      UI.shakeInput();
      break;

    case 'game_inactive':
      UI.showMessage('遊戲尚未開始，請按「重新開始」。', 'info');
      break;

    default:
      break;
  }
}

/* ---------- 啟動 ---------- */
document.addEventListener('DOMContentLoaded', init);
