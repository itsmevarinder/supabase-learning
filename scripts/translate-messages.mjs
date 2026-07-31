import { readFileSync, writeFileSync } from "fs";
import { translate } from "google-translate-api-x";

const TARGETS = ["hi", "pa"];
const en = JSON.parse(readFileSync("messages/en.json", "utf8"));

function flatten(obj, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      out[path] = value;
    } else if (value && typeof value === "object") {
      flatten(value, path, out);
    }
  }
  return out;
}

function unflatten(flat) {
  const out = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split(".");
    let node = out;
    for (let i = 0; i < parts.length - 1; i++) {
      node = node[parts[i]] ??= {};
    }
    node[parts[parts.length - 1]] = value;
  }
  return out;
}

const PLACEHOLDER_RE = /\{[^}]+\}/g;

function maskPlaceholders(text) {
  const found = [];
  const masked = text.replace(PLACEHOLDER_RE, (match) => {
    found.push(match);
    return `[[${found.length - 1}]]`;
  });
  return { masked, found };
}

function unmaskPlaceholders(text, found) {
  return text.replace(/\[\[\s*(\d+)\s*\]\]/g, (_, i) => found[Number(i)] ?? "");
}

const flat = flatten(en);
console.log(`Translating ${Object.keys(flat).length} keys to: ${TARGETS.join(", ")}`);

const masks = {};
const maskedFlat = {};
for (const [key, value] of Object.entries(flat)) {
  const { masked, found } = maskPlaceholders(value);
  masks[key] = found;
  maskedFlat[key] = masked;
}

for (const to of TARGETS) {
  const res = await translate(maskedFlat, { from: "en", to, rejectOnPartialFail: false });
  const translatedFlat = {};
  for (const key of Object.keys(flat)) {
    const translated = res[key]?.text ?? maskedFlat[key];
    translatedFlat[key] = unmaskPlaceholders(translated, masks[key]);
  }
  const nested = unflatten(translatedFlat);
  writeFileSync(`messages/${to}.json`, JSON.stringify(nested, null, 2) + "\n");
  console.log(`Wrote messages/${to}.json`);
}
