import { translate } from "google-translate-api-x";

export type TranslatableFields = Record<string, string | string[] | null | undefined>;
export type FieldTranslations = Record<string, string | string[]>;
export type TranslationsByLocale = Record<string, FieldTranslations>;

function flattenFields(fields: TranslatableFields): Record<string, string> {
  const flat: Record<string, string> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item) flat[`${key}[${index}]`] = item;
      });
    } else if (value.trim() !== "") {
      flat[key] = value;
    }
  }

  return flat;
}

function unflattenFields(
  translatedFlat: Record<string, string>,
  original: TranslatableFields
): FieldTranslations {
  const result: FieldTranslations = {};
  const arrayBuckets: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(translatedFlat)) {
    const match = key.match(/^(.+)\[(\d+)\]$/);
    if (match) {
      const [, baseKey, indexStr] = match;
      const bucket = (arrayBuckets[baseKey] ??= []);
      bucket[Number(indexStr)] = value;
    } else {
      result[key] = value;
    }
  }

  for (const [baseKey, translatedArr] of Object.entries(arrayBuckets)) {
    const originalArr = original[baseKey];
    if (Array.isArray(originalArr)) {
      result[baseKey] = originalArr.map((original, index) => translatedArr[index] ?? original);
    }
  }

  return result;
}

/**
 * Translates a flat/array-valued field set into each target locale using the free,
 * unofficial google-translate-api-x wrapper. Never throws — a failed locale is simply
 * omitted from the result so a translation hiccup never blocks the caller's own save.
 */
export async function translateFields(
  fields: TranslatableFields,
  targetLocales: string[]
): Promise<TranslationsByLocale> {
  const flat = flattenFields(fields);
  if (Object.keys(flat).length === 0) return {};

  const result: TranslationsByLocale = {};

  await Promise.all(
    targetLocales.map(async (to) => {
      try {
        const res = await translate(flat, { from: "en", to, rejectOnPartialFail: false });
        const translatedFlat: Record<string, string> = {};
        for (const key of Object.keys(flat)) {
          translatedFlat[key] = res[key]?.text ?? flat[key];
        }
        result[to] = unflattenFields(translatedFlat, fields);
      } catch (error) {
        console.error(`translateFields: translation to "${to}" failed`, error);
      }
    })
  );

  return result;
}
