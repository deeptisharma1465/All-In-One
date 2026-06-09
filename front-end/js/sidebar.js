/* =========================================================
   sidebar.js  —  Nexus Multi-Chat — Navigation & Sidebar
   Requires: config.js, chat.js, email.js, helpers.js
   ========================================================= */

(function () {
  const app             = document.getElementById('app');
  const html            = document.documentElement;
  const themeToggle     = document.getElementById('themeToggle');
  const chatNameBtn     = document.getElementById('chatNameBtn');
  const profilePanel    = document.getElementById('profilePanel');
  const profileClose    = document.getElementById('profileClose');
  const dmRows          = document.querySelectorAll('.dm-row');
  const platformBtns    = document.querySelectorAll('.nav-platform-btn');
  const navUtilBtns     = document.querySelectorAll('.nav-btn');
  const accHeaders      = document.querySelectorAll('.acc-header');
  const searchInput     = document.getElementById('searchInput');
  const searchFilterBtn = document.querySelector('.search-filter');
  const noChatEl        = document.getElementById('noChatPlaceholder');
  const chatContent     = document.getElementById('chatContent');

  /* ── Theme Toggle ───────────────────────────────────────── */
  const savedTheme = localStorage.getItem('nexus-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('nexus-theme', next);
    lucide.createIcons();
  });

  /* ── Switch Conversation ────────────────────────────────── */
  NexusApp.switchConvo = function (key, rowEl) {
    app.classList.remove('profile-open');
    profilePanel.setAttribute('aria-hidden', 'true');

    dmRows.forEach(r => r.classList.remove('active'));
    if (rowEl) rowEl.classList.add('active');

    noChatEl.style.display = 'none';
    chatContent.style.display = 'flex';

    NexusApp.activeConvo = key;
    NexusApp.updateHeader(key);
    if (NexusApp.renderMessages) NexusApp.renderMessages(key);
  };

  NexusApp.updateHeader = function (key) {
    const c = NexusApp.conversations[key];
    if (!c) return;

    chatNameBtn.textContent = c.name;
    const statusEl = document.getElementById('chatStatus');
    statusEl.textContent = c.status;
    statusEl.className = 'chat-hdr-status';
    if (c.status === 'Away') statusEl.classList.add('status-away');
    if (c.status === 'Offline') statusEl.classList.add('status-off');

    const hdrAv = document.getElementById('chatHdrAvatar');
    hdrAv.style.background = c.avatarBg;
    hdrAv.textContent = c.avatarInit;

    const hdrOnline = document.getElementById('chatHdrOnline');
    hdrOnline.style.display = c.status === 'Online' ? '' : 'none';

    document.getElementById('profileName').textContent = c.name;
    document.getElementById('profileHandle').textContent = '@' + c.handle;
    const profAv = document.getElementById('profileAvatarBg');
    profAv.style.background = c.avatarBg;
    profAv.textContent = c.avatarInit;
  };

  dmRows.forEach(row => {
    const activate = () => {
      const key = row.dataset.convo;
      if (key) NexusApp.switchConvo(key, row);
    };
    row.addEventListener('click', activate);
    row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') activate(); });
  });

  /* ── Nav Buttons ────────────────────────────────────────── */
  platformBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      platformBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (btn.dataset.channel === 'email') {
        if (!NexusApp.gmailAuthed) {
          if (NexusApp.openAuthOverlay) NexusApp.openAuthOverlay();
        } else {
          if (NexusApp.enterEmailMode) NexusApp.enterEmailMode();
        }
      } else {
        if (NexusApp.exitEmailMode) NexusApp.exitEmailMode();
      }
    });
  });

  navUtilBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navUtilBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ── Profile Panel ──────────────────────────────────────── */
  chatNameBtn?.addEventListener('click', () => {
    if (!NexusApp.activeConvo) return;
    const isOpen = app.classList.toggle('profile-open');
    profilePanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  });
  profileClose?.addEventListener('click', () => {
    app.classList.remove('profile-open');
    profilePanel.setAttribute('aria-hidden', 'true');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && app.classList.contains('profile-open')) {
      app.classList.remove('profile-open');
      profilePanel.setAttribute('aria-hidden', 'true');
    }
  });

  /* ── Accordion ──────────────────────────────────────────── */
  accHeaders.forEach(hdr => {
    hdr.addEventListener('click', () => {
      const item = hdr.closest('.acc-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.acc-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.acc-header').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        hdr.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Search / Filter ────────────────────────────────────── */
  if (searchInput) {
    const searchClearBtn = document.createElement('button');
    searchClearBtn.id = 'searchClearBtn';
    searchClearBtn.setAttribute('aria-label', 'Clear search');
    searchClearBtn.innerHTML = '<i data-lucide="x" class="lucide"></i>';
    searchClearBtn.style.cssText = [
      'width:16px', 'height:16px', 'border-radius:50%', 'background:var(--surface-4)',
      'display:none', 'align-items:center', 'justify-content:center',
      'flex-shrink:0', 'transition:background var(--t-fast)', 'opacity:0.7'
    ].join(';');
    searchClearBtn.addEventListener('mouseenter', () => searchClearBtn.style.opacity = '1');
    searchClearBtn.addEventListener('mouseleave', () => searchClearBtn.style.opacity = '0.7');
    
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) searchBar.insertBefore(searchClearBtn, searchFilterBtn);
    
    const noResultsEl = document.createElement('div');
    noResultsEl.id = 'searchNoResults';
    noResultsEl.style.cssText = [
      'display:none', 'flex-direction:column', 'align-items:center',
      'justify-content:center', 'gap:8px', 'padding:32px 16px',
      'color:var(--text-3)', 'font-size:12.5px', 'text-align:center'
    ].join(';');
    noResultsEl.innerHTML = `<i data-lucide="search-x" class="lucide" style="width:28px;height:28px;opacity:.4;"></i><span>No contacts found</span>`;
    
    const dmList = document.getElementById('dmList');
    if (dmList) dmList.parentNode.insertBefore(noResultsEl, dmList.nextSibling);

    function highlightText(text, query) {
      if (!query) return NexusApp.escHtml(text);
      const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${safe})`, 'gi');
      return NexusApp.escHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    function applySearch(query) {
      const q = query.trim().toLowerCase();
      let visibleCount = 0;

      dmRows.forEach(row => {
        const nameEl = row.querySelector('.dm-name');
        const previewEl = row.querySelector('.dm-preview');
        if (!nameEl) return;

        const name = nameEl.dataset.original || nameEl.textContent;
        const preview = previewEl ? (previewEl.dataset.original || previewEl.textContent) : '';

        if (!nameEl.dataset.original) nameEl.dataset.original = name;
        if (previewEl && !previewEl.dataset.original) previewEl.dataset.original = preview;

        const matches = !q || name.toLowerCase().includes(q) || preview.toLowerCase().includes(q);

        if (matches) {
          row.style.display = '';
          nameEl.innerHTML = highlightText(name, q);
          if (previewEl) previewEl.innerHTML = highlightText(preview, q);
          visibleCount++;
        } else {
          row.style.display = 'none';
          nameEl.innerHTML = NexusApp.escHtml(name);
          if (previewEl) previewEl.innerHTML = NexusApp.escHtml(preview);
        }
      });

      noResultsEl.style.display = visibleCount === 0 && q ? 'flex' : 'none';
      if (dmList) dmList.style.display = visibleCount === 0 && q ? 'none' : '';
      searchClearBtn.style.display = q ? 'flex' : 'none';
    }

    function clearSearch() {
      searchInput.value = '';
      applySearch('');
      searchInput.focus();
    }

    searchInput.addEventListener('input', () => applySearch(searchInput.value));
    searchClearBtn.addEventListener('click', clearSearch);
    searchFilterBtn?.addEventListener('click', clearSearch);
  }

})();
