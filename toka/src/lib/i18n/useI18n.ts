'use client';

import { useEffect, useState } from 'react';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

export type Locale = 'en' | 'vi';
export const LANG_KEY = 'toka:lang';

const dictionaries = { en, vi };

let currentLang: Locale = 'en';
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const loadLang = (): Locale => {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const saved = window.localStorage.getItem(LANG_KEY);
  if (saved === 'vi') {
    return 'vi';
  }
  return 'en';
};

const persistLang = (lang: Locale) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(LANG_KEY, lang);
};

export const useI18n = () => {
  const [lang, setLang] = useState<Locale>(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }
    return loadLang();
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    currentLang = loadLang();
    setLang(currentLang);
    const handle = () => setLang(currentLang);
    listeners.add(handle);
    return () => {
      listeners.delete(handle);
    };
  }, []);

  const setLanguage = (next: Locale) => {
    currentLang = next;
    persistLang(next);
    notify();
  };

  const toggleLanguage = () => {
    setLanguage(lang === 'en' ? 'vi' : 'en');
  };

  const t = (key: keyof typeof en, vars?: Record<string, string | number>) => {
    const dict = dictionaries[lang] ?? dictionaries.en;
    let value = (dict as typeof en)[key] ?? (dictionaries.en as typeof en)[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([varKey, varValue]) => {
        value = value.replace(`{${varKey}}`, String(varValue));
      });
    }
    return value;
  };

  return { lang, t, setLanguage, toggleLanguage };
};
