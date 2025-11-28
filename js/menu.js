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
