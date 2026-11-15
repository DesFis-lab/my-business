// Берёт ключ OpenRouter из .env, читает brief.md и просит бесплатную модель
// придумать слоганы и описания услуг на основе брифа.

const fs = require("fs");
const path = require("path");

function readEnvKey(envPath, key) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq).trim();
    if (name === key) return trimmed.slice(eq + 1).trim();
  }
  return "";
}

async function pickFreeModel(apiKey) {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Не удалось получить список моделей: HTTP ${res.status}`);
  const data = await res.json();
  const free = data.data.find((m) => m.id.includes(":free"));
  if (!free) throw new Error("Не нашлось ни одной модели с :free в названии");
  return free.id;
}

async function main() {
  const apiKey = readEnvKey(path.join(__dirname, ".env"), "OPENROUTER_API_KEY");
  if (!apiKey) {
    console.error("В .env нет значения OPENROUTER_API_KEY — заполни файл и запусти снова.");
    process.exit(1);
  }

  const brief = fs.readFileSync(path.join(__dirname, "brief.md"), "utf8");
  const model = await pickFreeModel(apiKey);
  console.log(`Используемая модель: ${model}\n`);

  const prompt =
    `Вот бриф бизнеса «Layer Up».\n\n${brief}\n\n` +
    `Задание: придумай 5 коротких слоганов, а для каждой услуги из брифа — ` +
    `описание в 1–2 предложения. Цены не придумывай, бери только из брифа.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const json = await response.json();

  console.log("=== Сырой JSON от сервера ===");
  console.log(JSON.stringify(json, null, 2));

  console.log("\n=== Ответ модели ===");
  const text = json?.choices?.[0]?.message?.content;
  console.log(text ?? "(модель не вернула текст — смотри JSON выше)");
}

main().catch((err) => {
  console.error("Ошибка:", err.message);
  process.exit(1);
});
