(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeButton = lightbox.querySelector('.lightbox-close');

  const close = () => lightbox.classList.remove('open');

  const open = (src, caption) => {
    if (!src) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || 'Menu page';
    lightboxCaption.textContent = caption || '';
    lightbox.classList.add('open');
  };

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });
  closeButton?.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  document.addEventListener('click', (event) => {
    const img = event.target.closest('.menu-shot img');
    if (!img) return;
    open(img.getAttribute('src'), img.getAttribute('alt'));
  });
})();

(function () {
  const languageButtons = Array.from(document.querySelectorAll('.menu-language__btn'));
  const menuImages = Array.from(document.querySelectorAll('.menu-shot img'));
  if (!languageButtons.length || !menuImages.length) return;

  const MENU_VARIANTS = {
    en: [
      'assets/menu/menu1.jpg',
      'assets/menu/menu2.jpg',
      'assets/menu/menu3.jpg',
      'assets/menu/menu4.jpg',
      'assets/menu/menu5.jpg',
    ],
    et: [
      'assets/menu/menu_ee1.jpg',
      'assets/menu/menu_ee2.jpg',
      'assets/menu/menu_ee3.jpg',
      'assets/menu/menu_ee4.jpg',
      'assets/menu/menu_ee5.jpg',
    ],
  };

  const ALT_LABEL = {
    en: 'Taboo menu page',
    et: 'Taboo menüü leht',
  };

  let activeLang = 'en';
  const storageKey = 'tabooMenuLang';

  const updateButtons = (lang) => {
    languageButtons.forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const applyLanguage = (lang) => {
    const sources = MENU_VARIANTS[lang];
    if (!sources) return;
    activeLang = lang;
    menuImages.forEach((img, index) => {
      const src = sources[index];
      if (src) img.src = src;
      const baseAlt = ALT_LABEL[lang] || 'Menu page';
      img.alt = `${baseAlt} ${index + 1}`;
    });
  };

  const setLanguage = (lang) => {
    if (!MENU_VARIANTS[lang]) return;
    applyLanguage(lang);
    updateButtons(lang);
    try {
      localStorage.setItem(storageKey, lang);
    } catch (error) {
      // Best-effort; ignore storage errors.
    }
  };

  const savedLang = (() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && MENU_VARIANTS[stored]) return stored;
    } catch (error) {
      // Ignore storage access errors.
    }
    const preset = languageButtons.find((btn) => btn.classList.contains('is-active'));
    if (preset && MENU_VARIANTS[preset.dataset.lang]) return preset.dataset.lang;
    return activeLang;
  })();

  setLanguage(savedLang);

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.menu-language__btn');
    if (!btn) return;

    const lang = btn.dataset.lang;
    if (!lang || lang === activeLang) return;
    setLanguage(lang);
  });
})();

(function () {
  const listEl = document.getElementById('shishaList');
  if (!listEl) return;

  const API_BASE = (typeof window !== 'undefined' && window.INV_API_BASE) || '/api';
  const SHISHA_ENDPOINT = `${API_BASE}/public/shishas`;

  const renderStatus = (text) => {
    listEl.innerHTML = `<div class="shisha-list__status">${text}</div>`;
  };

  const renderFlavours = (items) => {
    listEl.innerHTML = '';
    items.forEach((item) => {
      const pill = document.createElement('div');
      pill.className = 'shisha-pill';
      pill.textContent = item.name;
      listEl.appendChild(pill);
    });
  };

  const normalizeShisha = (item) => {
    if (!item || typeof item.name !== 'string') return null;
    const name = item.name.trim();
    const packSize = Number(item.packSize);
    const gramsPerServe = Number(item.gramsPerServe);
    const gramsRemaining = Number(item.gramsRemaining);
    if (![packSize, gramsPerServe, gramsRemaining].every(Number.isFinite)) return null;
    return { name, packSize, gramsPerServe, gramsRemaining };
  };

  const onlyServeable = (items) =>
    items.filter((item) => item.gramsRemaining >= item.gramsPerServe && item.name);

  async function loadShishaFlavours() {
    renderStatus('Loading flavours…');

    try {
      const response = await fetch(SHISHA_ENDPOINT, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      const shishas = Array.isArray(payload?.shishas) ? payload.shishas : [];
      const cleaned = shishas.map(normalizeShisha).filter(Boolean);
      const available = onlyServeable(cleaned);

      if (!available.length) {
        renderStatus('No shisha flavours to display right now.');
        return;
      }

      renderFlavours(available);
    } catch (error) {
      console.error('Failed to load shisha flavours', error);
      renderStatus('Could not load shisha flavours. Please try again shortly.');
    }
  }

  loadShishaFlavours();
})();
