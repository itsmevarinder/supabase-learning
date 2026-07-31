type TranslatedRow = {
  translations?: Record<string, Record<string, string | string[]>> | null;
};

export function localizeRow<T extends TranslatedRow>(row: T, locale: string, fields: (keyof T)[]): T {
  if (locale === "en" || !row.translations?.[locale]) return row;

  const localized = { ...row };
  const localeTranslations = row.translations[locale];

  for (const field of fields) {
    const value = localeTranslations[field as string];
    if (value !== undefined) {
      localized[field] = value as T[typeof field];
    }
  }

  return localized;
}

export function localizeRows<T extends TranslatedRow>(rows: T[], locale: string, fields: (keyof T)[]): T[] {
  return rows.map((row) => localizeRow(row, locale, fields));
}
