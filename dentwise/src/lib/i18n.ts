import { enUS, fr, type Locale as DateFnsLocale } from "date-fns/locale";

export const SUPPORTED_LOCALES = ["en", "fr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "dw_locale";

export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
};

export const DATE_FNS_LOCALES: Record<Locale, DateFnsLocale> = {
  en: enUS,
  fr,
};

function parseLocaleTag(raw: string) {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return null;
  const base = normalized.split("-")[0];
  return base || null;
}

export function normalizeLocale(raw: string | null | undefined): Locale | null {
  if (!raw) return null;
  const parsed = parseLocaleTag(raw);
  if (!parsed) return null;
  return SUPPORTED_LOCALES.includes(parsed as Locale) ? (parsed as Locale) : null;
}

function parseAcceptLanguage(header: string) {
  return header
    .split(",")
    .map((part) => {
      const [tag, qValue] = part.trim().split(";q=");
      const quality = qValue ? Number(qValue) : 1;
      return {
        tag: tag.trim(),
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((item) => item.tag.length > 0)
    .sort((a, b) => b.quality - a.quality);
}

export function getLocaleFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const parsed = parseAcceptLanguage(header);
  for (const item of parsed) {
    const normalized = normalizeLocale(item.tag);
    if (normalized) return normalized;
  }
  return DEFAULT_LOCALE;
}
