(function () {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  const lbImg = document.getElementById('lightboxImg');
  const lbCap = document.getElementById('lightboxCaption');
  const lbClose = lb.querySelector('.lightbox-close');

  function openLB(src, caption) {
    lbImg.src = src;
    lbImg.alt = caption || 'Menu page';
    lbCap.textContent = caption || '';
    lb.classList.add('open');
  }
  function closeLB() { lb.classList.remove('open'); }

  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
  if (lbClose) lbClose.addEventListener('click', closeLB);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLB(); });

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.menu-shot img');
    if (!img) return;
    openLB(img.getAttribute('src'), img.getAttribute('alt'));
  });
})();

(function () {
  const list = document.getElementById('shishaList');
  if (!list) return;

  const API_BASE = 'http://inv_app/api';
  const envPasswordPromise = loadEnvPassword();

  const setStatus = (msg) => {
    list.innerHTML = `<div class="shisha-list__status">${msg}</div>`;
  };

  async function loadEnvPassword() {
    try {
      const res = await fetch('./.env', { cache: 'no-store' });
      if (!res.ok) throw new Error('No .env file served');

      const text = await res.text();
      const match = text.match(/^\s*INV_API_PASSWORD\s*=\s*(.+)\s*$/m);
      if (match) return match[1].trim().replace(/^['"]|['"]$/g, '');
    } catch (err) {
      console.warn('Could not load .env for API password', err);
    }

    return (typeof window !== 'undefined' && window.INV_API_PASSWORD) || null;
  }

  async function loadShishas() {
    setStatus('Loading flavours…');

    let password = null;
    try {
      password = await envPasswordPromise;
      const headers = password ? { 'X-Password': password } : undefined;

      const response = await fetch(`${API_BASE}/public/shishas`, {
        headers,
      });
      if (!response.ok) {
        const err = new Error('Failed to load shisha flavours');
        err.status = response.status;
        throw err;
      }

      const data = await response.json();
      const shishas = Array.isArray(data?.shishas) ? data.shishas : [];

      const toDisplay = shishas.filter((item) => {
        if (!item || typeof item.name !== 'string') return false;
        const serve = Number(item.gramsPerServe);
        const remaining = Number(item.gramsRemaining);
        return Number.isFinite(serve) && Number.isFinite(remaining) && serve > remaining;
      });

      if (!toDisplay.length) {
        setStatus('No shisha flavours to display right now.');
        return;
      }

      list.innerHTML = '';
      toDisplay.forEach(({ name }) => {
        const pill = document.createElement('div');
        pill.className = 'shisha-pill';
        pill.textContent = name;
        list.appendChild(pill);
      });
    } catch (err) {
      console.error(err);
      const message =
        err?.status === 401 || err?.status === 403
          ? 'Could not load shisha flavours (check INV_API_PASSWORD in .env).'
          : !password
            ? 'Could not load shisha flavours (missing INV_API_PASSWORD in .env).'
            : 'Could not load shisha flavours. Please try again in a moment.';
      setStatus(message);
    }
  }

  loadShishas();
})();
