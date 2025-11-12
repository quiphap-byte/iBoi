import React, { useState, useRef } from 'react';
// FIX: Import the 'marked' library to handle markdown parsing.
import { marked } from 'marked';
import { useI18n } from '../hooks/useI18n';
import { getFortuneReading, getDailyAdvice, getStrategicPlan } from '../services/geminiService';
import { FortuneReading, ReadingSection } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CameraModal from './CameraModal';
import AstrologyIcon from './icons/AstrologyIcon';
import NumerologyIcon from './icons/NumerologyIcon';
import TarotIcon from './icons/TarotIcon';
import PhysiognomyIcon from './icons/PhysiognomyIcon';
import ChineseZodiacIcon from './icons/ChineseZodiacIcon';
import UploadIcon from './icons/UploadIcon';
import CameraIcon from './icons/CameraIcon';
import SparklesIcon from './icons/SparklesIcon';
import DailyAdviceIcon from './icons/DailyAdviceIcon';
import StrategyIcon from './icons/StrategyIcon';
import CloseIcon from './icons/CloseIcon';

const iconMap: Record<ReadingSection['icon'], React.FC<{className?: string}>> = {
    astrology: AstrologyIcon,
    numerology: NumerologyIcon,
    tarot: TarotIcon,
    physiognomy: PhysiognomyIcon,
    chinese_zodiac: ChineseZodiacIcon,
};

interface FortuneTellerProps {
    onReadingComplete: (reading: FortuneReading) => void;
}

const FortuneTeller: React.FC<FortuneTellerProps> = ({ onReadingComplete }) => {
    const { t, language } = useI18n();
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [reading, setReading] = useState<FortuneReading | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [modalContent, setModalContent] = useState<{ title: string, content: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [modalLoadingMessages, setModalLoadingMessages] = useState<string[] | null>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoTaken = (dataUri: string) => {
        setPhoto(dataUri);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !dob) return;
        
        setIsLoading(true);
        setError(null);
        setReading(null);

        try {
            const dateOfBirth = new Date(dob);
            const result = await getFortuneReading(name, dateOfBirth, language, photo || undefined);
            setReading(result);
            onReadingComplete(result);
        } catch (err) {
            setError(t('error') as string);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDailyAdviceClick = async () => {
        if (!reading) return;
        setModalLoadingMessages(null);
        setIsModalOpen(true);
        setIsModalLoading(true);
        const title = t('todaysAdviceTitle') as string;
        setModalContent({ title, content: '' });
        try {
            const advice = await getDailyAdvice(reading, language);
            setModalContent({ title, content: advice });
        } catch (e) {
            setModalContent({ title, content: t('error') as string });
        } finally {
            setIsModalLoading(false);
        }
    };

    const handle5YearPlanClick = async () => {
        if (!reading) return;
        setModalLoadingMessages(t('planLoadingMessages') as string[]);
        setIsModalOpen(true);
        setIsModalLoading(true);
        const title = t('fiveYearPlanTitle') as string;
        setModalContent({ title, content: '' });
        try {
            const plan = await getStrategicPlan(reading, language);
            setModalContent({ title, content: plan });
        } catch (e) {
            setModalContent({ title, content: t('error') as string });
        } finally {
            setIsModalLoading(false);
        }
    };
    
    const renderSection = (section: ReadingSection, index: number) => {
        const IconComponent = iconMap[section.icon];
        return (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6 transform hover:scale-[1.02] transition-transform duration-300">
                <h3 className="text-2xl font-bold text-purple-300 mb-3 flex items-center gap-3">
                    {IconComponent && <IconComponent className="w-7 h-7" />}
                    {t(section.icon) as string}
                </h3>
                {/* FIX: Use marked library to parse markdown content. Replaced deprecated marked.parse() with marked(). */}
                <div className="text-gray-300 whitespace-pre-wrap prose prose-invert prose-p:text-gray-300" dangerouslySetInnerHTML={{ __html: marked(section.content) }}></div>
            </div>
        );
    };

    const renderModal = () => (
        isModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setIsModalOpen(false)}>
                <div className="bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-900/60 flex flex-col max-w-2xl w-[95%] max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
                        <h3 className="text-xl font-bold text-white">{modalContent?.title}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        {isModalLoading ? <LoadingSpinner /> : (
                            // FIX: Use marked library to parse markdown content. Replaced deprecated marked.parse() with marked().
                            <div className="text-gray-300 prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-purple-300" dangerouslySetInnerHTML={{ __html: marked(modalContent?.content || '') }}></div>
                        )}
                    </div>
                    <div className="p-4 border-t border-purple-500/30 flex justify-end">
                         <button onClick={() => setIsModalOpen(false)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            {t('close')}
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-2xl shadow-purple-900/40 p-6 md:p-10 border border-purple-500/20">
            {!reading && !isLoading && (
                 <div className="animate-fade-in">
                    <h2 className="text-3xl font-bold text-center text-white mb-6">{t('fortuneTellerTitle')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-purple-300 mb-2">{t('nameLabel')}</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('namePlaceholder') as string}
                                required
                                className="w-full bg-slate-800/70 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-purple-300 mb-2">{t('dobLabel')}</label>
                            <input
                                type="date"
                                id="dob"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                                className="w-full bg-slate-800/70 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            />
                        </div>
                        <div className="p-4 bg-slate-800/50 border border-purple-500/20 rounded-lg">
                            <label className="block text-sm font-medium text-purple-300 mb-3 text-center">{t('physiognomy')}</label>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    <UploadIcon className="w-5 h-5" />
                                    {t('uploadPhotoButton')}
                                </button>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
                                <button type="button" onClick={() => setIsCameraOpen(true)} className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    <CameraIcon className="w-5 h-5"/>
                                    {t('takePhotoButton')}
                                </button>
                                 {photo && <img src={photo} alt="User" className="w-16 h-16 rounded-full object-cover border-2 border-purple-400" />}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!name || !dob}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5"/>
                            {t('submitButton')}
                        </button>
                    </form>
                 </div>
            )}

            {isLoading && <LoadingSpinner />}
            
            {error && <p className="text-red-400 text-center animate-fade-in">{error}</p>}
            
            {reading && (
                <div className="animate-fade-in">
                    <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8">{t('readingTitle')}</h2>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6">
                        <p className="text-gray-300 italic">{reading.introduction}</p>
                    </div>
                    {reading.sections.map(renderSection)}
                     <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-purple-300 mb-3">{t('synthesis')}</h3>
                        <p className="text-gray-300">{reading.synthesis}</p>
                    </div>

                    <div className="mt-10 pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={handleDailyAdviceClick} className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-colors transform hover:scale-105">
                            <DailyAdviceIcon className="w-5 h-5"/>
                            {t('getTodaysAdviceButton')}
                        </button>
                        <button onClick={handle5YearPlanClick} className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg transition-colors transform hover:scale-105">
                            <StrategyIcon className="w-5 h-5"/>
                           {t('get5YearPlanButton')}
                        </button>
                    </div>
                </div>
            )}
            <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onPhotoTaken={handlePhotoTaken} />
            {renderModal()}
        </div>
    );
};

export default FortuneTeller;