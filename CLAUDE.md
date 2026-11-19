# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Marketing site and content for "Layer Up," a one-person FDM 3D-printing business in Kyiv. There is no build system, package manager, or test suite — it's a static HTML page plus one standalone Node script.

- `index.html` + `style.css` + `script.js` — the entire site, one static page built from the Claude Design mockup `Layer Up Dark` (`design/`). Plain HTML/CSS/JS, no frameworks. Fonts (Unbounded, Onest) come from Google Fonts; pictures are WebP files in `images/` (compressed copies of the originals in `photo/`, which is gitignored and never published). Open `index.html` in a browser to preview.
- `design/` — the mockup zip (`Layer Up Dark.dc.html`) and its written spec `design.md`.
- `brief.md` — the source of truth for all site content: services, prices, target customers, tone of voice, site sections, and the current slogans/service descriptions. Any copy written for the site must come from here — don't invent prices or sections not listed in it.
- `generate-slogans.js` — a standalone Node script (no `package.json`, no dependencies) that sends `brief.md` to a free model on OpenRouter and prints generated slogans/service descriptions. Uses Node's built-in `fetch`.
- `.env` — holds `OPENROUTER_API_KEY`, gitignored. Never commit this file or print its contents.

The repo is published at `github.com/DesFis-lab/my-business` and served live via GitHub Pages from the `master` branch root: `https://desfis-lab.github.io/my-business/`.

## Бизнес

- **Кто мы:** печатаем на FDM-принтере детали, подарки/игрушки и прототипы по модели или идее заказчика — «Layer Up», Киев. Главное предложение: от 1 штуки, готово за 1–3 дня.
- **Для кого сайт:** в основном частные люди (не бизнес), которым нужна нестандартная деталь, подарок или прототип, а заказывать на фабрике дорого и долго.
- **Главное действие на сайте:** отправить модель или идею и получить расчёт стоимости.
- **Тон текстов:** лёгкий и внимательный, на «вы»; без канцелярита и восклицательных знаков.
- **Услуги и цены** (только из `brief.md`, не добавлять новые):
  - Печать по своей модели (STL) — от 3 ₴ за грамм
  - Моделирование под заказ по фото/эскизу — от 400 ₴
  - Прототип или запчасть — от 400 ₴
  - Подарки и сувениры (брелки, фигурки, именные таблички) — от 120 ₴
  - Консультация и оценка модели — бесплатно
- **Запреты:**
  - Не выдумывать цены, скидки, адреса и отзывы — если чего-то нет в `brief.md`, спросить пользователя, а не придумывать.
  - Никогда не выводить ключ из `.env` и не вписывать его в код.
  - Ничего не отправлять на GitHub без явного согласия пользователя.
  - Папку `images/` не трогать — там настоящие фото, не менять, не удалять и не перезаписывать файлы внутри неё.
  - Цены менять только вместе с `brief.md` (синхронно в обоих местах) и только по явной просьбе пользователя — самостоятельно цены не трогать.

## Running things

Run the slogan generator:
```
node generate-slogans.js
```
It reads the key from `.env`, auto-picks the first model whose id contains `:free` from OpenRouter's `/models` list, sends it the full contents of `brief.md` plus a fixed instruction, and prints both the raw JSON response and the extracted answer text. To pin a specific model instead of auto-picking, replace the `pickFreeModel(apiKey)` call in `main()` with a literal model id string.

There is no build, lint, or test command — this is intentionally a zero-tooling static page.

## Working conventions

- Site copy (headlines, button text, prices, section content) must trace back to `brief.md`. If a requested change isn't backed by the brief, update the brief first or ask before inventing content.
- Tone across the site is "лёгкий и внимательный, на «вы»" (light, attentive, formal "you") — per the brief. No bureaucratic/canned phrasing (канцелярит) and no exclamation marks.
- No JS framework or build step. Styles live in `style.css`, behaviour in `script.js`. The only external dependency is Google Fonts.
- All paths must be relative (`style.css`, `photo/…`, never `/style.css`): the site is served from `/my-business/`, not the domain root.
- The order form doesn't send to a server yet (planned for "Блок 9"). On submit it opens Telegram (`t.me/layerup_kyiv?text=…`) with the ready-made request text and shows a message with the same text plus «Открыть Telegram» / «Отправить по email» buttons. The «Позвонить» button and the tel: link in contacts appear only when a real number replaces the placeholder `PHONE_TEXT` / `PHONE_TEL` at the top of `script.js`.
- Never modify, delete, or overwrite anything inside `images/` — it holds real business photos, not placeholders.
- Prices change only together with `brief.md` (update both in sync) and only when the user explicitly asks — never change prices on your own initiative.

## Сайт

Одностраничный сайт бизнеса «Layer Up»: `index.html`, `style.css`, `script.js`.

- **Технологии:** обычный HTML, CSS и JavaScript, без фреймворков и сборки.
- **Цвета** (тёмная тема, переменные в `:root` файла `style.css`):
  - фон страницы `#14110F`, первый экран и заявка `#1D1916`, блок вопросов `#1A1613`, карточки `#1F1A17`;
  - текст `#F2EDE4`, приглушённый `#DDD5CA` / `#CFC6BA` / `#A89E91`;
  - акцент `#F08A3C`, текст на акценте `#1D1916`, акцентный текст `#F6B27A`;
  - линии `#3A332D`, `#4A433B`, пунктир `#5A5148`.
- **Шрифты:** заголовки — Unbounded 600, остальной текст — Onest (400–800), оба с Google Fonts; пометки-заглушки — моноширинный системный.
- **Тексты:** по-русски, тон из `brief.md` (лёгкий, внимательный, на «вы», без восклицательных знаков).
- **Цены, адрес, часы работы:** только из `brief.md`, ничего не выдумывать. Чего нет в брифе — оставлять пометкой «[… — уточнить]» и спрашивать пользователя.
- **Телефон:** всё должно нормально выглядеть на телефоне (проверять на ширине 390 px, без горизонтальной прокрутки, нажимаемые зоны от 44 px).
- **Пути к файлам:** всегда относительные (`style.css`, `photo/…`), без ведущего `/`.
- **Анимации:** выключаются при «уменьшить движение» (`prefers-reduced-motion: reduce`) и в CSS, и в `script.js`. Анимировать только `transform` и `opacity` (тени и рамки при наведении — через `::after` с `opacity`), без внешних библиотек. Если `script.js` не загрузился, весь текст должен быть виден: скрытие блоков включается только классом `js`, который ставит сам скрипт.
- **Поиск и превью:** в `<head>` у `index.html` заголовок, описание, Open Graph и JSON-LD (`LocalBusiness`). В JSON-LD только факты из `brief.md` и со страницы; когда появятся телефон, адрес и часы работы — добавить `telephone`, `streetAddress`, `openingHours`, а в блок контактов — карту. Исключения из правила про WebP: превью `images/og-preview.jpg` (1200×630, соцсети не всегда понимают WebP) и значки вкладки `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` в корне.
- **Картинки:** только WebP, до 300 КБ каждая, лежат в `images/`; оригиналы остаются в `photo/` (в `.gitignore`, на GitHub не уходят). У каждого `<img>` есть `width`, `height` и короткий `alt`; всё ниже первого экрана — `loading="lazy"`, картинка первого экрана — без `lazy`.
