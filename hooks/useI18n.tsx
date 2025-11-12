import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import vi from '../locales/vi.ts';
import en from '../locales/en.ts';

type Language = 'vi' | 'en';
type Translations = typeof vi;

const translations: Record<Language, Translations> = { vi, en };

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, replacements?: Record<string, string | number>) => string | string[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi'); // Default to Vietnamese

  const t = useCallback((key: keyof Translations, replacements?: Record<string, string | number>) => {
    let translation = translations[language][key] || translations['en'][key];

    if (Array.isArray(translation)) {
      return translation;
    }

    if (replacements) {
      Object.keys(replacements).forEach(rKey => {
        translation = (translation as string).replace(`{${rKey}}`, String(replacements[rKey]));
      });
    }
    return translation;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
