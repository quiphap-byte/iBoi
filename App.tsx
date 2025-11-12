import React, { useState } from 'react';
import FortuneTeller from './components/FortuneTeller';
import Chatbot from './components/Chatbot';
import SparklesIcon from './components/icons/SparklesIcon';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useI18n } from './hooks/useI18n';
import { FortuneReading } from './types';

const App: React.FC = () => {
    const { t } = useI18n();
    const year = new Date().getFullYear();
    const [reading, setReading] = useState<FortuneReading | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0c0a1a] to-[#1e1533] text-gray-200 font-sans relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/2 w-96 h-96 bg-purple-900/50 rounded-full filter blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/2 w-96 h-96 bg-pink-900/50 rounded-full filter blur-3xl opacity-50"></div>
            
            <LanguageSwitcher />

            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen py-10">
                <header className="text-center mb-8">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center gap-4">
                        <SparklesIcon className="w-12 h-12" />
                        {t('appName')}
                    </h1>
                    <p className="text-lg text-purple-300 mt-2">{t('appSubtitle')}</p>
                </header>

                <FortuneTeller onReadingComplete={setReading} />
                
                <footer className="text-center text-gray-500 mt-10 text-sm px-4">
                    <p>{t('footerText', { year })}</p>
                </footer>
            </main>
            
            <Chatbot reading={reading} />
        </div>
    );
};

export default App;
