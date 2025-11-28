// js/events.js — renders upcoming, recurring, past events from assets/events.json
(function () {
  const elUpcoming = document.getElementById('listUpcoming');
  const elRecurring = document.getElementById('listRecurring');
  const elPast = document.getElementById('listPast');

  if (!elUpcoming || !elRecurring || !elPast) return;

  const dayMap = { SU:0, MO:1, TU:2, WE:3, TH:4, FR:5, SA:6 };

  function todayStart() {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }
  function parseDate(s) { return s ? new Date(s) : null; }

  function nextWeeklyOccurrence(rule) {
    // rule = { byDay: ["FR","SA"], time: "20:00" }
    if (!rule || !rule.byDay || !rule.byDay.length) return null;
    const now = new Date();
    const [h, m] = (rule.time || "00:00").split(':').map(Number);
    let best = null;

    for (const code of rule.byDay) {
      const targetDow = dayMap[code.toUpperCase()];
      if (targetDow == null) continue;
      const d = new Date();
      const diff = (targetDow - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + diff);
      d.setHours(h||0, m||0, 0, 0);
      if (d < now) d.setDate(d.getDate() + 7); // next week
      if (!best || d < best) best = d;
    }
    return best;
  }

  function formatDateRange(start, end) {
    if (!start) return '';
    const optsDay = { weekday: 'short', month: 'short', day: 'numeric' };
    const optsTime = { hour: '2-digit', minute: '2-digit' };
    if (!end || end <= start) {
      return `${start.toLocaleDateString(undefined, optsDay)} • ${start.toLocaleTimeString(undefined, optsTime)}`;
    }
    const sameDay = start.toDateString() === end.toDateString();
    if (sameDay) {
      return `${start.toLocaleDateString(undefined, optsDay)} • ${start.toLocaleTimeString(undefined, optsTime)}–${end.toLocaleTimeString(undefined, optsTime)}`;
    }
    return `${start.toLocaleDateString(undefined, optsDay)} → ${end.toLocaleDateString(undefined, optsDay)}`;
  }

  function badge(text) {
    const b = document.createElement('span');
    b.className = 'badge';
    b.textContent = text;
    return b;
  }

  function card(ev, kind, nextOccurDate) {
    const a = document.createElement('article');
    a.className = 'event-card card glass';

    // cover
    if (ev.cover) {
      const cover = document.createElement('div');
      cover.className = 'event-cover';
      cover.innerHTML = `<img src="${ev.cover}" alt="${ev.title}" loading="lazy" decoding="async">`;
      a.appendChild(cover);
    }

    const body = document.createElement('div');
    body.className = 'event-body';

    // title + badges
    const head = document.createElement('div');
    head.className = 'event-head';
    const h3 = document.createElement('h3');
    h3.className = 'event-title';
    h3.textContent = ev.title;

    const badges = document.createElement('div');
    badges.className = 'event-badges';
    if (kind === 'upcoming') badges.appendChild(badge('Upcoming'));
    if (kind === 'recurring') badges.appendChild(badge('Recurring'));
    if (kind === 'past') badges.appendChild(badge('Past'));
    (ev.tags || []).slice(0, 2).forEach(t => badges.appendChild(badge(t)));

    head.appendChild(h3);
    head.appendChild(badges);

    // meta (date/time + location)
    const meta = document.createElement('div');
    meta.className = 'event-meta';
    const start = parseDate(ev.start);
    const end = parseDate(ev.end);
    const whenStr = kind === 'recurring'
      ? (nextOccurDate ? `Next: ${formatDateRange(nextOccurDate, null)}` : 'Weekly')
      : formatDateRange(start, end);
    meta.innerHTML = `
      <div class="event-when">${whenStr}</div>
      ${ev.location ? `<div class="event-where">${ev.location}</div>` : ''}
    `;

    // excerpt
    const p = document.createElement('p');
    p.className = 'event-excerpt';
    p.textContent = ev.excerpt || '';

    body.appendChild(head);
    body.appendChild(meta);
    body.appendChild(p);
    a.appendChild(body);

    return a;
  }

  function render(all) {
    const now0 = todayStart();
    const upcoming = [];
    const recurring = [];
    const past = [];

    for (const ev of all) {
      if (ev.recurring && ev.recurring.freq === 'weekly') {
        const next = nextWeeklyOccurrence(ev.recurring);
        recurring.push({ ev, next });
        continue;
      }
      const start = parseDate(ev.start);
      const end = parseDate(ev.end) || start;
      if (!start) continue;
      // Ongoing or future → Upcoming
      if (end >= now0) upcoming.push({ ev, start, end });
      else past.push({ ev, start, end });
    }

    // sort
    upcoming.sort((a,b) => a.start - b.start);
    recurring.sort((a,b) => (a.next || Infinity) - (b.next || Infinity));
    past.sort((a,b) => b.start - a.start); // newest past first

    // mount
    elUpcoming.innerHTML = '';
    elRecurring.innerHTML = '';
    elPast.innerHTML = '';

    upcoming.forEach(({ev}) => elUpcoming.appendChild(card(ev, 'upcoming')));
    recurring.forEach(({ev, next}) => elRecurring.appendChild(card(ev, 'recurring', next)));
    past.forEach(({ev}) => elPast.appendChild(card(ev, 'past')));
  }

  function bindFilters() {
    const box = document.getElementById('eventsFilters');
    if (!box) return;
    function show(kind){
      const groups = [
        ['upcoming', document.getElementById('group-upcoming')],
        ['recurring', document.getElementById('group-recurring')],
        ['past', document.getElementById('group-past')]
      ];
      groups.forEach(([k, el]) => {
        if (!el) return;
        el.style.display = (kind === 'all' || k === kind) ? '' : 'none';
      });
    }
    box.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      box.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
      btn.classList.add('chip--active');
      show(btn.dataset.filter);
    });
  }

  fetch('assets/events.json', { cache: 'no-cache' })
    .then(r => r.json())
    .then(data => { render(data); bindFilters(); })
    .catch(() => {
      elUpcoming.innerHTML = '<p class="event-empty">No events to show yet.</p>';
    });
})();
// Lightbox for Events page (reuses the markup on events.html)
(function(){
  const lb = document.getElementById('lightbox');
  if (!lb) return; // safety

  const lbImg = document.getElementById('lightboxImg');
  const lbCap = document.getElementById('lightboxCaption');
  const lbClose = lb.querySelector('.lightbox-close');

  function openLB(src, caption){
    lbImg.src = src;
    lbImg.alt = caption || 'Preview';
    lbCap.textContent = caption || '';
    lb.classList.add('open');
  }
  function closeLB(){ lb.classList.remove('open'); }

  // Close interactions
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
  if (lbClose) lbClose.addEventListener('click', closeLB);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLB(); });

  // Delegate clicks on event cover images
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.event-cover img');
    if (!img) return;
    // Caption from the card title
    const card = img.closest('.event-card');
    const caption = card?.querySelector('.event-title')?.textContent?.trim() || '';
    openLB(img.getAttribute('src'), caption);
  });
})();
