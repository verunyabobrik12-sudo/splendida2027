(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var hasIO = 'IntersectionObserver' in window;
  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };

  /* ---------- Видео: первый экран и ролики (грузим и играем только на экране) ---------- */
  var hv = $('#heroVideo');
  if (hv && !reduce) { hv.src = 'video/hero-couple-m.mp4'; var pp = hv.play(); if (pp && pp.catch) pp.catch(function () {}); }
  if (!reduce && hasIO) {
    var vio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { if (!v.src) v.src = v.getAttribute('data-src'); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (v.src) v.pause();
      });
    }, { threshold: .3 });
    $$('video[data-src]').forEach(function (v) { vio.observe(v); });
  }

  /* ---------- Прокрутка лент стрелками ---------- */
  function stepScroll(box, dir) {
    var item = box.firstElementChild; if (!item) return;
    var w = item.getBoundingClientRect().width + 16;
    box.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- Маршрут: карта + дни ---------- */
  var W = window.MAP_W, H = window.MAP_H, LON0 = 11, LON1 = 31, LAT0 = 34.2, LAT1 = 47.2;
  function P(lon, lat) { return [(lon - LON0) / (LON1 - LON0) * W, (LAT1 - lat) / (LAT1 - LAT0) * H]; }
  var PORTS = {
    ist: { n: 'Стамбул', ll: [28.98, 41.01], dx: -8, dy: -22, anchor: 'end' },
    cor: { n: 'Корфу', ll: [19.92, 39.62], dx: -16, dy: 6, anchor: 'end' },
    bar: { n: 'Бари', ll: [16.87, 41.12], dx: 16, dy: 5, anchor: 'start' },
    tri: { n: 'Триест', ll: [13.77, 45.65], dx: 16, dy: 5, anchor: 'start' },
    spl: { n: 'Сплит', ll: [16.44, 43.51], dx: 16, dy: 5, anchor: 'start' },
    pir: { n: 'Пирей', ll: [23.64, 37.94], dx: -16, dy: 22, anchor: 'end' },
    kus: { n: 'Кушадасы', ll: [27.26, 37.86], dx: 6, dy: 28, anchor: 'middle' }
  };
  var PATH = [[28.98, 41.01], [27.4, 40.55], [26.3, 40.0], [25.2, 38.6], [23.6, 36.5], [21.2, 36.9], [19.92, 39.62],
    [18.3, 40.5], [16.87, 41.12], [17.6, 42.2], [15.6, 43.3], [14.3, 44.8], [13.77, 45.65],
    [14.3, 44.6], [15.4, 43.65], [16.44, 43.51], [17.6, 42.4], [18.9, 41.0], [19.4, 39.6], [20.2, 38.4], [21.6, 36.9], [22.9, 36.9], [23.64, 37.94],
    [25.1, 37.8], [26.6, 37.8], [27.26, 37.86], [26.4, 38.8], [26.3, 40.0], [27.5, 40.6], [28.98, 41.01]];
  var DAYS = [
    { d: 1, p: 'ist', t: 'Стамбул', c: 'Турция', tm: 'отплытие в 23:00', img: 'images/v-ist-sunset.jpg', alt: 'Закат над Стамбулом', x: 'Посадка в порту и отплытие в 23:00. До этого свободное время: накануне вы уже в отеле, а утром можно пройтись по старому городу.' },
    { d: 2, p: null, t: 'День в море', c: 'на борту', tm: 'весь день', img: 'images/deck-03.jpg', alt: 'Бассейн на палубе вечером', x: 'Целый день на лайнере: бассейны и джакузи, рестораны, спа, вечернее шоу в театре.' },
    { d: 3, p: 'cor', t: 'о. Корфу', c: 'Греция', tm: '13:00–21:00 · 8 часов', img: 'images/v-corfu-town.jpg', alt: 'Старый город Керкира на острове Корфу', x: 'Старый город Керкира входит в список Всемирного наследия ЮНЕСКО: узкие улочки, венецианские крепости, прогулочная улица Листон.' },
    { d: 4, p: 'bar', t: 'Бари', c: 'Италия', tm: '07:00–14:00 · 7 часов', img: 'images/v-bari-aerial.jpg', alt: 'Бари с высоты', x: 'Старый город Бари-Веккья с узкими переулками и базилика Святого Николая. Стоянка короткая, лучше выйти на берег сразу после прихода.' },
    { d: 5, p: 'tri', t: 'Триест', c: 'Италия', tm: '09:00–19:00 · 10 часов', img: 'images/trieste-s.jpg', alt: 'Панорама Триеста', x: 'Площадь Единства Италии прямо у моря, кафе и набережная. Десяти часов хватит и на город, и на прогулку к замку Мирамаре.' },
    { d: 6, p: 'spl', t: 'Сплит', c: 'Хорватия', tm: '09:00–18:00 · 9 часов', img: 'images/split.jpg', alt: 'Перистиль во дворце Диоклетиана в Сплите', x: 'Дворец Диоклетиана — жилой квартал внутри римских стен, он тоже в списке ЮНЕСКО. От причала до стен можно дойти пешком.', cr: 'Фото: Jazzmaster1997, Wikimedia Commons, CC0' },
    { d: 7, p: null, t: 'День в море', c: 'на борту', tm: 'весь день', img: 'images/aerial-03.jpg', alt: 'Лайнер MSC в открытом море', x: 'Второй день в море: время для отдыха, спа и вечерней программы.' },
    { d: 8, p: 'pir', t: 'Пирей (Афины)', c: 'Греция', tm: '08:00–18:00 · 10 часов', img: 'images/v-athens-erechtheion.jpg', alt: 'Эрехтейон на Акрополе в Афинах', x: 'Пирей — порт Афин. До Акрополя и центра города удобно добраться на метро или такси, поэтому план стоянки лучше составить заранее.' },
    { d: 9, p: 'kus', t: 'Кушадасы (Эфес)', c: 'Турция', tm: '07:00–15:00 · 8 часов', img: 'images/v-ephesus-library.jpg', alt: 'Библиотека Цельса в Эфесе', x: 'Курорт на берегу Эгейского моря. Древний Эфес примерно в 20 км: можно съездить самостоятельно или заказать экскурсию.' },
    { d: 10, p: 'ist', t: 'Стамбул', c: 'Турция', tm: 'приход в 10:00', img: 'images/v-ist-hagia.jpg', alt: 'Собор Святой Софии в Стамбуле', x: 'Лайнер приходит в 10:00. Высадка и трансфер в аэропорт.' }
  ];
  var svg = $('#routeMap'), card = $('#dayCard'), chips = $('#chips'), cur = 0;
  if (svg && W) {
    var NS = 'http://www.w3.org/2000/svg';
    var el = function (n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; };
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.appendChild(el('path', { d: window.MAP_LAND, class: 'land' }));
    var pts = PATH.map(function (q) { return P(q[0], q[1]); });
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    var line = el('path', { d: d, class: 'route-line' });
    svg.appendChild(line);
    var pins = {};
    ['ist', 'cor', 'bar', 'tri', 'spl', 'pir', 'kus'].forEach(function (id, k) {
      var po = PORTS[id], xy = P(po.ll[0], po.ll[1]);
      var g = el('g', { class: 'pin', tabindex: '0', role: 'button', 'aria-label': po.n });
      g.appendChild(el('circle', { class: 'ring', cx: xy[0], cy: xy[1], r: 12 }));
      g.appendChild(el('circle', { class: 'dot', cx: xy[0], cy: xy[1], r: 12 }));
      var nm = el('text', { class: 'nm', x: xy[0], y: xy[1] + 0.5 }); nm.textContent = String(k + 1);
      var lab = el('text', { class: 'lb', x: xy[0] + po.dx, y: xy[1] + po.dy, 'text-anchor': po.anchor }); lab.textContent = po.n;
      g.appendChild(nm); g.appendChild(lab); svg.appendChild(g); pins[id] = g;
      var go = function () { for (var q = 0; q < DAYS.length; q++) if (DAYS[q].p === id) { show(q, true); break; } };
      g.addEventListener('click', go);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    if (!reduce && hasIO && line.getTotalLength) {
      var len = line.getTotalLength();
      line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
      var lio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) {
          line.style.transition = 'stroke-dashoffset 3.2s ease-in-out'; line.style.strokeDashoffset = 0;
          setTimeout(function () { line.style.transition = 'none'; line.style.strokeDasharray = '3 6'; }, 3400);
          lio.disconnect();
        }
      }, { threshold: .35 });
      lio.observe(svg);
    }
    DAYS.forEach(function (dy, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', 'false');
      b.innerHTML = 'День ' + dy.d + '<small>' + dy.t + '</small>';
      b.addEventListener('click', function () { show(i, true); });
      chips.appendChild(b);
    });
    var show = function (i, scrollChip) {
      cur = (i + DAYS.length) % DAYS.length; var dy = DAYS[cur];
      $$('.chip', chips).forEach(function (c, k) {
        c.setAttribute('aria-selected', k === cur ? 'true' : 'false');
        if (k === cur && scrollChip) chips.scrollLeft = Math.max(0, c.offsetLeft - chips.offsetLeft - chips.clientWidth / 2 + c.offsetWidth / 2);
      });
      for (var id in pins) pins[id].classList.toggle('on', id === dy.p);
      var sname = dy.p ? dy.t.replace(/\s*\(.*\)/, '').replace('о. ', '') : 'море';
      card.innerHTML = '<div class="stamp" aria-hidden="true">ДЕНЬ ' + dy.d + '<b>' + sname + '</b>' + (dy.p ? dy.c.toUpperCase() : 'НА БОРТУ') + '</div>' +
        '<img src="' + dy.img + '" alt="' + dy.alt + '" width="1300" height="813">' +
        '<div class="in"><p class="dn">День ' + dy.d + ' из 10 · ' + dy.c + '</p><h3>' + dy.t + '</h3><p class="tm">' + dy.tm + '</p><p class="tx">' + dy.x + '</p>' + (dy.cr ? '<p class="cr">' + dy.cr + '</p>' : '') + '</div>';
    };
    $('#rtPrev').addEventListener('click', function () { show(cur - 1, true); });
    $('#rtNext').addEventListener('click', function () { show(cur + 1, true); });
    show(2, false);
  }

  /* ---------- Отзывы: стрелки ---------- */
  var rvBox = $('#reviews');
  if (rvBox) {
    $('#rvPrev').addEventListener('click', function () { stepScroll(rvBox, -1); });
    $('#rvNext').addEventListener('click', function () { stepScroll(rvBox, 1); });
  }

  /* ---------- Просмотр фото ---------- */
  var lbx = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  function zoom(src, alt, cap) {
    if (!lbx || !lbx.showModal) { window.open(src); return; }
    lbImg.src = src; lbImg.alt = alt || ''; lbCap.textContent = cap || alt || ''; lbx.showModal();
  }
  $$('.g, .gal button, .dipl button, .cabin-ph, .cabin-up button').forEach(function (b) {
    b.addEventListener('click', function () { var im = b.querySelector('img'); zoom(im.src, im.alt, b.getAttribute('data-cap')); });
  });
  if (card) card.addEventListener('click', function (e) { if (e.target.tagName === 'IMG') zoom(e.target.src, e.target.alt, e.target.alt); });
  if (lbx) lbx.addEventListener('click', function (e) { if (e.target === lbx || e.target.classList.contains('x')) lbx.close(); });

  /* ---------- Даты и цены ---------- */
  // [посадка, начало пакета, конец, цена €]. Источник — блокнот Вероники от 10.11.2026 (столбец «Итого»).
  var DATES = [
    ['6 мая', '5 мая', '15 мая', 2187], ['15 мая', '14 мая', '24 мая', 2097, 'Катаколо'], ['24 мая', '23 мая', '2 июня', 2157, 'Катаколо'],
    ['2 июня', '1 июня', '11 июня', 2227], ['11 июня', '10 июня', '20 июня', 2177], ['20 июня', '19 июня', '29 июня', 2167, 'Катаколо'], ['29 июня', '28 июня', '8 июля', 2237],
    ['8 июля', '7 июля', '17 июля', 2307], ['17 июля', '16 июля', '26 июля', 2267, 'Катаколо'], ['26 июля', '25 июля', '4 августа', 2237],
    ['4 августа', '3 августа', '13 августа', 2527], ['13 августа', '12 августа', '22 августа', 2427], ['22 августа', '21 августа', '31 августа', 2277], ['31 августа', '30 августа', '9 сентября', 2167, 'Миконос'],
    ['9 сентября', '8 сентября', '18 сентября', 2347], ['18 сентября', '17 сентября', '27 сентября', 2187, 'Катаколо'], ['27 сентября', '26 сентября', '6 октября', 2167],
    ['6 октября', '5 октября', '15 октября', 2017], ['15 октября', '14 октября', '24 октября', 1930], ['24 октября', '23 октября', '2 ноября', 1980]
  ];
  var MONTHS = [
    { k: 'мая', n: 'Май', md: 'Начало сезона: тепло, но ещё не жарко' },
    { k: 'июня', n: 'Июнь', md: 'Длинные светлые вечера и прогретое море' },
    { k: 'июля', n: 'Июль', md: 'Разгар лета и самое тёплое море' },
    { k: 'августа', n: 'Август', md: 'Пик сезона и время отпусков' },
    { k: 'сентября', n: 'Сентябрь', md: 'Бархатный сезон: жара спадает' },
    { k: 'октября', n: 'Октябрь', md: 'Самые низкие цены и мягкая погода' }
  ];
  var sel = $('#f-date');
  DATES.forEach(function (r) { var o = document.createElement('option'); o.textContent = r[0]; sel.appendChild(o); });
  function bookDate(v) {
    if (sel && v) sel.value = v;
    var z = $('#zayavka'); if (z) z.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  var cal = $('#cal');
  if (cal) {
    var gmin = Math.min.apply(null, DATES.map(function (r) { return r[3]; }));
    MONTHS.forEach(function (m) {
      var rs = DATES.filter(function (r) { return r[0].split(' ')[1] === m.k; });
      var mmin = Math.min.apply(null, rs.map(function (r) { return r[3]; }));
      var box = document.createElement('div');
      box.className = 'mon' + (mmin === gmin ? ' best' : '');
      var html = '<div class="mon-h"><div><h3>' + m.n + '</h3><p>' + m.md + '</p></div><span class="from">от ' + fmt(mmin) + ' €</span></div><ul>';
      rs.forEach(function (r) {
        html += '<li><button type="button" data-date="' + r[0] + '"><span class="dt"><b>' + r[1] + ' — ' + r[2] + '</b><small>посадка ' + r[0] + (r[4] ? '<em class="via">заход ' + (r[4] === 'Миконос' ? 'на Миконос' : 'в Катаколо') + '</em>' : '') + '</small></span>' +
          '<span class="pr' + (r[3] === gmin ? ' low' : '') + '">' + fmt(r[3]) + ' €</span><span class="go" aria-hidden="true">→</span></button></li>';
      });
      box.innerHTML = html + '</ul>' + (mmin === gmin ? '<span class="tag-best">Самая низкая цена сезона</span>' : '');
      cal.appendChild(box);
    });
    $$('button[data-date]', cal).forEach(function (b) { b.addEventListener('click', function () { bookDate(b.getAttribute('data-date')); }); });
  }

  /* ---------- Подсказка «листайте» под лентами на телефоне ---------- */
  ['.steps', '.fears', '#cal', '.reels', '.gallery', '#reviews'].forEach(function (s) {
    var box = $(s); if (!box) return;
    var p = document.createElement('p'); p.className = 'swipe'; p.textContent = 'Листайте вбок';
    box.parentNode.insertBefore(p, box.nextSibling);
  });

  /* ---------- Форма ---------- */
  // Адрес приёма заявок (Google Apps Script) пока не создан: пока он пуст, форма никуда не отправляет данные.
  function goal(n) { try { if (typeof ym === 'function' && window.__ymId) ym(window.__ymId, 'reachGoal', n); } catch (e) {} }
  document.addEventListener('click', function (e) { var l = e.target.closest && e.target.closest('a[href^="tel:"],a[href*="t.me/"]'); if (l) goal(l.href.indexOf('tel:') === 0 ? 'phone_click' : 'tg_click'); });
  var LEAD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyQfVihQJCTMHnhhSUnULqx0MpRn8JEYlelGnfam--8Qh3HZuPI3wp0D2Fv3BnYxvj47g/exec';
  var f = $('#leadForm'), msg = $('#formMsg');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (f.website.value) return;
    var name = f.name.value.trim(), phone = f.phone.value.trim();
    if (!name || phone.replace(/\D/g, '').length < 7) { msg.className = 'form-msg err'; msg.textContent = 'Укажите имя и телефон.'; return; }
    if (!LEAD_ENDPOINT) { msg.className = 'form-msg err'; msg.textContent = 'Форма пока не подключена. Напишите нам в Telegram или позвоните: +375 44 788-44-22.'; return; }
    var dd = new URLSearchParams();
    dd.append('name', name); dd.append('phone', phone); dd.append('plan', 'От Босфора до Адриатики (MSC Splendida 2027)');
    dd.append('date', f.date.value); dd.append('channel', f.channel.value); dd.append('comment', f.comment.value); dd.append('page', location.href);
    new URLSearchParams(location.search).forEach(function (v, k) { if (/^utm_|^gclid$|^yclid$|^fbclid$/.test(k)) dd.append(k, v); });
    var b = f.querySelector('button[type=submit]'); b.disabled = true; b.textContent = 'Отправляем…';
    var back = function () { b.disabled = false; b.textContent = 'Отправить заявку'; };
    fetch(LEAD_ENDPOINT, { method: 'POST', mode: 'no-cors', body: dd }).then(
      function () { msg.className = 'form-msg ok'; msg.textContent = 'Заявка отправлена. Менеджер свяжется с вами.'; goal('zayavka'); f.reset(); back(); },
      function () { msg.className = 'form-msg err'; msg.textContent = 'Не удалось отправить. Позвоните нам: +375 44 788-44-22.'; back(); });
  });
  /* ---------- Гайды по портам: заявка на гайд (файлы выдаёт менеджер после бронирования) ---------- */
  var gf = $('#gidForm'), gm = $('#gidMsg');
  if (gf) gf.addEventListener('submit', function (e) {
    e.preventDefault();
    if (gf.website.value) return;
    var name = gf.name.value.trim(), contact = gf.phone.value.trim();
    if (!name || contact.replace(/[^0-9a-zA-Z]/g, '').length < 5) { gm.className = 'gid-msg err'; gm.textContent = 'Укажите имя и телефон или Telegram.'; return; }
    if (!LEAD_ENDPOINT) { gm.className = 'gid-msg err'; gm.textContent = 'Форма пока не подключена. Напишите нам в Telegram или позвоните: +375 44 788-44-22.'; return; }
    var d = new URLSearchParams();
    d.append('name', name); d.append('phone', contact); d.append('plan', 'Гайды по стоянкам (лендинг Splendida 2027)');
    d.append('comment', '[Гайд]'); d.append('page', location.href);
    new URLSearchParams(location.search).forEach(function (v, k) { if (/^utm_|^gclid$|^yclid$|^fbclid$/.test(k)) d.append(k, v); });
    var b = gf.querySelector('button[type=submit]'); b.disabled = true; b.textContent = 'Отправляем…';
    var ok = function () { goal('gid'); gf.classList.add('sent'); gm.className = 'gid-msg ok'; gm.innerHTML = '<b>Спасибо!</b> Менеджер свяжется с вами и расскажет про гайды, даты и условия круиза.'; };
    var bad = function () { b.disabled = false; b.textContent = 'Получить гайд'; gm.className = 'gid-msg err'; gm.textContent = 'Не удалось отправить. Позвоните нам: +375 44 788-44-22.'; };
    fetch(LEAD_ENDPOINT, { method: 'POST', mode: 'no-cors', body: d }).then(ok, bad);
  });
})();
