/* =========================================================
   helpers.js  —  Nexus Multi-Chat — Shared Utility Functions
   Pure functions used across all modules via NexusApp.*
   ========================================================= */

/* ── HTML escaping ───────────────────────────────────────── */
NexusApp.escHtml = function (str) {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
};

/* ── Current time string (HH:MM) ────────────────────────── */
NexusApp.getTime = function () {
  const n = new Date();
  return `${n.getHours().toString().padStart(2, '0')}:${n.getMinutes().toString().padStart(2, '0')}`;
};

/* ── Human-readable file size ───────────────────────────── */
NexusApp.formatBytes = function (bytes) {
  if (bytes < 1024)           return bytes + ' B';
  if (bytes < 1024 * 1024)    return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/* ── Detect emoji-only strings (for jumbo rendering) ──────── */
NexusApp.isOnlyEmojis = function (str) {
  if (!str) return false;
  const stripped = str.replace(/\s/g, '');
  if (stripped.length === 0) return false;
  const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
  return emojiRegex.test(stripped) && Array.from(stripped).length <= 15;
};

/* ── Scroll messages area to bottom ─────────────────────── */
NexusApp.scrollBottom = function () {
  const messagesWrap = document.getElementById('messagesWrap');
  if (!messagesWrap) return;
  requestAnimationFrame(() => { messagesWrap.scrollTop = messagesWrap.scrollHeight; });
};

/* ── Floating toast notification ────────────────────────── */
NexusApp.showEmailToast = function (msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position:    'fixed',
    bottom:      '28px',
    left:        '50%',
    transform:   'translateX(-50%)',
    background:  'var(--surface-4)',
    color:       'var(--text-1)',
    border:      '1px solid var(--border)',
    padding:     '10px 22px',
    borderRadius:'999px',
    fontSize:    '13px',
    fontWeight:  '600',
    fontFamily:  'Inter, sans-serif',
    zIndex:      '9999',
    boxShadow:   'var(--shadow-md)',
    animation:   'msgSlideIn 0.2s ease'
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
};
