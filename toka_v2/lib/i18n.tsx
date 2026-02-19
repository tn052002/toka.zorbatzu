'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'en' | 'vi';

type Dict = {
  appName: string;
  tagline: string;
  touchToEnter: string;
  enterAria: string;
  momentEntry: string;
  langEn: string;
  langVi: string;
};

const messages: Record<Locale, Dict> = {
  en: {
    appName: 'Toka',
    tagline: 'Aligned',
    touchToEnter: 'touch to enter',
    enterAria: 'Enter TOKA',
    momentEntry: 'Moment Entry',
    langEn: 'EN',
    langVi: 'VI',
  },
  vi: {
    appName: 'Toka',
    tagline: 'Hợp Thế',
    touchToEnter: 'chạm để vào',
    enterAria: 'Vào TOKA',
    momentEntry: 'Vào Khoảnh Khắc',
    langEn: 'EN',
    langVi: 'VI',
  },
};

const LANG_KEY = 'toka_v2:lang';

type I18nValue = {
  lang: Locale;
  t: <K extends keyof Dict>(key: K) => Dict[K];
  setLang: (next: Locale) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

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

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      t: (key) => messages[lang][key],
      setLang,
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return value;
}

