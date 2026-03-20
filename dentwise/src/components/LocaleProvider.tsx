"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { translate } from "@/lib/translations";

type TranslationContextValue = {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<TranslationContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo<TranslationContextValue>(
    () => ({
      locale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslations() {
  const context = useContext(LocaleContext);
  if (context) return context;
  return {
    locale: DEFAULT_LOCALE,
    t: (key: string, vars?: Record<string, string | number>) =>
      translate(DEFAULT_LOCALE, key, vars),
  };
}
