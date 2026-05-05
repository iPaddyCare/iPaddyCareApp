#!/usr/bin/env node
/**
 * One-shot translation of `data/solutions-database.json` into Sinhala + Tamil.
 *
 * Adds parallel localized fields next to the English originals so consumer
 * code can pick by language without a fallback table:
 *
 *   description     -> description_en (kept) + description_si + description_ta
 *   solutions[].title       -> title_si / title_ta
 *   solutions[].description -> description_si / description_ta
 *   prevention      -> prevention_si[] / prevention_ta[]
 *
 * Disease `name`, `model_var`, `aliases`, and `severity` are NOT translated:
 *  - name + aliases are also used for matching against model output strings;
 *    duplicating those into Sinhala/Tamil would only confuse the matcher. We
 *    instead expose `name_si` / `name_ta` for display and keep `name` as the
 *    English canonical key.
 *  - severity is an enum ('high'/'medium'/'low') that's translated in the UI
 *    via t.severityHigh etc.
 *
 * Usage:
 *   node scripts/translate-rag-db.js
 *
 * Idempotent: skips diseases that already have `_si`/`_ta` fields.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ENV_PATH = path.join(__dirname, '..', '.env');
const DB_PATH = path.join(__dirname, '..', 'data', 'solutions-database.json');

function loadEnv(file) {
  const raw = fs.readFileSync(file, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

loadEnv(ENV_PATH);
const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('OPENAI_API_KEY missing in .env');
  process.exit(1);
}

function callOpenAI(messages) {
  // gpt-4o-mini is ~10x cheaper than 3.5-turbo for this task and handles non-Latin
  // scripts (Sinhala/Tamil) more compactly, so the response fits without truncation.
  const body = JSON.stringify({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });
  return new Promise((resolve, reject) => {
    const req = https.request(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (d) => (chunks += d));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`OpenAI ${res.statusCode}: ${chunks}`));
          }
          try {
            const json = JSON.parse(chunks);
            resolve(json.choices[0].message.content);
          } catch (e) {
            reject(e);
          }
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function translateDisease(disease) {
  // Build a minimal payload of strings to translate.
  const payload = {
    name: disease.name,
    description: disease.description || '',
    solutions: (disease.solutions || []).map((s) => ({
      title: s.title || '',
      description: s.description || '',
    })),
    prevention: disease.prevention || [],
  };

  const systemPrompt =
    'You are a Sinhala and Tamil agronomy translator for paddy-rice agriculture. ' +
    'Translate every English field of the input into both Sinhala (සිංහල) and Tamil (தமிழ்). ' +
    'Keep chemical names (e.g. Mancozeb, Tebuconazole) in their internationally-recognised ' +
    'Latin form — do NOT transliterate chemical names. Translate only the surrounding ' +
    'sentences. Preserve numerical values and units (e.g. 20 g/10L, 14 days) as-is. ' +
    'Respond with JSON of the form: ' +
    '{"si":{"name":"...","description":"...","solutions":[{"title":"...","description":"..."}],"prevention":["..."]},' +
    '"ta":{"name":"...","description":"...","solutions":[{"title":"...","description":"..."}],"prevention":["..."]}} ' +
    'where each array length matches the input exactly.';

  const userPrompt = `Translate this paddy-disease entry:\n${JSON.stringify(payload)}`;

  const raw = await callOpenAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
  return JSON.parse(raw);
}

function applyTranslation(disease, translated) {
  if (!translated || !translated.si || !translated.ta) return;
  disease.name_si = translated.si.name;
  disease.name_ta = translated.ta.name;
  disease.description_si = translated.si.description;
  disease.description_ta = translated.ta.description;

  if (Array.isArray(disease.solutions)) {
    disease.solutions.forEach((sol, i) => {
      const si = translated.si.solutions?.[i];
      const ta = translated.ta.solutions?.[i];
      if (si) {
        sol.title_si = si.title;
        sol.description_si = si.description;
      }
      if (ta) {
        sol.title_ta = ta.title;
        sol.description_ta = ta.description;
      }
    });
  }
  disease.prevention_si = translated.si.prevention || [];
  disease.prevention_ta = translated.ta.prevention || [];
}

(async function main() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  let translated = 0;
  let skipped = 0;
  for (const disease of db) {
    if (disease.description_si && disease.description_ta) {
      skipped++;
      continue;
    }
    process.stdout.write(`Translating "${disease.name}"... `);
    try {
      const t = await translateDisease(disease);
      applyTranslation(disease, t);
      translated++;
      console.log('done');
    } catch (e) {
      console.error(`FAILED: ${e.message}`);
    }
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log(`\nTranslated: ${translated}, skipped: ${skipped}`);
})();
