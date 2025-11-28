(async function () {
  const grid = document.getElementById('galleryGrid');
  const filtersBox = document.getElementById('galleryFilters');
  if (!grid) return;

  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCap = document.getElementById('lightboxCaption');
  const lbClose = document.querySelector('.lightbox-close');
  function openLB(src, caption) {
    lbImg.src = src;
    lbImg.alt = caption || 'Preview';
    lbCap.textContent = caption || '';
    lb.classList.add('open');
  }
  function closeLB() { lb.classList.remove('open'); }
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  lbClose.addEventListener('click', closeLB);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });

  async function loadManifest() {
    const res = await fetch('assets/gallery/manifest.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('manifest not found');
    return res.json();
  }

  function pill(label, active) {
    const a = document.createElement('button');
    a.className = 'chip' + (active ? ' chip--active' : '');
    a.type = 'button';
    a.textContent = label;
    return a;
  }
  function albumSection(album) {
    const wrapper = document.createElement('section');
    wrapper.className = 'album-section';

    const head = document.createElement('div');
    head.className = 'album-head';
    head.innerHTML = `
    <h2 class="album-title">${album.event}</h2>
    <div class="album-meta">${album.date ? new Date(album.date).toLocaleDateString() : ''} • ${album.photos.length} photos</div>
    `;

    const gallery = document.createElement('div');
    gallery.className = 'album-grid';

    const PAGE = 6;
    let shown = 0;
    function renderMore() {
      const slice = album.photos.slice(shown, shown + PAGE);
      slice.forEach(src => {
        const fig = document.createElement('figure');
        const img = document.createElement('img');
        img.src = src;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = album.event;
        fig.appendChild(img);
        fig.addEventListener('click', () => openLB(src, album.event));
        gallery.appendChild(fig);
      });
      shown += slice.length;
      btn.style.display = shown < album.photos.length ? 'inline-block' : 'none';
    }

    const btn = document.createElement('button');
    btn.className = 'btn outline album-more';
    btn.type = 'button';
    btn.textContent = 'Show more';
    btn.addEventListener('click', renderMore);

    wrapper.appendChild(head);
    if (album.cover) {
      const coverWrap = document.createElement('div');
      coverWrap.className = 'album-cover';
      coverWrap.innerHTML = `<img src="${album.cover}" alt="${album.event} cover" loading="lazy">`;
      coverWrap.addEventListener('click', () => openLB(album.cover, album.event));
      wrapper.appendChild(coverWrap);
    }
    wrapper.appendChild(gallery);
    wrapper.appendChild(btn);
    renderMore();
    return wrapper;
  }

  function getHashEvent() {
    const m = location.hash.match(/event=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function setHashEvent(slug) {
    const url = new URL(location.href);
    if (slug) url.hash = `event=${encodeURIComponent(slug)}`; else url.hash = '';
    history.replaceState(null, '', url);
  }

  const albums = await loadManifest();

  if (filtersBox) {
    filtersBox.innerHTML = '';
    const all = pill('All', !getHashEvent());
    all.addEventListener('click', () => { setHashEvent(''); render(); });
    filtersBox.appendChild(all);
    albums.forEach(a => {
      const b = pill(a.event, getHashEvent() === a.slug);
      b.addEventListener('click', () => { setHashEvent(a.slug); render(); });
      filtersBox.appendChild(b);
    });
  }

  function render() {
    const slug = getHashEvent();
    grid.innerHTML = '';
    (slug ? albums.filter(a => a.slug === slug) : albums)
    .forEach(a => grid.appendChild(albumSection(a)));
    if (filtersBox) {
      filtersBox.querySelectorAll('.chip').forEach(ch => ch.classList.remove('chip--active'));
      const target = [...filtersBox.querySelectorAll('.chip')].find(b => b.textContent === (slug ? albums.find(a=>a.slug===slug)?.event : 'All'));
      if (target) target.classList.add('chip--active');
    }
  }

  render();
})();
