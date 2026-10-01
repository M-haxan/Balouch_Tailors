import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

const LanguageToggle = ({ className = '', isCompact = false }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleSelect = (lang) => {
    if (currentLang !== lang) {
      i18n.changeLanguage(lang);
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 bg-gray-100 p-1 rounded-full border border-gray-200 shadow-2xs ${className}`} dir="ltr">
      <button
        type="button"
        onClick={() => handleSelect('en')}
        className={`px-2.5 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
          currentLang === 'en'
            ? 'bg-[#0F172A] text-[#DFAC43] shadow-xs scale-102'
            : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
        }`}
        title="Switch to English"
      >
        <FiGlobe className="text-[11px] shrink-0" />
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelect('ur')}
        className={`px-2.5 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
          currentLang === 'ur'
            ? 'bg-[#0F172A] text-[#DFAC43] shadow-xs scale-102'
            : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
        }`}
        title="اردو میں تبدیل کریں"
      >
        <span>اردو</span>
      </button>
    </div>
  );
};

export default LanguageToggle;
