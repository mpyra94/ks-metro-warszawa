(function () {
  'use strict';

  // Strona główna jest pod logo, dlatego nie ma jej w menu.
  var NAV = [
    ['o-klubie.html', 'O klubie'],
    ['druzyny.html', 'Drużyny'],
    ['trenerzy.html', 'Trenerzy'],
    ['mecze.html', 'Mecze'],
    ['harmonogram.html', 'Harmonogram treningów'],
    ['dokumenty.html', 'Dokumenty'],
    ['kontakt.html', 'Kontakt']
  ];
  var DAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
  var DAYS_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  var MONTHS_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  var REDUCE_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function paras(t) {
    return String(t || '').split(/\n{2,}/).filter(Boolean).map(function (p) {
      return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }
  function safeUrl(u) {
    return /^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : '';
  }
  function safeImg(u) {
    u = String(u || '').trim();
    if (!u || /^\s*(javascript|data|vbscript):/i.test(u)) return '';
    return u;
  }
  function load(name) {
    return fetch('data/' + name + '.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('Brak pliku data/' + name + '.json');
      return r.json();
    });
  }
  function loadOptional(name) {
    return load(name).catch(function () { return { items: [] }; });
  }
  function toDate(s) {
    var d = new Date(s);
    return isNaN(d) ? null : d;
  }
  function fmtLong(d) {
    return d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function fmtTime(d) {
    return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }
  function $(id) { return document.getElementById(id); }
  function show(id, html) { var el = $(id); if (el) el.innerHTML = html; }
  function items(data) { return (data && Array.isArray(data.items)) ? data.items : []; }
  function slug(s) {
    var t = String(s || '').toLowerCase().replace(/ł/g, 'l');
    if (t.normalize) t = t.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return t.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function initials(name) {
    return String(name || '?').split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join('');
  }

  /* ---------- layout ---------- */
  function renderLayout(settings) {
    var page = document.body.getAttribute('data-page');
    if (page === 'druzyna') page = 'druzyny';
    if (page === 'trener') page = 'trenerzy';
    var links = NAV.map(function (n) {
      var cur = n[0] === page + '.html' ? ' aria-current="page"' : '';
      return '<li><a href="' + n[0] + '"' + cur + '>' + esc(n[1]) + '</a></li>';
    }).join('');
    show('site-header',
      '<div class="wrap">' +
      '<a class="brand" href="index.html" title="Strona główna"><img src="images/logo-white.png" alt=""><span class="brand-name">' + esc(settings.club_name) + '</span></a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav">Menu</button>' +
      '<nav class="nav" id="nav" aria-label="Główna nawigacja"><ul>' + links + '</ul></nav>' +
      '</div>');
    var btn = document.querySelector('.nav-toggle');
    var nav = $('nav');
    if (btn && nav) {
      btn.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    var fb = safeUrl(settings.facebook_url);
    var ig = safeUrl(settings.instagram_url);
    show('site-footer',
      '<div class="wrap">' +
      '<div class="footer-brand"><img src="images/logo-white.png" alt="">' +
      '<p><strong>' + esc(settings.club_name) + '</strong><br>' + esc(settings.tagline) + '</p></div>' +
      '<p>' +
      (fb ? '<a href="' + esc(fb) + '" target="_blank" rel="noopener">Facebook</a>' : '') +
      (fb && ig ? ' · ' : '') +
      (ig ? '<a href="' + esc(ig) + '" target="_blank" rel="noopener">Instagram</a>' : '') +
      '</p>' +
      (settings.footer_note ? '<p>' + esc(settings.footer_note) + '</p>' : '') +
      '</div>');
  }

  /* ---------- slider na stronie głównej ---------- */
  function renderSlider(data) {
    var box = $('slider');
    if (!box) return;
    var list = items(data).filter(function (s) { return s && s.title; });
    if (!list.length) return; // zostaje slajd wpisany na stałe w index.html
    var n = list.length;

    function link(label, url, ghost) {
      url = safeImg(url);
      return label && url ? '<a class="btn' + (ghost ? ' btn-ghost' : '') + '" href="' + esc(url) + '">' + esc(label) + '</a>' : '';
    }
    var html = '<div class="slides">' + list.map(function (s, i) {
      var actions = link(s.button_label, s.button_url, false) + link(s.button2_label, s.button2_url, true);
      return '<div class="slide' + (i === 0 ? ' is-active' : '') + '" role="group" aria-roledescription="slajd" aria-label="' + (i + 1) + ' z ' + n + '"' +
        (i ? ' aria-hidden="true"' : '') + '>' +
        '<p class="slide-title">' + esc(s.title) + '</p>' +
        (s.text ? '<p class="hero-lead">' + esc(s.text) + '</p>' : '') +
        (actions ? '<div class="hero-actions">' + actions + '</div>' : '') + '</div>';
    }).join('') + '</div>';
    if (n > 1) {
      html += '<div class="slider-ctrl">' +
        '<button type="button" class="sl-btn" data-sl="prev" aria-label="Poprzedni slajd">‹</button>' +
        list.map(function (s, i) {
          return '<button type="button" class="sl-dot" data-go="' + i + '" aria-label="Slajd ' + (i + 1) + ': ' + esc(s.title) + '"' +
            (i === 0 ? ' aria-current="true"' : '') + '></button>';
        }).join('') +
        '<button type="button" class="sl-btn" data-sl="next" aria-label="Następny slajd">›</button>' +
        '<button type="button" class="sl-pause" data-sl="pause">' + (REDUCE_MOTION ? 'Wznów' : 'Pauza') + '</button>' +
        '</div>';
    }
    box.innerHTML = html;
    if (n < 2) return;

    var slides = box.querySelectorAll('.slide');
    var dots = box.querySelectorAll('.sl-dot');
    var cur = 0, timer = null, paused = REDUCE_MOTION, hold = false;

    function go(i) {
      cur = (i + n) % n;
      [].forEach.call(slides, function (el, k) {
        el.classList.toggle('is-active', k === cur);
        if (k === cur) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
      });
      [].forEach.call(dots, function (el, k) {
        if (k === cur) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current');
      });
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (!paused && !hold) timer = setInterval(function () { go(cur + 1); }, 7000);
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sl],[data-go]');
      if (!b) return;
      if (b.hasAttribute('data-go')) go(Number(b.getAttribute('data-go')));
      else if (b.getAttribute('data-sl') === 'prev') go(cur - 1);
      else if (b.getAttribute('data-sl') === 'next') go(cur + 1);
      else { paused = !paused; b.textContent = paused ? 'Wznów' : 'Pauza'; }
      start();
    });
    // przewijanie zatrzymuje się, gdy ktoś czyta slajd (kursor lub fokus w obrębie slidera)
    box.addEventListener('mouseenter', function () { hold = true; stop(); });
    box.addEventListener('mouseleave', function () { hold = false; start(); });
    box.addEventListener('focusin', function () { hold = true; stop(); });
    box.addEventListener('focusout', function () { hold = false; start(); });
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) { go(cur + (dx < 0 ? 1 : -1)); start(); }
    }, { passive: true });
    start();
  }

  /* ---------- karuzela zdjęć „Z boiska” ---------- */
  /* ---------- Zaufali nam: loga partnerów i sponsorów ---------- */
  function renderPartners(settings) {
    var wrap = $('partners-wrap');
    var img = safeImg(settings.partners_image);
    if (!img) { if (wrap) wrap.hidden = true; return; }
    if (wrap) wrap.hidden = false;
    show('partners',
      '<div class="partners-logos"><img src="' + esc(img) + '" alt="Zaufali nam: loga firm i instytucji, które wspierają KS Metro Warszawa" loading="lazy"></div>');
  }

  function renderGallery(data) {
    var box = $('gallery');
    if (!box) return;
    var list = items(data).filter(function (g) { return g && safeImg(g.image); });
    if (!list.length) { box.innerHTML = '<p class="empty">Zdjęcia pojawią się wkrótce.</p>'; return; }
    box.innerHTML = '<div class="carousel">' +
      '<div class="car-track" id="car-track" tabindex="0" role="group" aria-label="Zdjęcia z boiska. Przewijaj strzałkami.">' +
      list.map(function (g) {
        return '<figure class="car-item"><img src="' + esc(safeImg(g.image)) + '" alt="' + esc(g.alt || 'Zdjęcie z meczu KS Metro Warszawa') + '" loading="lazy">' +
          (g.credit ? '<figcaption>' + esc(g.credit) + '</figcaption>' : '') + '</figure>';
      }).join('') + '</div>' +
      '<div class="car-ctrl">' +
      '<button type="button" class="sl-btn" data-car="-1" aria-label="Poprzednie zdjęcia">‹</button>' +
      '<button type="button" class="sl-btn" data-car="1" aria-label="Następne zdjęcia">›</button>' +
      '</div></div>';
    var track = $('car-track');
    var prev = box.querySelector('[data-car="-1"]'), next = box.querySelector('[data-car="1"]');
    function update() {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-car]');
      if (!b) return;
      track.scrollBy({ left: Number(b.getAttribute('data-car')) * track.clientWidth * 0.8, behavior: REDUCE_MOTION ? 'auto' : 'smooth' });
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- matches ---------- */
  function upcoming(list) {
    var limit = Date.now() - 3 * 3600 * 1000; // mecz zostaje widoczny jeszcze 3 godziny po starcie
    return list.map(function (m) { return { m: m, d: toDate(m.date) }; })
      .filter(function (x) { return x.d && x.d.getTime() >= limit; })
      .sort(function (a, b) { return a.d - b.d; });
  }
  function kindTag(k) {
    if (k === 'dom') return '<span class="tag tag-kind">Dom</span>';
    if (k === 'wyjazd') return '<span class="tag tag-kind">Wyjazd</span>';
    if (k === 'derby') return '<span class="tag tag-derby">Derby klubowe</span>';
    return '';
  }
  // Stałe hale meczów domowych: juniorzy/kadeci/młodzicy grają w SP 323, seniorzy na UCSIR.
  // Używane tylko, gdy pole "Miejsce" nie zostało wypełnione ręcznie w panelu CMS.
  function homeVenueFor(category) {
    return /senior/i.test(String(category || '')) ? 'UCSIR, ul. Dereniowa 48, Warszawa' : 'SP 323, ul. Hirszfelda 11, Warszawa';
  }
  function effectiveVenue(m) {
    if (m.venue) return m.venue;
    if (m.kind === 'dom' || m.kind === 'derby') return homeVenueFor(m.category);
    return '';
  }
  function matchHtml(x) {
    var m = x.m, d = x.d;
    var past = d.getTime() < Date.now() - 3 * 3600 * 1000;
    var meta = [m.round ? 'kolejka ' + m.round : '', m.league, effectiveVenue(m), m.info].filter(Boolean).map(esc).join(' · ');
    return '<li class="match' + (past ? ' is-past' : '') + '">' +
      '<div class="match-date"><span class="d">' + d.getDate() + '</span><span class="m">' + MONTHS_SHORT[d.getMonth()] + '</span></div>' +
      '<div><p class="match-title">' + (m.result ? '<span class="score">' + esc(m.result) + '</span>' : '') + esc(m.home) + ' – ' + esc(m.away) + '</p>' +
      '<p class="match-meta">' + (m.team ? '<span class="tag">' + esc(m.team) + '</span>' : '') + kindTag(m.kind) +
      esc(d.toLocaleDateString('pl-PL', { weekday: 'long' })) + ', ' + fmtTime(d) + (meta ? ' · ' + meta : '') + '</p></div>' +
      '</li>';
  }
  // Odliczanie do najbliższego meczu: "już za X dni Y godz. Z min W s".
  // Minuty/sekundy/godziny są zawsze dwucyfrowe (zera wiodące), żeby szerokość tekstu
  // nie zmieniała się co sekundę i nie przesuwała sąsiedniej kolumny z nazwami drużyn.
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtCountdown(ms) {
    if (ms <= 0) return 'Mecz się zaczyna!';
    var totalSec = Math.floor(ms / 1000);
    var days = Math.floor(totalSec / 86400);
    var hours = Math.floor((totalSec % 86400) / 3600);
    var mins = Math.floor((totalSec % 3600) / 60);
    var secs = totalSec % 60;
    var parts = [];
    if (days) parts.push(days + ' dni');
    if (days || hours) parts.push(pad2(hours) + ' godz.');
    if (days || hours || mins) parts.push(pad2(mins) + ' min');
    parts.push(pad2(secs) + ' s');
    return 'już za ' + parts.join(' ');
  }
  function tickCountdowns() {
    var els = document.querySelectorAll('[data-countdown-target]');
    [].forEach.call(els, function (el) {
      el.textContent = fmtCountdown(Number(el.getAttribute('data-countdown-target')) - Date.now());
    });
  }
  setInterval(tickCountdowns, 1000);
  // Skaluje nazwy drużyn w widżecie "najbliższy mecz" tak, żeby zawsze zajmowały dokładnie dwa wiersze.
  function fitTwoLines(el) {
    if (!el) return;
    el.style.fontSize = '';
    var size = parseFloat(getComputedStyle(el).fontSize);
    var guard = 0;
    while (guard < 24) {
      var lh = parseFloat(getComputedStyle(el).lineHeight) || size * 1.2;
      if (el.scrollHeight <= lh * 2 + 1 || size <= 13) break;
      size -= 1;
      el.style.fontSize = size + 'px';
      guard++;
    }
  }
  var fitBound = false;
  function renderMatches(data) {
    var list = upcoming(items(data));
    var next = list[0];
    if (next) {
      var m = next.m;
      var venue = effectiveVenue(m);
      show('next-match',
        '<div class="label-wrap"><p class="label">Najbliższy mecz</p>' +
        '<p class="countdown" data-countdown-target="' + next.d.getTime() + '">' + esc(fmtCountdown(next.d.getTime() - Date.now())) + '</p></div>' +
        '<p class="teams">' + esc(m.home) + '<span class="vs">vs.</span><br>' + esc(m.away) + '</p>' +
        '<div class="when-where"><p class="when">' + esc(fmtLong(next.d)) + ', godz. ' + fmtTime(next.d) + '</p>' +
        ([m.team, venue].filter(Boolean).length ? '<p class="where">' + [m.team, venue].filter(Boolean).map(esc).join(' · ') + '</p>' : '') + '</div>');
      var teamsEl = document.querySelector('#next-match .teams');
      fitTwoLines(teamsEl);
      if (!fitBound) {
        fitBound = true;
        window.addEventListener('resize', function () { fitTwoLines(document.querySelector('#next-match .teams')); });
      }
    } else {
      show('next-match', '<p class="label">Najbliższy mecz</p><p class="where">Terminy kolejnych meczów podamy wkrótce.</p>');
    }
    show('matches', list.length
      ? '<ul class="match-list">' + list.slice(0, 8).map(matchHtml).join('') + '</ul>'
      : '<p class="empty">Brak zaplanowanych meczów. Sprawdź ponownie wkrótce.</p>');
  }

  /* ---------- kalendarz miesięczny (strony Mecze i Harmonogram) ---------- */
  function dayKey(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  function matchEvent(x, short) {
    var k = { dom: 'dom', wyjazd: 'wyj.', derby: 'derby' }[x.m.kind] || '';
    return {
      t: fmtTime(x.d), kind: 'match',
      label: short ? (x.m.team || 'Mecz') + (k ? ' (' + k + ')' : '') : 'Mecz' + (x.m.team ? ': ' + x.m.team : ''),
      full: fmtTime(x.d) + ' · ' + (short ? '' : 'mecz: ') + x.m.home + ' – ' + x.m.away + (x.m.team ? ' (' + x.m.team + ')' : '')
    };
  }
  // eventsFor(data) zwraca listę { t: 'GG:MM', kind: 'train' | 'match', label, full }.
  // Zwraca funkcję, która rysuje kalendarz od nowa (np. po zmianie filtra).
  function mountCalendar(host, eventsFor, legend) {
    var now = new Date();
    var view = new Date(now.getFullYear(), now.getMonth(), 1);
    var names = { train: 'Trening', match: 'Mecz' };

    function draw() {
      var y = view.getFullYear(), mo = view.getMonth();
      var first = new Date(y, mo, 1);
      var d = new Date(y, mo, 1 - ((first.getDay() + 6) % 7)); // poniedziałek pierwszego tygodnia
      var cells = '', agenda = '';
      do {
        for (var i = 0; i < 7; i++) {
          var inMonth = d.getMonth() === mo;
          var today = dayKey(d) === dayKey(now);
          var ev = inMonth ? eventsFor(d).sort(function (a, b) { return a.t.localeCompare(b.t); }) : [];
          cells += '<div class="cal-cell' + (inMonth ? '' : ' is-out') + (today ? ' is-today' : '') + '">' +
            '<span class="cal-num">' + d.getDate() + '</span>' +
            ev.map(function (e) {
              return '<span class="cal-ev cal-' + e.kind + '" title="' + esc(e.full) + '">' + esc(e.t) + ' ' + esc(e.label) + '</span>';
            }).join('') + '</div>';
          if (inMonth && ev.length) {
            agenda += '<li' + (today ? ' class="is-today"' : '') + '><p class="cal-day">' +
              esc(d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })) + '</p>' +
              ev.map(function (e) { return '<p class="cal-line cal-' + e.kind + '">' + esc(e.full) + '</p>'; }).join('') + '</li>';
          }
          d.setDate(d.getDate() + 1);
        }
      } while (d.getMonth() === mo && d.getFullYear() === y);

      host.innerHTML =
        '<div class="cal-bar">' +
        '<button type="button" class="chip" data-nav="-1" aria-label="Poprzedni miesiąc">‹<span class="cal-word"> Poprzedni</span></button>' +
        '<h2 class="cal-title" aria-live="polite">' + esc(first.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })) + '</h2>' +
        '<button type="button" class="chip" data-nav="1" aria-label="Następny miesiąc"><span class="cal-word">Następny </span>›</button>' +
        '</div>' +
        (legend.length > 1 ? '<p class="cal-legend">' + legend.map(function (k) { return '<span class="lg-' + k + '">' + names[k] + '</span>'; }).join('') + '</p>' : '') +
        '<div class="cal-grid">' + DAYS_SHORT.map(function (n) { return '<div class="cal-dow">' + n + '</div>'; }).join('') + cells + '</div>' +
        '<ul class="cal-agenda">' + (agenda || '<li>Brak wydarzeń w tym miesiącu.</li>') + '</ul>';
    }
    host.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-nav]');
      if (!nav) return;
      view = new Date(view.getFullYear(), view.getMonth() + Number(nav.getAttribute('data-nav')), 1);
      draw();
      var again = host.querySelector('[data-nav="' + nav.getAttribute('data-nav') + '"]');
      if (again) again.focus();
    });
    return draw;
  }

  /* ---------- pełny terminarz (strona Mecze): kalendarz i lista ---------- */
  function renderMatchesPage(data) {
    var all = items(data).map(function (m) { return { m: m, d: toDate(m.date) }; })
      .filter(function (x) { return x.d; })
      .sort(function (a, b) { return a.d - b.d; });
    var cats = [];
    all.forEach(function (x) { if (x.m.category && cats.indexOf(x.m.category) < 0) cats.push(x.m.category); });
    var state = { cat: '', past: false, view: 'list' };

    show('matches', '<div id="m-cal"></div><div id="m-list" hidden></div>');
    var drawCal = mountCalendar($('m-cal'), function (d) {
      return all.filter(function (x) { return dayKey(x.d) === dayKey(d) && (!state.cat || x.m.category === state.cat); })
        .map(function (x) { return matchEvent(x, true); });
    }, ['match']);

    function drawList() {
      var limit = Date.now() - 3 * 3600 * 1000;
      var list = all.filter(function (x) {
        return (!state.cat || x.m.category === state.cat) && (state.past || x.d.getTime() >= limit);
      });
      if (!list.length) { show('m-list', '<p class="empty">Brak meczów dla wybranych ustawień.</p>'); return; }
      var out = '', last = '';
      list.forEach(function (x) {
        var key = x.d.getFullYear() + '-' + x.d.getMonth();
        if (key !== last) {
          last = key;
          if (out) out += '</ul>';
          out += '<h2 class="month">' + esc(x.d.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })) + '</h2><ul class="match-list">';
        }
        out += matchHtml(x);
      });
      show('m-list', out + '</ul>');
    }
    function draw() {
      var cal = state.view === 'cal';
      $('m-cal').hidden = !cal;
      $('m-list').hidden = cal;
      $('past-wrap').style.display = cal ? 'none' : '';
      if (cal) drawCal(); else drawList();
    }

    var views = [['list', 'Lista'], ['cal', 'Kalendarz']].map(function (v) {
      return '<button type="button" class="chip" data-mview="' + v[0] + '" aria-pressed="' + (state.view === v[0] ? 'true' : 'false') + '">' + v[1] + '</button>';
    }).join('');
    var btns = [''].concat(cats).map(function (c) {
      return '<button type="button" class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (state.cat === c ? 'true' : 'false') + '">' + esc(c || 'Wszystkie') + '</button>';
    }).join('');
    show('matches-filters',
      '<div class="filters" role="group" aria-label="Widok">' + views + '</div>' +
      '<div class="filters" role="group" aria-label="Drużyny">' + btns +
      '<label class="check" id="past-wrap"><input type="checkbox" id="past-toggle"> Pokaż także rozegrane</label></div>');
    $('matches-filters').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat],[data-mview]');
      if (!b) return;
      var attr = b.hasAttribute('data-cat') ? 'data-cat' : 'data-mview';
      if (attr === 'data-cat') state.cat = b.getAttribute(attr); else state.view = b.getAttribute(attr);
      [].forEach.call(document.querySelectorAll('[' + attr + ']'), function (el) {
        el.setAttribute('aria-pressed', el === b ? 'true' : 'false');
      });
      draw();
    });
    $('past-toggle').addEventListener('change', function () { state.past = this.checked; draw(); });
    draw();
  }

  /* ---------- Aktualności: posty z Facebooka ---------- */
  // Kolejność prób (wszystko ładuje się od razu, bez klikania):
  // 1. kod widżetu wklejony w panelu (Ustawienia strony → Kod widżetu z postami),
  // 2. własna funkcja /.netlify/functions/fb-posts (pobiera posty przez API Facebooka; wymaga tokenu, patrz README),
  // 3. oficjalna wtyczka Facebooka. Uwaga: Facebook pokazuje w niej posty tylko osobom zalogowanym na Facebooku.

  // Wstawia kod widżetu wklejony w panelu (np. Elfsight, SociableKIT). Wykonuje tylko skrypty z adresów https.
  function mountWidget(target, code) {
    var doc = new DOMParser().parseFromString(code, 'text/html');
    var srcs = [];
    [].forEach.call(doc.querySelectorAll('script'), function (s) {
      var u = s.getAttribute('src');
      if (u && /^https:\/\//i.test(u)) srcs.push(u);
      s.parentNode.removeChild(s);
    });
    [].forEach.call(doc.body.querySelectorAll('*'), function (el) {
      [].slice.call(el.attributes).forEach(function (a) {
        if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) el.removeAttribute(a.name);
      });
    });
    target.innerHTML = doc.body.innerHTML;
    srcs.forEach(function (u) {
      var s = document.createElement('script');
      s.src = u;
      s.async = true;
      document.body.appendChild(s);
    });
  }

  function fbPostHtml(p) {
    var d = toDate(p.date);
    var msg = String(p.message || '').trim();
    if (msg.length > 320) msg = msg.slice(0, 320).replace(/\s+\S*$/, '') + '…';
    var link = safeUrl(p.url), img = safeUrl(p.image);
    return '<article class="fb-post">' +
      (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : '') +
      (d ? '<p class="news-date">' + esc(d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })) + '</p>' : '') +
      (msg ? paras(msg) : '') +
      (link ? '<p><a href="' + esc(link) + '" target="_blank" rel="noopener">Zobacz na Facebooku</a></p>' : '') +
      '</article>';
  }

  function renderFacebook(settings, height) {
    var box = $('fb');
    if (!box) return;
    var url = safeUrl(settings.facebook_url);
    var code = String(settings.news_widget_code || '').trim();
    if (!url && !code) {
      box.innerHTML = '<p class="empty">Adres profilu na Facebooku można ustawić w panelu administracyjnym.</p>';
      return;
    }
    box.innerHTML =
      '<div class="fb-head"><h3>Najnowsze posty z Facebooka</h3>' +
      (url ? '<a class="btn btn-small" href="' + esc(url) + '" target="_blank" rel="noopener">Otwórz profil</a>' : '') +
      '</div><div id="fb-frame"></div>';
    var host = $('fb-frame');

    if (code) {
      host.className = 'widget-host';
      mountWidget(host, code);
      return;
    }
    function plugin() {
      if (!url) return;
      var src = 'https://www.facebook.com/plugins/page.php?href=' + encodeURIComponent(url) +
        '&tabs=timeline&width=500&height=' + (height || 640) + '&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false';
      host.innerHTML =
        '<p class="fb-note">Facebook pokazuje posty w tym oknie tylko osobom zalogowanym na Facebooku. ' +
        'Jeśli okno jest puste, <a href="' + esc(url) + '" target="_blank" rel="noopener">zobacz posty na naszym profilu</a>.</p>' +
        '<iframe title="Posty z Facebooka" src="' + esc(src) + '" style="height:' + (height || 640) + 'px" loading="lazy" allow="encrypted-media"></iframe>';
    }
    fetch('/.netlify/functions/fb-posts', { headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) {
        var list = items(d);
        if (!list.length) throw new Error('brak postów');
        host.innerHTML = list.map(fbPostHtml).join('');
      })
      .catch(plugin);
  }

  /* ---------- O klubie: historia, absolwenci, sukcesy ---------- */
  function renderHistory(data) {
    show('history-intro', data.intro ? '<p class="history-intro">' + esc(data.intro) + '</p>' : '');
    var list = items(data);
    show('timeline', list.length
      ? '<ol class="timeline">' + list.map(function (h) {
          return '<li><div class="year">' + esc(h.year) + '</div><h3>' + esc(h.title) + '</h3>' + '<p>' + esc(h.text) + '</p></li>';
        }).join('') + '</ol>'
      : '<p class="empty">Historia klubu pojawi się wkrótce.</p>');
  }
  function renderAlumni(data) {
    var list = items(data);
    show('alumni',
      (data.intro ? '<p class="history-intro">' + esc(data.intro) + '</p>' : '') +
      (list.length
        ? '<div class="coach-grid">' + list.map(function (a) {
            var img = safeImg(a.photo);
            return '<article class="coach"><div class="coach-photo">' +
              (img ? '<img src="' + esc(img) + '" alt="' + esc(a.name) + '" loading="lazy">' : '<span class="initials" aria-hidden="true">' + esc(initials(a.name)) + '</span>') +
              '</div><div class="coach-info"><h3>' + esc(a.name) + '</h3>' +
              (a.years ? '<p class="coach-role">' + esc(a.years) + '</p>' : '') +
              (a.text ? '<p>' + esc(a.text) + '</p>' : '') + '</div></article>';
          }).join('') + '</div>'
        : '<p class="empty">Listę absolwentów klubu uzupełnimy wkrótce.</p>'));
  }
  function renderAchievements(data) {
    var list = items(data);
    show('achievements',
      (data.intro ? '<p class="history-intro">' + esc(data.intro) + '</p>' : '') +
      (list.length
        ? '<ul class="ach-list">' + list.map(function (a) {
            return '<li class="ach"><div class="ach-year">' + esc(a.year) + '</div><div>' +
              (a.team ? '<span class="tag">' + esc(a.team) + '</span>' : '') +
              '<h3>' + esc(a.title) + '</h3>' + (a.text ? '<p>' + esc(a.text) + '</p>' : '') + '</div></li>';
          }).join('') + '</ul>'
        : '<p class="empty">Listę sukcesów uzupełnimy wkrótce.</p>'));
  }
  // Karty na stronie (Historia / Absolwenci / Sukcesy). Wybraną kartę pamięta adres, np. o-klubie.html#sukcesy
  function initTabs() {
    var tabs = [].slice.call(document.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    function id(t) { return t.getAttribute('data-tab'); }
    function select(name, focus) {
      tabs.forEach(function (t) {
        var on = id(t) === name;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = $(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
        if (on && focus) t.focus();
      });
    }
    function fromHash() {
      var h = (window.location.hash || '').slice(1);
      return tabs.some(function (t) { return id(t) === h; }) ? h : id(tabs[0]);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        select(id(t), false);
        if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#' + id(t));
      });
      t.addEventListener('keydown', function (e) {
        var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        var next = tabs[(i + step + tabs.length) % tabs.length];
        select(id(next), true);
        if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#' + id(next));
      });
    });
    window.addEventListener('hashchange', function () { select(fromHash(), false); });
    select(fromHash(), false);
  }

  /* ---------- coaches ---------- */
  function coachUrl(c) { return 'trener.html?t=' + encodeURIComponent(slug(c.name)); }
  function renderCoaches(data) {
    var list = items(data);
    show('coaches', list.length
      ? '<div class="coach-grid">' + list.map(function (c) {
          var img = safeImg(c.photo);
          var url = esc(coachUrl(c));
          return '<article class="coach"><a class="coach-photo" href="' + url + '" tabindex="-1" aria-hidden="true">' +
            (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : '<span class="initials">' + esc(initials(c.name)) + '</span>') +
            '</a><div class="coach-info"><h3><a href="' + url + '">' + esc(c.name) + '</a></h3>' +
            '<p class="coach-role">' + esc(c.role) + (c.team ? ' · ' + esc(c.team) : '') + '</p>' +
            '<p class="team-actions"><a class="btn btn-small" href="' + url + '">Zobacz profil</a></p></div></article>';
        }).join('') + '</div>'
      : '<p class="empty">Informacje o trenerach pojawią się wkrótce.</p>');
  }

  /* ---------- podstrona jednego trenera: trener.html?t=imie-nazwisko ---------- */
  function renderCoachPage(data, teamData) {
    var id = '';
    try { id = new URLSearchParams(window.location.search).get('t') || ''; } catch (e) { id = ''; }
    var c = items(data).filter(function (x) { return slug(x.name) === id; })[0];
    if (!c) {
      show('coach', '<p class="empty">Nie znaleziono takiego trenera. <a href="trenerzy.html">Zobacz wszystkich trenerów</a>.</p>');
      return;
    }
    document.title = c.name + ' | KS Metro Warszawa';
    var h = $('coach-name');
    if (h) h.textContent = c.name;
    var sub = $('coach-sub');
    if (sub) sub.textContent = [c.role, c.team].filter(Boolean).join(' · ');

    var img = safeImg(c.photo);
    var mine = items(teamData).filter(function (t) {
      return teamCoaches(t).some(function (n) { return n.toLowerCase() === String(c.name || '').trim().toLowerCase(); });
    });
    show('coach',
      '<div class="coach-page">' +
      '<div class="coach-portrait">' +
      (img ? '<img src="' + esc(img) + '" alt="' + esc(c.name) + '">' : '<span aria-hidden="true">' + esc(initials(c.name)) + '</span>') +
      '</div><div>' +
      '<h2 class="section-title">O trenerze</h2>' +
      (c.bio ? paras(c.bio) : '<p class="empty">Opis trenera pojawi się wkrótce.</p>') +
      '<h2 class="section-title">Prowadzone drużyny</h2>' +
      (mine.length
        ? '<ul class="team-links">' + mine.map(function (t) {
            return '<li><a class="chip" href="' + esc(teamUrl(t)) + '">' + esc(t.name) + '</a></li>';
          }).join('') + '</ul>'
        : '<p class="empty">' + (c.team ? esc(c.team) : 'Informacja o drużynach pojawi się wkrótce.') + '</p>') +
      '</div></div>' +
      '<p class="team-back"><a class="btn btn-small" href="trenerzy.html">Wszyscy trenerzy</a></p>');
  }

  /* ---------- schedule: lista i kalendarz ---------- */
  function renderSchedule(data, matchData) {
    var box = $('schedule');
    if (!box) return;
    var list = items(data);
    var matches = items(matchData).map(function (m) { return { m: m, d: toDate(m.date) }; })
      .filter(function (x) { return x.d; });

    var out = '';
    DAYS.forEach(function (day) {
      var slots = list.filter(function (s) { return s.day === day; })
        .sort(function (a, b) { return String(a.from).localeCompare(String(b.from)); });
      if (!slots.length) return;
      out += '<section class="day-block"><h2>' + esc(day) + '</h2><ul class="slots">' +
        slots.map(function (s) {
          var meta = [s.place, s.notes].filter(Boolean).map(esc).join(' · ');
          return '<li class="slot"><div class="slot-time">' + esc(s.from) + ' – ' + esc(s.to) + '</div>' +
            '<div><p class="slot-group">' + esc(s.group) + '</p>' + (meta ? '<p class="slot-meta">' + meta + '</p>' : '') + '</div></li>';
        }).join('') + '</ul></section>';
    });

    box.innerHTML =
      '<div class="filters" role="group" aria-label="Widok">' +
      '<button type="button" class="chip" data-view="list" aria-pressed="true">Lista</button>' +
      '<button type="button" class="chip" data-view="cal" aria-pressed="false">Kalendarz</button>' +
      '</div>' +
      '<div id="sched-list">' + (out || '<p class="empty">Harmonogram zajęć pojawi się wkrótce.</p>') + '</div>' +
      '<div id="sched-cal" hidden></div>' +
      (data.note ? '<p class="note">' + esc(data.note) + '</p>' : '');

    var drawCal = mountCalendar($('sched-cal'), function (d) {
      var ev = [];
      var dayName = DAYS[(d.getDay() + 6) % 7];
      list.forEach(function (s) {
        if (s.day !== dayName) return;
        ev.push({
          t: String(s.from || ''), kind: 'train', label: s.group || 'Trening',
          full: [(s.from || '') + ' – ' + (s.to || ''), s.group, s.place, s.notes].filter(Boolean).join(' · ')
        });
      });
      matches.forEach(function (x) { if (dayKey(x.d) === dayKey(d)) ev.push(matchEvent(x, false)); });
      return ev;
    }, ['train', 'match']);

    box.addEventListener('click', function (e) {
      var v = e.target.closest('[data-view]');
      if (!v) return;
      var cal = v.getAttribute('data-view') === 'cal';
      [].forEach.call(box.querySelectorAll('[data-view]'), function (el) {
        el.setAttribute('aria-pressed', el === v ? 'true' : 'false');
      });
      $('sched-list').hidden = cal;
      $('sched-cal').hidden = !cal;
      if (cal) drawCal();
    });
  }

  /* ---------- contact ---------- */
  function renderContact(data) {
    var rows = '';
    if (data.address) rows += '<dt>Adres</dt><dd>' + paras(data.address).replace(/^<p>|<\/p>$/g, '') + '</dd>';
    if (data.email) rows += '<dt>E-mail</dt><dd><a href="mailto:' + esc(data.email) + '">' + esc(data.email) + '</a></dd>';
    if (data.phone) rows += '<dt>Telefon</dt><dd>' + String(data.phone).split(/[,;\/]/).map(function (p) {
      p = p.trim();
      return p ? '<a href="tel:' + esc(p.replace(/[^\d+]/g, '')) + '">' + esc(p) + '</a>' : '';
    }).filter(Boolean).join('<br>') + '</dd>';
    if (data.hours) rows += '<dt>Godziny</dt><dd>' + esc(data.hours) + '</dd>';
    var map = safeUrl(data.map_url);
    var route = safeUrl(data.route_url);
    show('contact',
      '<div class="contact-card"><dl>' + rows + '</dl>' +
      (data.extra ? '<p style="margin-top:1.25rem">' + esc(data.extra) + '</p>' : '') + '</div>' +
      (map || route ? '<h2 class="section-title contact-map-title">Dojazd</h2>' : '') +
      (map ? '<div class="map-wrap"><iframe title="Mapa dojazdu do klubu" src="' + esc(map) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>' : '') +
      (route ? '<p><a class="btn btn-small" href="' + esc(route) + '" target="_blank" rel="noopener">Wyznacz trasę</a></p>' : ''));
    // adres e-mail do komunikatu o błędzie formularza
    if (data.email) document.body.setAttribute('data-club-mail', data.email);
  }

  // Formularz zgłoszeniowy wysyłany przez Netlify Forms (działa po wdrożeniu na Netlify).
  function initContactForm() {
    var form = $('signup-form');
    var status = $('form-status');
    if (!form || !status) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      status.className = 'form-status';
      status.textContent = 'Wysyłamy zgłoszenie…';
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        form.reset();
        status.className = 'form-status ok';
        status.textContent = 'Dziękujemy! Zgłoszenie zostało wysłane. Odezwiemy się wkrótce.';
      }).catch(function () {
        var mail = document.body.getAttribute('data-club-mail') || '';
        status.className = 'form-status err';
        status.innerHTML = 'Nie udało się wysłać formularza. Spróbuj ponownie' +
          (mail ? ' albo napisz na adres <a href="mailto:' + esc(mail) + '">' + esc(mail) + '</a>' : '') + '.';
      }).then(function () { btn.disabled = false; });
    });
  }

  /* ---------- teams ---------- */
  function teamUrl(t) { return 'druzyna.html?d=' + encodeURIComponent(slug(t.name)); }
  function teamCoaches(t) {
    var a = Array.isArray(t.coaches) ? t.coaches.slice() : (t.coaches ? [t.coaches] : []);
    if (t.coach) a.push(t.coach);
    var seen = {};
    return a.map(function (n) { return String(n || '').trim(); })
      .filter(function (n) { if (!n || seen[n.toLowerCase()]) return false; seen[n.toLowerCase()] = 1; return true; });
  }
  function teamPlayers(t) {
    return (Array.isArray(t.players) ? t.players : []).map(function (p) {
      return typeof p === 'string' ? { name: p } : (p || {});
    }).filter(function (p) { return p.name; });
  }
  function teamMatches(team, matches) {
    return upcoming(matches).filter(function (x) {
      return x.m.team === team.name || (x.m.kind === 'derby' && !!team.category && x.m.category === team.category);
    });
  }
  function teamPhoto(t, cls) {
    var img = safeImg(t.photo);
    return '<div class="' + cls + (img ? '' : ' no-photo') + '">' +
      (img ? '<img src="' + esc(img) + '" alt="Zdjęcie drużyny ' + esc(t.name) + '" loading="lazy">'
           : '<img class="team-logo" src="images/logo-white.png" alt="">') + '</div>';
  }

  function renderTeams(data, matchData) {
    var list = items(data);
    var matches = items(matchData);
    show('teams', list.length
      ? '<div class="team-grid">' + list.map(function (t) {
          var nx = teamMatches(t, matches)[0];
          var coaches = teamCoaches(t);
          var count = teamPlayers(t).length;
          var meta = [t.category, t.league].filter(Boolean).map(esc).join(' · ');
          return '<article class="team">' + teamPhoto(t, 'team-photo') +
            '<div class="team-body"><h3><a href="' + esc(teamUrl(t)) + '">' + esc(t.name) + '</a></h3>' +
            (meta ? '<p class="team-meta">' + meta + '</p>' : '') +
            (t.description ? '<p>' + esc(t.description) + '</p>' : '') +
            (coaches.length ? '<p class="team-line"><strong>' + (coaches.length > 1 ? 'Trenerzy' : 'Trener') + ':</strong> ' + coaches.map(esc).join(', ') + '</p>' : '') +
            (count ? '<p class="team-line"><strong>Skład:</strong> ' + count + ' ' + (count === 1 ? 'osoba' : 'osób') + '</p>' : '') +
            (nx ? '<p class="team-next"><span class="tag">Najbliższy mecz</span>' +
              esc(nx.d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })) + ', ' + fmtTime(nx.d) +
              '<br>' + esc(nx.m.home) + ' – ' + esc(nx.m.away) + '</p>' : '') +
            '<p class="team-actions"><a class="btn btn-small" href="' + esc(teamUrl(t)) + '">Zobacz drużynę</a></p>' +
            '</div></article>';
        }).join('') + '</div>'
      : '<p class="empty">Informacje o drużynach pojawią się wkrótce.</p>');
  }

  /* ---------- podstrona jednej drużyny: druzyna.html?d=nazwa ---------- */
  function renderTeamPage(data, coachData, matchData) {
    var id = '';
    try { id = new URLSearchParams(window.location.search).get('d') || ''; } catch (e) { id = ''; }
    var t = items(data).filter(function (x) { return slug(x.name) === id; })[0];
    if (!t) {
      show('team', '<p class="empty">Nie znaleziono takiej drużyny. <a href="druzyny.html">Zobacz wszystkie drużyny</a>.</p>');
      return;
    }
    document.title = t.name + ' | KS Metro Warszawa';
    var h = $('team-name');
    if (h) h.textContent = t.name;
    var sub = $('team-sub');
    if (sub) sub.textContent = [t.category, t.league].filter(Boolean).join(' · ');

    var known = items(coachData);
    var coaches = teamCoaches(t).map(function (name) {
      var c = known.filter(function (k) { return String(k.name || '').trim().toLowerCase() === name.toLowerCase(); })[0];
      return c || { name: name, unlisted: true };
    });
    var players = teamPlayers(t);
    var next = teamMatches(t, items(matchData)).slice(0, 3);

    show('team',
      teamPhoto(t, 'team-hero') +
      (t.description ? '<p class="history-intro">' + esc(t.description) + '</p>' : '') +
      '<div class="team-cols">' +
      '<section><h2 class="section-title">Skład drużyny</h2>' +
      (players.length
        ? '<ul class="roster">' + players.map(function (p) {
            return '<li><span class="roster-num">' + esc(p.number || '') + '</span>' +
              '<span class="roster-name">' + esc(p.name) + '</span>' +
              '<span class="roster-pos">' + esc(p.position || '') + '</span></li>';
          }).join('') + '</ul>'
        : '<p class="empty">Skład drużyny pojawi się wkrótce.</p>') +
      '</section>' +
      '<aside class="team-side"><h2 class="section-title">' + (coaches.length > 1 ? 'Trenerzy' : 'Trener') + '</h2>' +
      (coaches.length
        ? coaches.map(function (c) {
            var img = safeImg(c.photo);
            return '<div class="coach-mini"><div class="ph">' +
              (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : '<span aria-hidden="true">' + esc(initials(c.name)) + '</span>') +
              '</div><div><p class="nm">' + (c.unlisted ? esc(c.name) : '<a href="' + esc(coachUrl(c)) + '">' + esc(c.name) + '</a>') + '</p>' + (c.role ? '<p class="rl">' + esc(c.role) + '</p>' : '') + '</div></div>';
          }).join('')
        : '<p class="empty">Informacja o trenerze pojawi się wkrótce.</p>') +
      '<h2 class="section-title">Najbliższe mecze</h2>' +
      (next.length
        ? '<ul class="match-list">' + next.map(matchHtml).join('') + '</ul>'
        : '<p class="empty">Brak zaplanowanych meczów tej drużyny.</p>') +
      '</aside></div>' +
      '<p class="team-back"><a class="btn btn-small" href="druzyny.html">Wszystkie drużyny</a> ' +
      '<a class="btn btn-small btn-ghost" style="color:var(--blue);border-color:var(--blue)" href="mecze.html">Cały terminarz</a></p>');
  }

  /* ---------- documents ---------- */
  function renderDocuments(data) {
    show('documents-intro', data.intro ? '<p class="history-intro">' + esc(data.intro) + '</p>' : '');
    var list = items(data);
    if (!list.length) { show('documents', '<p class="empty">Dokumenty pojawią się wkrótce.</p>'); return; }
    var groups = [], byGroup = {};
    list.forEach(function (d) {
      var g = d.group || 'Dokumenty';
      if (!byGroup[g]) { byGroup[g] = []; groups.push(g); }
      byGroup[g].push(d);
    });
    show('documents', groups.map(function (g) {
      return '<section class="doc-group"><h2>' + esc(g) + '</h2><ul class="doc-list">' + byGroup[g].map(function (d) {
        var file = safeImg(d.file);
        var m = /\.([a-z0-9]{2,5})(?:\?|#|$)/i.exec(file);
        var ext = m ? m[1].toUpperCase() : 'PLIK';
        return '<li class="doc"><span class="doc-ext" aria-hidden="true">' + esc(ext) + '</span>' +
          '<div><p class="doc-title">' + esc(d.title) + '</p>' +
          (d.description ? '<p class="doc-desc">' + esc(d.description) + '</p>' : '') + '</div>' +
          (file ? '<a class="btn btn-small" href="' + esc(file) + '" download target="_blank" rel="noopener">Pobierz</a>'
                : '<span class="doc-soon">Plik wkrótce</span>') + '</li>';
      }).join('') + '</ul></section>';
    }).join(''));
  }

  /* Wyrównuje wysokość „Aktualności” i „Nadchodzące mecze” na stronie głównej — na
     każdej szerokości ekranu, obok siebie na desktopie i jedna pod drugą na mobile.
     Każda z nich dostaje tę samą wysokość: mniejszą z dwóch naturalnych wysokości
     (scrollHeight działa niezależnie od tego, czy overflow jest już przycięty), więc
     żadna nie ma „wolnej przestrzeni” — krótsza pokazuje się w całości, dłuższa się
     przewija (patrz overflow-y:auto na .fb-box w css/style.css). Widżet FB (np.
     Elfsight) dogrywa swoją wysokość asynchronicznie, więc pilnujemy obu kolumn przez
     ResizeObserver i dodatkowo przeliczamy kilka razy po starcie. */
  function syncColumnsHeight() {
    var fb = $('fb'), matches = $('matches');
    if (!fb || !matches) return;
    function apply() {
      var h = Math.min(fb.scrollHeight, matches.scrollHeight);
      if (h > 0) {
        fb.style.maxHeight = h + 'px';
        matches.style.maxHeight = h + 'px';
      }
    }
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(apply).observe(fb);
      new ResizeObserver(apply).observe(matches);
    } else {
      window.addEventListener('resize', apply);
    }
    apply();
    [300, 800, 1500, 3000].forEach(function (t) { setTimeout(apply, t); });
  }

  /* ---------- start ---------- */
  function fail(err) {
    var main = document.querySelector('main');
    if (main) {
      main.insertAdjacentHTML('afterbegin',
        '<div class="wrap section"><p class="error">Nie udało się wczytać danych strony (' + esc(err && err.message) + '). ' +
        'Odśwież stronę. Jeśli otwierasz pliki lokalnie, uruchom je przez prosty serwer (patrz README).</p></div>');
    }
  }

  var page = document.body.getAttribute('data-page');
  load('settings').then(function (settings) {
    renderLayout(settings);

    var jobs = [];
    if (page === 'index') {
      jobs.push(loadOptional('slides').then(renderSlider));
      jobs.push(load('matches').then(renderMatches));
      jobs.push(loadOptional('gallery').then(renderGallery));
      renderFacebook(settings, 640);
      renderPartners(settings);
      syncColumnsHeight();
    } else if (page === 'mecze') {
      jobs.push(load('matches').then(renderMatchesPage));
    } else if (page === 'o-klubie') {
      initTabs();
      jobs.push(load('history').then(renderHistory));
      jobs.push(loadOptional('alumni').then(renderAlumni));
      jobs.push(loadOptional('achievements').then(renderAchievements));
    } else if (page === 'trenerzy') {
      jobs.push(load('coaches').then(renderCoaches));
    } else if (page === 'trener') {
      jobs.push(Promise.all([load('coaches'), loadOptional('teams')]).then(function (r) { renderCoachPage(r[0], r[1]); }));
    } else if (page === 'harmonogram') {
      jobs.push(Promise.all([load('schedule'), loadOptional('matches')]).then(function (r) { renderSchedule(r[0], r[1]); }));
    } else if (page === 'druzyny') {
      jobs.push(Promise.all([load('teams'), loadOptional('matches')]).then(function (r) { renderTeams(r[0], r[1]); }));
    } else if (page === 'druzyna') {
      jobs.push(Promise.all([load('teams'), loadOptional('coaches'), loadOptional('matches')]).then(function (r) { renderTeamPage(r[0], r[1], r[2]); }));
    } else if (page === 'dokumenty') {
      jobs.push(load('documents').then(renderDocuments));
    } else if (page === 'kontakt') {
      jobs.push(load('contact').then(renderContact));
      initContactForm();
    }
    return Promise.all(jobs);
  }).catch(fail);
})();
