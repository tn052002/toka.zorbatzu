'use client';

import { useI18n } from '@/lib/i18n/useI18n';

export default function HeaderBar() {
  const { lang, t, toggleLanguage } = useI18n();

  return (
    <header className="mb-8 flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{t('app_title')}</p>
        <h1 className="mt-3 font-[var(--font-fraunces)] text-3xl text-slate-900">
          {t('app_tagline')}
        </h1>
      </div>
      <div className="flex flex-col items-end gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-400">
        {/* <span>{t('header_lang')}</span> */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
        >
          {lang === 'en' ? t('header_lang_en') : t('header_lang_vi')}
        </button>
      </div>
    </header>
  );
}
