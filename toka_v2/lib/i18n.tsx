'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'en' | 'vi';

type Dict = {
  appName: string;
  tagline: string;
  touchToEnter: string;
  enterAria: string;
  momentEntry: string;
  momentQuestionLabel: string;
  momentDefaultQuestion: string;
  momentCustomQuestion: string;
  momentQuestionModalTitle: string;
  momentQuestionPlaceholder: string;
  momentCancel: string;
  momentSaveQuestion: string;
  momentDomainTitle: string;
  momentDomainOptional: string;
  momentBack: string;
  momentConfirm: string;
  domainCareer: string;
  domainMoney: string;
  domainRelationship: string;
  domainHealth: string;
  domainProject: string;
  domainSelf: string;
  domainOther: string;
  breathTitle: string;
  breathBody: string;
  breathSkip: string;
  breathSeconds: string;
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
    momentQuestionLabel: 'You asked:',
    momentDefaultQuestion: 'Where am I in this flow of life?',
    momentCustomQuestion: 'Set custom question',
    momentQuestionModalTitle: 'Write your question',
    momentQuestionPlaceholder: 'Type one clear sentence...',
    momentCancel: 'Cancel',
    momentSaveQuestion: 'Save question',
    momentDomainTitle: 'Question domain',
    momentDomainOptional: 'Optional',
    momentBack: 'Back',
    momentConfirm: 'Continue to cast',
    domainCareer: 'Career',
    domainMoney: 'Money',
    domainRelationship: 'Relationship',
    domainHealth: 'Health',
    domainProject: 'Project',
    domainSelf: 'Self',
    domainOther: 'Other',
    breathTitle: 'Pause and breathe',
    breathBody: 'Take one slow breath before entering the moment.',
    breathSkip: 'Skip',
    breathSeconds: 's',
    langEn: 'EN',
    langVi: 'VI',
  },
  vi: {
    appName: 'Toka',
    tagline: 'Hợp Thế',
    touchToEnter: 'chạm để vào',
    enterAria: 'Vào TOKA',
    momentEntry: 'Vào Khoảnh Khắc',
    momentQuestionLabel: 'Bạn hỏi:',
    momentDefaultQuestion: 'Tôi đang ở đâu trong dòng sống này?',
    momentCustomQuestion: 'Đặt câu hỏi riêng',
    momentQuestionModalTitle: 'Nhập câu hỏi',
    momentQuestionPlaceholder: 'Viết một câu rõ ràng...',
    momentCancel: 'Huỷ',
    momentSaveQuestion: 'Lưu câu hỏi',
    momentDomainTitle: 'Lĩnh vực câu hỏi',
    momentDomainOptional: 'Tuỳ chọn',
    momentBack: 'Quay lại',
    momentConfirm: 'Tiếp tục gieo quẻ',
    domainCareer: 'Sự Nghiệp',
    domainMoney: 'Tài Chính',
    domainRelationship: 'Quan Hệ',
    domainHealth: 'Sức Khoẻ',
    domainProject: 'Dự Án',
    domainSelf: 'Bản Thân',
    domainOther: 'Other',
    breathTitle: 'Dừng lại và thở',
    breathBody: 'Hít một nhịp chậm trước khi vào khoảnh khắc.',
    breathSkip: 'Bỏ qua',
    breathSeconds: 'giây',
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
