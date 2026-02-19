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
  momentDomainShowOptions: string;
  momentDomainHideOptions: string;
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
  castModeQuick: string;
  castModeRitual: string;
  castHintQuick: string;
  castHintRitualNext: string;
  castViewResult: string;
  castHome: string;
  castLabelYin: string;
  castLabelYang: string;
  castLabelYinMoving: string;
  castLabelYangMoving: string;
  castProgressFormat: string;
  castNoQuestion: string;
  castModeAria: string;
  castOrbAria: string;
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
    momentDomainShowOptions: 'Show options',
    momentDomainHideOptions: 'Hide options',
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
    castModeQuick: 'quick',
    castModeRitual: 'ritual',
    castHintQuick: 'Tap to cast',
    castHintRitualNext: 'Tap to cast next line',
    castViewResult: 'View result',
    castHome: 'Back',
    castLabelYin: 'Yin',
    castLabelYang: 'Yang',
    castLabelYinMoving: 'Moving yin',
    castLabelYangMoving: 'Moving yang',
    castProgressFormat: '{n}/6',
    castNoQuestion: 'No question found.',
    castModeAria: 'Casting mode',
    castOrbAria: 'Cast lines',
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
    momentDomainShowOptions: 'Hiện lựa chọn',
    momentDomainHideOptions: 'Ẩn lựa chọn',
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
    castModeQuick: 'nhanh',
    castModeRitual: 'từng hào',
    castHintQuick: 'Chạm để gieo',
    castHintRitualNext: 'Chạm để gieo hào tiếp theo',
    castViewResult: 'Xem kết quả',
    castHome: 'Trang chủ',
    castLabelYin: 'Âm',
    castLabelYang: 'Dương',
    castLabelYinMoving: 'Âm (biến)',
    castLabelYangMoving: 'Dương (biến)',
    castProgressFormat: '{n}/6',
    castNoQuestion: 'Không có câu hỏi.',
    castModeAria: 'Chế độ gieo',
    castOrbAria: 'Gieo hào',
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
