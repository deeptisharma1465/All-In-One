/* =========================================================
   auth.js  —  Nexus Multi-Chat — Google OAuth & Supabase Auth
   Requires: config.js, email.js, helpers.js
   ========================================================= */

(function () {
  const authOverlay   = document.getElementById('authOverlay');
  const authGoogleBtn = document.getElementById('authGoogleBtn');
  const authClose     = document.getElementById('authClose');

  NexusApp.openAuthOverlay = function () {
    if (!authOverlay) return;
    authOverlay.classList.add('open');
    authOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
  };

  NexusApp.closeAuthOverlay = function () {
    if (!authOverlay) return;
    authOverlay.classList.remove('open');
    authOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  /* ── Close overlay → revert email nav button to inactive ── */
  authClose?.addEventListener('click', () => {
    NexusApp.closeAuthOverlay();
    // De-select the email nav button and re-activate the first nav button (X)
    const platformBtnsAll = document.querySelectorAll('.nav-platform-btn');
    platformBtnsAll.forEach(b => b.classList.remove('active'));
    const firstBtn = document.querySelector('.nav-platform-btn[data-channel="x"]');
    if (firstBtn) firstBtn.classList.add('active');
    
    // Safety check in case email.js hasn't loaded yet
    if (NexusApp.exitEmailMode) NexusApp.exitEmailMode();
  });

  /* ── Close on backdrop click (outside card) ──────────────── */
  authOverlay?.addEventListener('click', (e) => {
    if (e.target === authOverlay) authClose?.click();
  });

  /* ── "Continue with Google" button ───────────────────────── */
  authGoogleBtn?.addEventListener('click', async () => {
    if (!NexusApp.supabase) {
      NexusApp.showEmailToast('⚠️ Set your Supabase URL & Anon Key in config.js first');
      return;
    }

    authGoogleBtn.classList.add('loading');
    authGoogleBtn.querySelector('span').textContent = 'Redirecting to Google';

    const { error } = await NexusApp.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'email profile https://www.googleapis.com/auth/gmail.readonly',
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });

    if (error) {
      console.error('Supabase OAuth error:', error);
      NexusApp.showEmailToast('❌ Sign-in failed: ' + error.message);
      authGoogleBtn.classList.remove('loading');
      authGoogleBtn.querySelector('span').textContent = 'Continue with Google';
    }
  });

  /* ── Restore session on load (handles OAuth redirect) ────── */
  if (NexusApp.supabase) {
    NexusApp.supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        NexusApp.gmailAuthed = true;
        NexusApp.googleToken = session.provider_token; // Save token for API calls
        const emailNavBtn = document.getElementById('nav-email');
        if (emailNavBtn?.classList.contains('active') && NexusApp.enterEmailMode) {
          NexusApp.enterEmailMode();
        }
      }
    });

    NexusApp.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        NexusApp.gmailAuthed = true;
        NexusApp.googleToken = session.provider_token; // Save token for API calls
        NexusApp.closeAuthOverlay();
        if (NexusApp.enterEmailMode) NexusApp.enterEmailMode();
        NexusApp.showEmailToast(`✅ Signed in as ${session.user.email}`);
        lucide.createIcons();
      }
      if (event === 'SIGNED_OUT') {
        NexusApp.gmailAuthed = false;
        NexusApp.googleToken = null;
        if (NexusApp.exitEmailMode) NexusApp.exitEmailMode();
      }
    });
  }

  /* ── "Sign out" button ───────────────────────── */
  const navLogout = document.getElementById('nav-logout');
  navLogout?.addEventListener('click', async () => {
    if (NexusApp.supabase) {
      await NexusApp.supabase.auth.signOut();
      window.location.reload();
    }
  });
})();
