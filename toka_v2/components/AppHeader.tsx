'use client';

import { useI18n } from '@/lib/i18n';

export default function AppHeader() {
  const { lang, setLang, t } = useI18n();

  return (
    <header className="app-header">
      <div className="brand-block">
        <p className="brand-name">{t('appName')}</p>
        <p className="brand-tagline">{t('tagline')}</p>
      </div>
      <div className="lang-switch" role="group" aria-label="Language switch">
        <button
          type="button"
          className={lang === 'en' ? 'lang-btn active' : 'lang-btn'}
          onClick={() => setLang('en')}
        >
          {t('langEn')}
        </button>
        <button
          type="button"
          className={lang === 'vi' ? 'lang-btn active' : 'lang-btn'}
          onClick={() => setLang('vi')}
        >
          {t('langVi')}
        </button>
      </div>
    </header>
  );
}

