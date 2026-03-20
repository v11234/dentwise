import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale, getLocaleFromAcceptLanguage, normalizeLocale } from "./i18n";
import { translate } from "./translations";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLocale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  if (cookieLocale) return cookieLocale;
  const headerLocale = getLocaleFromAcceptLanguage(headerStore.get("accept-language"));
  return headerLocale || DEFAULT_LOCALE;
}

export async function getServerTranslations() {
  const locale = await getServerLocale();
  return {
    locale,
    t: (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
  };
}
