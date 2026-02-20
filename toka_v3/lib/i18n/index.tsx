'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from './locales/en';
import vi from './locales/vi';
import type { Locale, Messages } from './types';

const LANG_KEY = 'toka_v3:lang';
const messages: Record<Locale, Messages> = { en, vi };

type I18nContextValue = {
  lang: Locale;
  setLang: (next: Locale) => void;
  m: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>('en');

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'vi') {
      setLangState(saved);
    }
  }, []);

  const setLang = (next: Locale) => {
    setLangState(next);
    window.localStorage.setItem(LANG_KEY, next);
  };

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, m: messages[lang] }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return ctx;
}
