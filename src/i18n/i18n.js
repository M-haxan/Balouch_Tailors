import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ur from './locales/ur.json';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('bt_language') || 'en' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Synchronize document direction and language attribute
export const applyLanguageSettings = (lang) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    if (lang === 'ur') {
      document.body.classList.add('font-urdu');
    } else {
      document.body.classList.remove('font-urdu');
    }
  }
};

// Listen to language changes
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bt_language', lng);
  }
  applyLanguageSettings(lng);
});

// Initial application
applyLanguageSettings(savedLanguage);

export default i18n;
