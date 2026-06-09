/* =========================================================
   config.js  —  Nexus Multi-Chat — Supabase Config & App State
   All modules read / write state via window.NexusApp
   ========================================================= */

window.NexusApp = {};

(function () {
  /* ── Supabase credentials ──────────────────────────────── */
  const SUPABASE_URL  = window.ENV?.SUPABASE_URL || 'YOUR_SUPABASE_URL';
  const SUPABASE_ANON = window.ENV?.SUPABASE_ANON || 'YOUR_SUPABASE_ANON_KEY';

  const _supabaseReady =
    SUPABASE_URL  !== 'YOUR_SUPABASE_URL'  &&
    SUPABASE_ANON !== 'YOUR_SUPABASE_ANON_KEY' &&
    typeof window.supabase !== 'undefined';

  let supabaseClient = null;
  if (_supabaseReady) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    } catch (e) {
      console.warn('Supabase init failed:', e);
    }
  }

  /* ── Supabase client (null if not configured) ──────────── */
  NexusApp.supabase = supabaseClient;

  /* ── Auth state ─────────────────────────────────────────── */
  NexusApp.gmailAuthed = false;

  /* ── Chat state ─────────────────────────────────────────── */
  NexusApp.activeConvo = null;
  NexusApp.typingEl    = null;

  /* ── Email state ────────────────────────────────────────── */
  NexusApp.activeEmailId   = null;
  NexusApp.activeEmailTab  = 'primary';
  NexusApp.activeEmailData = null;

  /* ── Lightbox state ─────────────────────────────────────── */
  NexusApp.lbCurrentSrc      = null;
  NexusApp.lbCurrentFilename = null;
  NexusApp.lbCurrentType     = null;
})();
