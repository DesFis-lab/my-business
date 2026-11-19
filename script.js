// Layer Up — поведение сайта: появление блоков, наклон карточек, параллакс, форма заявки.

// Телефон бизнеса. Пока это заглушка: ЗАМЕНИТЬ НА НАСТОЯЩИЙ, когда он будет
// (тогда в контактах и в сообщении после заявки появятся ссылки «Позвонить»):
// PHONE_TEXT — как показать номер, PHONE_TEL — номер для ссылки tel: (только + и цифры).
var PHONE_TEXT = '[телефон — уточнить]';
var PHONE_TEL = '+380000000000';

// Страница всегда открывается сверху, а не на месте, где клиент остановился в прошлый раз.
// Если в ссылке указан раздел (например, #order), оставляем как есть.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

(function () {
  var mq =window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var wide = window.matchMedia('(min-width: 901px)');

  // Появление блоков при прокрутке (первый экран не анимируется)
  if (!mq.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  // Наклон карточек за курсором (только с мышью)
  var tilted = null;
  function resetTilt() { if (tilted) { tilted.style.transform = ''; tilted = null; } }
  document.addEventListener('mousemove', function (ev) {
    if (mq.matches || !fine.matches) return;
    var card = ev.target.closest && ev.target.closest('[data-tilt]');
    if (tilted && tilted !== card) resetTilt();
    if (!card) return;
    var r = card.getBoundingClientRect();
    var x = (ev.clientX - r.left) / r.width - 0.5;
    var y = (ev.clientY - r.top) / r.height - 0.5;
    card.style.transform = 'perspective(800px) rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg)';
    tilted = card;
  });
  document.addEventListener('mouseleave', resetTilt);

  // Параллакс фона первого экрана (только на компьютере).
  // Считаем только когда страницу прокручивают или меняют размер окна, не каждый кадр.
  var art = document.querySelector('[data-parallax]');
  if (art) {
    var parallaxQueued = false;
    var updateParallax = function () {
      parallaxQueued = false;
      if (mq.matches || !wide.matches) { art.style.transform = ''; return; }
      var top = art.parentElement.getBoundingClientRect().top;
      var y = Math.max(-50, Math.min(50, -top * 0.2));
      art.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
    };
    var queueParallax = function () {
      if (!parallaxQueued) { parallaxQueued = true; requestAnimationFrame(updateParallax); }
    };
    window.addEventListener('scroll', queueParallax, { passive: true });
    window.addEventListener('resize', queueParallax);
    mq.addEventListener('change', queueParallax);
    updateParallax();
  }

  // Закреплённая кнопка на телефоне видна всё время, кроме первого экрана (там своя кнопка) и самой формы.
  var sticky = document.querySelector('.sticky');
  if (sticky && 'IntersectionObserver' in window) {
    var seen = new Set();
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target);
      });
      sticky.classList.toggle('off', seen.size > 0);
    });
    document.querySelectorAll('.hero-cta .btn, #order').forEach(function (el) { so.observe(el); });
  }

  // Просмотр фото работ: нажали на фото — открылось крупно. Листать: кнопки, стрелки клавиатуры
  // или свайп. Закрыть: крестик, тёмный фон или Esc.
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCount = document.getElementById('lbCount');
  var zoomImgs = Array.prototype.map.call(document.querySelectorAll('[data-zoom] img'), function (i) { return i; });
  var lbIndex = 0;
  if (lb && typeof lb.showModal === 'function' && zoomImgs.length) {
    var lbShow = function (i) {
      lbIndex = (i + zoomImgs.length) % zoomImgs.length;
      var img = zoomImgs[lbIndex];
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCount.textContent = (lbIndex + 1) + ' / ' + zoomImgs.length;
    };
    zoomImgs.forEach(function (img, i) {
      img.parentElement.addEventListener('click', function () {
        lbShow(i);
        lb.showModal();
        document.body.classList.add('lb-open');
      });
    });
    document.getElementById('lbClose').addEventListener('click', function () { lb.close(); });
    document.getElementById('lbPrev').addEventListener('click', function () { lbShow(lbIndex - 1); });
    document.getElementById('lbNext').addEventListener('click', function () { lbShow(lbIndex + 1); });
    lb.addEventListener('click', function (e) { if (e.target !== lbImg && !e.target.closest('button')) lb.close(); });
    lb.addEventListener('close', function () { document.body.classList.remove('lb-open'); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
      if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    });
    var touchX = null;
    lb.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  // Форма заявки. Настоящую отправку на сервер подключим позже (Блок 9).
  // Пока заявка уходит через Telegram: открываем чат с готовым текстом,
  // клиенту остаётся нажать «Отправить». Запасные пути — email и (когда будет номер) звонок.
  var TG_URL = 'https://t.me/layerup_kyiv';
  var MAIL = 'qwerty@gmail.com';
  var PHONE_PLACEHOLDER = '+380000000000';

  var form = document.getElementById('orderForm');
  var done = document.getElementById('orderDone');
  var back = document.getElementById('orderBack');
  var tgLink = document.getElementById('orderTg');
  var mailLink = document.getElementById('orderMail');
  var callLink = document.getElementById('orderCall');
  var textBox = document.getElementById('orderText');

  // Кнопка «Позвонить» появляется только когда в начале файла указан настоящий номер.
  if (PHONE_TEL !== PHONE_PLACEHOLDER) {
    callLink.href = 'tel:' + PHONE_TEL;
    callLink.textContent = 'Позвонить ' + PHONE_TEXT;
    callLink.hidden = false;
  }

  // Телефон в контактах становится ссылкой, которая на смартфоне сразу звонит,
  // как только в начале файла указан настоящий номер (вместо заглушки).
  if (PHONE_TEL !== PHONE_PLACEHOLDER) {
    document.querySelectorAll('[data-phone-contact]').forEach(function (el) {
      var a = document.createElement('a');
      a.href = 'tel:' + PHONE_TEL;
      a.textContent = PHONE_TEXT;
      el.className = 'val';
      el.hidden = false;
      el.textContent = '';
      el.appendChild(a);
    });
  }

  // Ошибки показываем прямо под полем, а не только всплывающей подсказкой браузера.
  function showError(input, msg) {
    var p = document.getElementById(input.getAttribute('aria-describedby'));
    if (!p) return;
    p.textContent = msg;
    p.hidden = !msg;
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }
  function validate() {
    var f = form.elements, first = null;
    var nameMsg = f.name.value.trim() ? '' : 'Введите имя';
    var phone = f.phone.value.trim();
    var phoneMsg = '';
    if (!phone) phoneMsg = 'Введите телефон';
    else if (!f.phone.checkValidity()) phoneMsg = 'Введите номер, например +380501234567';
    showError(f.name, nameMsg);
    showError(f.phone, phoneMsg);
    if (nameMsg) first = f.name; else if (phoneMsg) first = f.phone;
    if (first) first.focus();
    return !first;
  }
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-describedby')) showError(e.target, '');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var f = form.elements;
    var text = 'Здравствуйте. Хочу получить расчёт.\nИмя: ' + f.name.value.trim() +
               '\nТелефон: ' + f.phone.value.trim();
    var comment = f.comment.value.trim();
    if (comment) text += '\nКомментарий: ' + comment;

    var tgUrl = TG_URL + '?text=' + encodeURIComponent(text);
    tgLink.href = tgUrl;
    mailLink.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Расчёт стоимости') +
                    '&body=' + encodeURIComponent(text);
    textBox.textContent = text;

    form.hidden = true;
    done.hidden = false;
    done.focus();
    window.open(tgUrl, '_blank', 'noopener');
  });

  back.addEventListener('click', function () {
    done.hidden = true;
    form.hidden = false;
    form.querySelector('input').focus();
  });
})();
