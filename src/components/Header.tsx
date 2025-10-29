import React from 'react';
import { RefreshCwIcon } from './IconComponents';
import { Language } from '../types';
import { translations } from '../i18n';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageButton: React.FC<{
  lang: Language,
  currentLang: Language,
  setLanguage: (lang: Language) => void,
  children: React.ReactNode
}> = ({ lang, currentLang, setLanguage, children }) => (
  <button
    onClick={() => setLanguage(lang)}
    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
      currentLang === lang
        ? 'bg-cyan-600 text-white'
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
    }`}
  >
    {children}
  </button>
);


const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, language, setLanguage, t }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t.trendsTitle}</h1>
        <p className="mt-1 text-slate-400">{t.trendsDescription}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1">
          <LanguageButton lang="en" currentLang={language} setLanguage={setLanguage}>EN</LanguageButton>
          <LanguageButton lang="es" currentLang={language} setLanguage={setLanguage}>ES</LanguageButton>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-slate-600 disabled:opacity-50 transition-all"
        >
          <RefreshCwIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? t.refreshing : t.refresh}
        </button>
      </div>
    </header>
  );
};

export default Header;