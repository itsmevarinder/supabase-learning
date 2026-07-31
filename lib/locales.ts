export const LOCALES = ["en", "hi", "pa"] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isAppLocale(value: string | undefined): value is AppLocale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

const INTL_DATE_LOCALES: Record<AppLocale, string> = {
  en: "en-US",
  hi: "hi-IN",
  pa: "pa-IN",
};

/** Maps an app locale to the Intl/BCP-47 tag used for Date formatting (toLocaleDateString etc.). */
export function toIntlLocale(locale: string): string {
  return isAppLocale(locale) ? INTL_DATE_LOCALES[locale] : INTL_DATE_LOCALES[DEFAULT_LOCALE];
}
