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

  const setStatus = (msg) => {
    list.innerHTML = `<div class="shisha-list__status">${msg}</div>`;
  };

  async function loadShishas() {
    setStatus('Loading flavours…');

    try {
      const response = await fetch('http://inv_app/api/public/shishas');
      if (!response.ok) throw new Error('Failed to load shisha flavours');

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
      setStatus('Could not load shisha flavours. Please try again in a moment.');
    }
  }

  loadShishas();
})();
