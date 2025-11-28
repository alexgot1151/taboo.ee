(function () {
  function observeSections() {
    if (!('IntersectionObserver' in window)) return;

    const sections = Array.from(document.querySelectorAll('.nav a[href^="#"]'))
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = '#' + entry.target.id;
        const link = document.querySelector(`.nav a[href='${id}']`);
        if (link && entry.isIntersecting) {
          document.querySelectorAll('.nav a').forEach(a => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-50% 0px -40% 0px', threshold: 0 });

    sections.forEach(sec => observer.observe(sec));
  }

  observeSections();

  document.addEventListener('includes:ready', observeSections);
})();

(function () {
  const form = document.getElementById('reserveForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const body =
      `New table request:\n\n` +
      `Name: ${data.get('name')}\n` +
      `Contact: ${data.get('contact')}\n` +
      `Date & Time: ${data.get('datetime')}\n` +
      `Guests: ${data.get('guests')}\n` +
      `Notes: ${data.get('notes') || ''}\n`;
    const mailto = `mailto:admin@taboo.ee?subject=${encodeURIComponent('Table reservation request')}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
})();

(function () {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

(function () {
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.nav-toggle');
    if (!btn) return;

    const nav = document.getElementById('nav');
    if (!nav) return;

    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', function (e) {
    const nav = document.getElementById('nav');
    if (!nav || !nav.classList.contains('open')) return;
    if (e.target.matches('.nav a')) nav.classList.remove('open');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const nav = document.getElementById('nav');
      if (nav) nav.classList.remove('open');
    }
  });
})();
