/* =========================================================
   chat.js  —  Nexus Multi-Chat — Messaging & Attachments
   Requires: data.js, helpers.js
   ========================================================= */

(function () {
  const messageInput   = document.getElementById('messageInput');
  const sendBtn        = document.getElementById('sendBtn');
  const messagesWrap   = document.getElementById('messagesWrap');
  
  // Attachments
  const attachBtn      = document.getElementById('attachBtn');
  const attachMenu     = document.getElementById('attachMenu');
  const attachWrap     = document.getElementById('attachWrap');
  const fileDoc        = document.getElementById('fileDoc');
  const fileImg        = document.getElementById('fileImg');
  const fileVid        = document.getElementById('fileVid');
  const fileAud        = document.getElementById('fileAud');

  // Lightbox
  const lbBackdrop     = document.getElementById('lbBackdrop');
  const lbStage        = document.getElementById('lbStage');
  const lbFilename     = document.getElementById('lbFilename');
  const lbCaption      = document.getElementById('lbCaption');
  const lbCloseBtn     = document.getElementById('lbCloseBtn');
  const lbDownloadBtn  = document.getElementById('lbDownloadBtn');
  const lbShareBtn     = document.getElementById('lbShareBtn');

  // Chat Wallpaper
  const chatMenuBtn    = document.getElementById('chatMenuBtn');
  const chatDropdown   = document.getElementById('chatDropdown');
  const wallpaperInput = document.getElementById('wallpaperInput');
  const chatWallpaper  = document.getElementById('chatWallpaper');
  const ddSetBg        = document.getElementById('ddSetBg');
  const ddRemoveBg     = document.getElementById('ddRemoveBg');

  /* ── Render Messages ────────────────────────────────────── */
  NexusApp.renderMessages = function (key) {
    const convo = NexusApp.conversations[key];
    if (!convo) return;

    messagesWrap.innerHTML = `<div class="date-sep"><div class="date-pill">Today</div></div>`;

    convo.messages.forEach((msg, idx) => {
      const prev = convo.messages[idx - 1];
      const consecutive = prev && prev.type === msg.type;

      const avHtml = msg.type === 'received'
        ? `<div class="msg-av" style="background:${convo.avatarBg};">${convo.avatarInit}</div>`
        : `<div class="msg-av" style="background:linear-gradient(135deg,#818cf8,#6366f1);">Me</div>`;

      let bubbleBody = '';
      let isJumbo = false;
      if (msg.img) {
        bubbleBody = `
          <div class="bubble-img-wrap">
            <img src="${msg.img}" alt="Shared image" loading="lazy" />
          </div>
          <p style="font-size:13px;line-height:1.5;">${msg.caption || ''}</p>
        `;
      } else {
        isJumbo = NexusApp.isOnlyEmojis(msg.text);
        bubbleBody = isJumbo ? `<span class="emoji-anim">${msg.text}</span>` : NexusApp.escHtml(msg.text);
      }

      const checkIcon = msg.type === 'sent'
        ? `<span class="msg-check"><i data-lucide="check-check" class="lucide" style="width:13px;height:13px;"></i></span>`
        : '';

      const wrap = document.createElement('div');
      wrap.className = `msg-wrap ${msg.type}${consecutive ? ' consecutive' : ''}`;
      wrap.innerHTML = `
        ${avHtml}
        <div class="bubble ${msg.type}${isJumbo ? ' jumbo-emoji' : ''}">
          ${bubbleBody}
          <div class="msg-meta">
            <span class="msg-time">${msg.time}</span>
            ${checkIcon}
          </div>
        </div>
      `;
      messagesWrap.appendChild(wrap);
    });

    lucide.createIcons();
    NexusApp.scrollBottom();
  };

  /* ── Send & Simulate Reply ──────────────────────────────── */
  function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !NexusApp.activeConvo) return;

    const convo = NexusApp.conversations[NexusApp.activeConvo];
    const time = NexusApp.getTime();
    convo.messages.push({ id: Date.now(), type: 'sent', text, time });

    const isJumbo = NexusApp.isOnlyEmojis(text);
    const bubbleBody = isJumbo ? `<span class="emoji-anim">${text}</span>` : NexusApp.escHtml(text);

    const wrap = document.createElement('div');
    wrap.className = 'msg-wrap sent';
    wrap.innerHTML = `
      <div class="msg-av" style="background:linear-gradient(135deg,#818cf8,#6366f1);">Me</div>
      <div class="bubble sent${isJumbo ? ' jumbo-emoji' : ''}">
        ${bubbleBody}
        <div class="msg-meta">
          <span class="msg-time">${time}</span>
          <span class="msg-check"><i data-lucide="check-check" class="lucide" style="width:13px;height:13px;"></i></span>
        </div>
      </div>
    `;
    messagesWrap.appendChild(wrap);
    messageInput.value = '';
    lucide.createIcons();
    NexusApp.scrollBottom();

    setTimeout(() => showTyping(convo), 800);
    setTimeout(() => { hideTyping(); simulateReply(convo); }, 2200);
  }

  function showTyping(convo) {
    if (NexusApp.typingEl) return;
    NexusApp.typingEl = document.createElement('div');
    NexusApp.typingEl.className = 'typing-wrap';
    NexusApp.typingEl.id = 'typingIndicator';
    NexusApp.typingEl.innerHTML = `
      <div class="msg-av" style="background:${convo.avatarBg};">${convo.avatarInit}</div>
      <div class="typing-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    messagesWrap.appendChild(NexusApp.typingEl);
    NexusApp.scrollBottom();
  }

  function hideTyping() {
    if (NexusApp.typingEl) { NexusApp.typingEl.remove(); NexusApp.typingEl = null; }
  }

  function simulateReply(convo) {
    if (!NexusApp.activeConvo) return;
    const text = NexusApp.autoReplies[Math.floor(Math.random() * NexusApp.autoReplies.length)];
    const time = NexusApp.getTime();
    convo.messages.push({ id: Date.now(), type: 'received', text, time });

    const wrap = document.createElement('div');
    wrap.className = 'msg-wrap received';
    wrap.innerHTML = `
      <div class="msg-av" style="background:${convo.avatarBg};">${convo.avatarInit}</div>
      <div class="bubble received">
        ${NexusApp.escHtml(text)}
        <div class="msg-meta">
          <span class="msg-time">${time}</span>
        </div>
      </div>
    `;
    messagesWrap.appendChild(wrap);
    lucide.createIcons();
    NexusApp.scrollBottom();
  }

  sendBtn?.addEventListener('click', sendMessage);
  messageInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* ── Emoji Picker ───────────────────────────────────────── */
  const emojiBtn = document.getElementById('emojiBtn');
  const emojiPickerPopup = document.getElementById('emojiPickerPopup');
  if (emojiBtn && emojiPickerPopup) {
    emojiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = emojiPickerPopup.style.display === 'block';
      emojiPickerPopup.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!emojiPickerPopup.contains(e.target) && e.target !== emojiBtn) {
        emojiPickerPopup.style.display = 'none';
      }
    });

    const picker = document.querySelector('emoji-picker');
    if (picker) {
      picker.addEventListener('emoji-click', event => {
        messageInput.value += event.detail.unicode;
        messageInput.focus();
      });
    }
  }

  /* ── Lightbox ───────────────────────────────────────────── */
  function openLightbox(src, filename, type) {
    NexusApp.lbCurrentSrc = src;
    NexusApp.lbCurrentFilename = filename;
    NexusApp.lbCurrentType = type;

    lbStage.innerHTML = '';
    if (type === 'img') {
      const img = document.createElement('img');
      img.src = src; img.alt = filename;
      lbStage.appendChild(img);
    } else {
      const vid = document.createElement('video');
      vid.src = src; vid.controls = true; vid.autoplay = true; vid.style.outline = 'none';
      lbStage.appendChild(vid);
    }

    lbFilename.textContent = filename;
    lbCaption.textContent = type === 'img' ? '🖼 Click outside to close  ·  Esc to dismiss' : '🎬 Click outside to close  ·  Esc to dismiss';

    lbDownloadBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = src; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    lbShareBtn.onclick = async () => {
      if (navigator.share) {
        try {
          const res = await fetch(src);
          const blob = await res.blob();
          const file = new File([blob], filename, { type: blob.type });
          await navigator.share({ files: [file], title: filename });
        } catch { /* ignored */ }
      } else {
        try {
          await navigator.clipboard.writeText(src);
          NexusApp.showEmailToast('📋 Link copied to clipboard');
        } catch {
          NexusApp.showEmailToast('Share not supported in this browser');
        }
      }
    };

    lbBackdrop.classList.add('open');
    lbBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
  }

  function closeLightbox() {
    lbBackdrop.classList.remove('open');
    lbBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const vid = lbStage.querySelector('video');
    if (vid) vid.pause();
    setTimeout(() => { lbStage.innerHTML = ''; }, 260);
  }

  lbCloseBtn?.addEventListener('click', closeLightbox);
  lbBackdrop?.addEventListener('click', (e) => {
    if (e.target === lbBackdrop || e.target === lbStage) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lbBackdrop?.classList.contains('open')) closeLightbox();
  });

  messagesWrap?.addEventListener('click', (e) => {
    const imgWrap = e.target.closest('.attach-img-wrap');
    if (imgWrap) {
      const img = imgWrap.querySelector('img');
      if (img) openLightbox(img.src, img.alt || 'image', 'img');
      return;
    }
    const vidWrap = e.target.closest('.attach-video-wrap');
    if (vidWrap && e.target.tagName !== 'VIDEO') {
      const vid = vidWrap.querySelector('video');
      const nameEl = vidWrap.nextElementSibling;
      if (vid) openLightbox(vid.src, nameEl ? nameEl.textContent.trim() : 'video', 'vid');
    }
  });

  /* ── Attachments Menu ───────────────────────────────────── */
  function closeAttachMenu() { attachMenu.classList.remove('open'); attachMenu.setAttribute('aria-hidden', 'true'); }
  attachBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    attachMenu.classList.toggle('open');
    attachMenu.setAttribute('aria-hidden', attachMenu.classList.contains('open') ? 'false' : 'true');
  });
  document.addEventListener('click', (e) => {
    if (attachWrap && !attachWrap.contains(e.target)) closeAttachMenu();
  });

  document.getElementById('attachDoc')?.addEventListener('click', () => { closeAttachMenu(); fileDoc.click(); });
  document.getElementById('attachImg')?.addEventListener('click', () => { closeAttachMenu(); fileImg.click(); });
  document.getElementById('attachVid')?.addEventListener('click', () => { closeAttachMenu(); fileVid.click(); });
  document.getElementById('attachAud')?.addEventListener('click', () => { closeAttachMenu(); fileAud.click(); });

  [fileDoc, fileImg, fileVid, fileAud].forEach((input) => {
    if (!input) return;
    const type = input.id.replace('file', '').toLowerCase(); // doc, img, vid, aud
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file || !NexusApp.activeConvo) { input.value = ''; return; }
      
      const url = URL.createObjectURL(file);
      const convo = NexusApp.conversations[NexusApp.activeConvo];
      const time = NexusApp.getTime();
      const size = NexusApp.formatBytes(file.size);
      const ext = file.name.split('.').pop().toUpperCase();
      let bubbleInner = '';

      if (type === 'img') {
        bubbleInner = `<div class="attach-img-wrap"><img src="${url}" alt="${NexusApp.escHtml(file.name)}" loading="lazy" /><div class="attach-img-overlay"><i data-lucide="zoom-in" class="lucide"></i></div></div>`;
      } else if (type === 'vid') {
        bubbleInner = `<div class="attach-video-wrap"><video src="${url}" controls preload="metadata"></video></div><p style="font-size:11.5px;margin:0;opacity:.7;">${NexusApp.escHtml(file.name)}</p>`;
      } else if (type === 'aud') {
        bubbleInner = `<div class="attach-audio-wrap"><div class="audio-icon"><i data-lucide="music" class="lucide"></i></div><audio src="${url}" controls preload="metadata"></audio></div><p style="font-size:11px;margin:2px 0 0;opacity:.7;">${NexusApp.escHtml(file.name)}</p>`;
      } else {
        bubbleInner = `<a class="attach-doc-chip" href="${url}" download="${NexusApp.escHtml(file.name)}" title="Download ${NexusApp.escHtml(file.name)}"><div class="doc-chip-icon"><i data-lucide="file-text" class="lucide"></i></div><div class="doc-chip-info"><div class="doc-chip-name">${NexusApp.escHtml(file.name)}</div><div class="doc-chip-meta">${size}</div></div><span class="doc-chip-ext">${NexusApp.escHtml(ext)}</span></a>`;
      }

      const wrap = document.createElement('div');
      wrap.className = 'msg-wrap sent';
      wrap.innerHTML = `<div class="msg-av" style="background:linear-gradient(135deg,#818cf8,#6366f1);">Me</div><div class="bubble sent">${bubbleInner}<div class="msg-meta"><span class="msg-time">${time}</span><span class="msg-check"><i data-lucide="check-check" class="lucide" style="width:13px;height:13px;"></i></span></div></div>`;
      
      messagesWrap.appendChild(wrap);
      lucide.createIcons();
      NexusApp.scrollBottom();
      convo.messages.push({ id: Date.now(), type: 'sent', attachType: type, fileName: file.name, size, time });
      input.value = '';
    });
  });

  /* ── Chat Wallpaper ─────────────────────────────────────── */
  function closeDropdown() { chatDropdown.classList.remove('open'); chatDropdown.setAttribute('aria-hidden', 'true'); }
  chatMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    chatDropdown.classList.toggle('open');
    chatDropdown.setAttribute('aria-hidden', chatDropdown.classList.contains('open') ? 'false' : 'true');
  });
  document.addEventListener('click', (e) => {
    if (chatDropdown && !chatDropdown.contains(e.target) && e.target !== chatMenuBtn) closeDropdown();
  });

  ddSetBg?.addEventListener('click', () => { closeDropdown(); wallpaperInput.click(); });
  wallpaperInput?.addEventListener('change', () => {
    const file = wallpaperInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      chatWallpaper.style.backgroundImage = `url('${dataUrl}')`;
      chatWallpaper.classList.add('active');
      localStorage.setItem('nexus-wallpaper', dataUrl);
    };
    reader.readAsDataURL(file);
    wallpaperInput.value = '';
  });

  ddRemoveBg?.addEventListener('click', () => {
    closeDropdown();
    chatWallpaper.style.backgroundImage = '';
    chatWallpaper.classList.remove('active');
    localStorage.removeItem('nexus-wallpaper');
  });

  const savedWallpaper = localStorage.getItem('nexus-wallpaper');
  if (savedWallpaper && chatWallpaper) {
    chatWallpaper.style.backgroundImage = `url('${savedWallpaper}')`;
    chatWallpaper.classList.add('active');
  }
})();
