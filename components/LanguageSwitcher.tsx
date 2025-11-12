
import React from 'react';
import { useI18n } from '../hooks/useI18n';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useI18n();

    const toggleLanguage = () => {
        setLanguage(language === 'vi' ? 'en' : 'vi');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="absolute top-4 right-4 z-20 bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors text-sm"
        >
            {language === 'vi' ? 'English' : 'Tiếng Việt'}
        </button>
    );
};

export default LanguageSwitcher;
