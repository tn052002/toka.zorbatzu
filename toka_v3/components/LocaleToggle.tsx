'use client';

import { useI18n } from '@/lib/i18n';

export default function LocaleToggle() {
  const { lang, setLang, m } = useI18n();

  return (
    <div className="inline-flex items-center rounded-md border border-text/20 p-0.5">
      <button
        type="button"
        onClick={() => setLang('en')}
        className={[
          'min-h-8 min-w-10 rounded-sm px-2 text-xs transition-colors duration-calm',
          lang === 'en' ? 'bg-text text-white' : 'text-text/70 hover:text-text',
        ].join(' ')}
      >
        {m.common.localeEn}
      </button>
      <button
        type="button"
        onClick={() => setLang('vi')}
        className={[
          'min-h-8 min-w-10 rounded-sm px-2 text-xs transition-colors duration-calm',
          lang === 'vi' ? 'bg-text text-white' : 'text-text/70 hover:text-text',
        ].join(' ')}
      >
        {m.common.localeVi}
      </button>
    </div>
  );
}
