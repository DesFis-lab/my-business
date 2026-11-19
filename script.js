// Layer Up — поведение сайта: появление блоков, наклон карточек, параллакс, форма заявки.

// Телефон бизнеса. ЗАМЕНИТЬ НА НАСТОЯЩИЙ, когда он будет:
// PHONE_TEXT — как показать номер, PHONE_TEL — номер для ссылки tel: (только + и цифры).
var PHONE_TEXT = '[телефон — уточнить]';
var PHONE_TEL = '+380000000000';

(function () {
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
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

  // Форма заявки. Отправку подключим позже (Блок 9),
  // пока показываем сообщение с телефоном, чтобы клиент не потерялся.
  var form = document.getElementById('orderForm');
  var done = document.getElementById('orderDone');
  var back = document.getElementById('orderBack');

  done.querySelectorAll('[data-phone-text]').forEach(function (el) { el.textContent = PHONE_TEXT; });
  done.querySelectorAll('[data-phone-link]').forEach(function (el) { el.href = 'tel:' + PHONE_TEL; });

  // Телефон в контактах становится ссылкой, которая на смартфоне сразу звонит,
  // как только в начале файла указан настоящий номер (вместо заглушки).
  if (PHONE_TEL !== '+380000000000') {
    document.querySelectorAll('[data-phone-contact]').forEach(function (el) {
      var a = document.createElement('a');
      a.href = 'tel:' + PHONE_TEL;
      a.textContent = PHONE_TEXT;
      el.className = 'val';
      el.textContent = '';
      el.appendChild(a);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  back.addEventListener('click', function () {
    done.hidden = true;
    form.hidden = false;
    form.querySelector('input').focus();
  });
})();
