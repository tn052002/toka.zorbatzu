'use client';

import { useI18n } from '@/lib/i18n/useI18n';

export default function HeaderBar() {
  const { lang, t, toggleLanguage } = useI18n();

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          {t('app_title')}
        </p>
        {/* Optional: keep this small, or remove entirely */}
        <p className="mt-1 text-base font-medium text-slate-700">{t('app_tagline')}</p>
      </div>

      <div className="flex items-center rounded-full border border-slate-200 bg-white p-1 text-xs">
        <button
          type="button"
          onClick={toggleLanguage}
          className={`rounded-full px-3 py-1 ${
            lang === 'en' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
          aria-pressed={lang === 'en'}
        >
          {t('header_lang_en')}
        </button>
        <button
          type="button"
          onClick={toggleLanguage}
          className={`rounded-full px-3 py-1 ${
            lang === 'vi' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
          aria-pressed={lang === 'vi'}
        >
          {t('header_lang_vi')}
        </button>
      </div>
    </header>
  );
}
