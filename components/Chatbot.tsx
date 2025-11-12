import React, { useState, useEffect, useRef } from 'react';
// FIX: Import the 'marked' library to handle markdown parsing.
import { marked } from 'marked';
import { useI18n } from '../hooks/useI18n';
import { Message, MessageAuthor, FortuneReading } from '../types';
import { createChat } from '../services/geminiService';
import { Chat as GeminiChat } from '@google/genai';
import ChatIcon from './icons/ChatIcon';
import CloseIcon from './icons/CloseIcon';
import SendIcon from './icons/SendIcon';

interface ChatbotProps {
    reading: FortuneReading | null;
}

const Chatbot: React.FC<ChatbotProps> = ({ reading }) => {
    const { t, language } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<GeminiChat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reading && !chat) { // Initialize chat only once when reading is available
            const newChat = createChat(reading, language);
            setChat(newChat);
            setMessages([
                { author: MessageAuthor.BOT, text: t('chatbotWelcome') as string }
            ]);
        }
    }, [reading, language, t, chat]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: Message = { author: MessageAuthor.USER, text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: currentInput });
            const botMessage: Message = { author: MessageAuthor.BOT, text: response.text };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: Message = { author: MessageAuthor.BOT, text: t('error') as string };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!reading) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-50"
                aria-label={t('chatbotToggle') as string}
            >
                {isOpen ? <CloseIcon className="w-8 h-8"/> : <ChatIcon className="w-8 h-8"/>}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-slate-900/80 backdrop-blur-lg border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col z-40 animate-fade-in-up">
                    <header className="flex items-center justify-between p-4 border-b border-purple-500/30">
                        <h3 className="text-lg font-bold text-white">{t('chatbotTitle')}</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <CloseIcon className="w-5 h-5"/>
                        </button>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.author === MessageAuthor.USER ? 'bg-pink-600 text-white rounded-br-none' : 'bg-slate-700 text-gray-200 rounded-bl-none'}`}>
                                    {/* FIX: Use marked library to parse markdown content. Replaced deprecated marked.parse() with marked(). */}
                                    <p dangerouslySetInnerHTML={{ __html: marked(msg.text) }}></p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex justify-start">
                                <div className="bg-slate-700 text-gray-200 rounded-2xl rounded-bl-none p-3">
                                   <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                   </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <footer className="p-4 border-t border-purple-500/30">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                placeholder={t('chatbotInputPlaceholder') as string}
                                className="flex-1 bg-slate-800/70 border border-purple-500/30 rounded-full px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            />
                            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 disabled:opacity-50 transition-colors">
                                <SendIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

export default Chatbot;