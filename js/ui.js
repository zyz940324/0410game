/**
 * ui.js – UI 控制器
 *
 * 職責：讀取 DOM 元素並提供更新視圖的函式。
 * 不包含遊戲邏輯，所有狀態來自 game.js。
 */

'use strict';

/* ---------- DOM 元素快取 ---------- */
const $ = (id) => document.getElementById(id);

const els = {
  messageBox:    $('message-box'),
  messageText:   $('message-text'),
  guessCount:    $('guess-count'),
  rangeDisplay:  $('range-display'),
  guessInput:    $('guess-input'),
  submitBtn:     $('submit-btn'),
  resetBtn:      $('reset-btn'),
  historyList:   $('history-list'),
  statTotal:     $('stat-total'),
  statBest:      $('stat-best'),
  statAvg:       $('stat-avg'),
  statWinrate:   $('stat-winrate'),
  recentGames:   $('recent-games'),
  clearStatsBtn: $('clear-stats-btn'),
  modal:         $('result-modal'),
  modalIcon:     $('modal-icon'),
  modalTitle:    $('modal-title'),
  modalBody:     $('modal-body'),
  modalCloseBtn: $('modal-close-btn'),
};

/* ---------- 訊息盒 ---------- */
const MSG_ICONS = {
  info:    'fa-info-circle',
  success: 'fa-check-circle',
  danger:  'fa-times-circle',
  warning: 'fa-exclamation-triangle',
};

function showMessage(text, type = 'info') {
  const { messageBox, messageText } = els;
  messageBox.className = `message-box ${type}`;
  const icon = messageBox.querySelector('i');
  if (icon) {
    icon.className = `fas ${MSG_ICONS[type] || MSG_ICONS.info}`;
  }
  messageText.textContent = text;
  // Re-trigger animation
  messageBox.style.animation = 'none';
  messageBox.offsetHeight; // Force reflow to reset CSS animation before restarting it
  messageBox.style.animation = '';
}

/* ---------- 計數與範圍 ---------- */
function updateGuessCount(count) {
  els.guessCount.textContent = count;
}

function updateRange(min, max) {
  els.rangeDisplay.textContent = `${min} – ${max}`;
  // Do not set min/max on the input element; validation is performed in main.js
  // against the original difficulty range to avoid conflicting validation layers.
}

/* ---------- 輸入框控制 ---------- */
function setInputEnabled(enabled) {
  els.guessInput.disabled  = !enabled;
  els.submitBtn.disabled   = !enabled;
  if (enabled) els.guessInput.focus();
}

function clearInput() {
  els.guessInput.value = '';
}

function shakeInput() {
  const input = els.guessInput;
  input.classList.remove('shake');
  input.offsetHeight; // reflow
  input.classList.add('shake');
  input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
}

/* ---------- 猜測歷史 ---------- */
const RESULT_ICONS = {
  too_high: '⬆️',
  too_low:  '⬇️',
  correct:  '✅',
};

function addHistoryTag(value, result) {
  const list = els.historyList;
  // Remove placeholder
  const empty = list.querySelector('.empty-hint');
  if (empty) empty.remove();

  const tag = document.createElement('span');
  tag.className = `history-tag ${result.replace('_', '-')}`;
  tag.textContent = `${RESULT_ICONS[result] || ''} ${value}`;
  list.appendChild(tag);
}

function clearHistory() {
  els.historyList.innerHTML = '<span class="empty-hint">還沒有猜測記錄</span>';
}

/* ---------- 統計面板 ---------- */
function updateStats(stats) {
  const { totalGames, totalGuesses, bestScore, recentGames } = stats;

  els.statTotal.textContent = totalGames;

  if (bestScore !== null) {
    els.statBest.textContent = `${bestScore} 次`;
  } else {
    els.statBest.textContent = '–';
  }

  if (totalGames > 0) {
    const avg = (totalGuesses / totalGames).toFixed(1);
    els.statAvg.textContent     = `${avg} 次`;
    els.statWinrate.textContent = '100%';
  } else {
    els.statAvg.textContent     = '–';
    els.statWinrate.textContent = '–';
  }

  renderRecentGames(recentGames);
}

const DIFF_LABELS = { easy: '簡單', medium: '中等', hard: '困難' };

function renderRecentGames(recentGames) {
  const list = els.recentGames;
  list.innerHTML = '';

  if (!recentGames || recentGames.length === 0) {
    list.innerHTML = '<li class="empty-hint">還沒有完成的遊戲</li>';
    return;
  }

  recentGames.forEach((g) => {
    const li = document.createElement('li');
    li.className = 'recent-item';
    li.innerHTML = `
      <span>${g.date}・${DIFF_LABELS[g.difficulty] || g.difficulty}</span>
      <span class="badge badge-guesses">${g.guessCount} 次</span>
    `;
    list.appendChild(li);
  });
}

/* ---------- 難度按鈕 ---------- */
function setActiveDifficulty(difficulty) {
  document.querySelectorAll('.btn-diff').forEach((btn) => {
    const active = btn.dataset.diff === difficulty;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

/* ---------- 勝利 Modal ---------- */
function showWinModal(answer, guessCount) {
  els.modalIcon.textContent = '🎉';
  els.modalTitle.textContent = '恭喜你猜中了！';
  els.modalBody.textContent =
    `答案是 ${answer}，你共猜了 ${guessCount} 次！`;
  els.modal.classList.remove('hidden');
}

function hideModal() {
  els.modal.classList.add('hidden');
}

/* ---------- 重置 UI ---------- */
function resetUI(difficulty) {
  const range = Game.DIFFICULTIES[difficulty];
  updateRange(range.min, range.max);
  updateGuessCount(0);
  clearHistory();
  clearInput();
  setInputEnabled(true);
  setActiveDifficulty(difficulty);
  showMessage(
    `遊戲已開始！請猜一個 ${range.min}–${range.max} 之間的整數。`,
    'info'
  );
}

/* ---------- 公開介面 ---------- */
window.UI = {
  els,
  showMessage,
  updateGuessCount,
  updateRange,
  setInputEnabled,
  clearInput,
  shakeInput,
  addHistoryTag,
  clearHistory,
  updateStats,
  setActiveDifficulty,
  showWinModal,
  hideModal,
  resetUI,
};
