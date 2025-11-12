import React from 'react';

const ChineseZodiacIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 13.5a3 3 0 0 1-5 0 3 3 0 0 0-5 0"/>
        <path d="M14.5 8.5a3 3 0 0 1-5 0 3 3 0 0 0-5 0"/>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <path d="M12 11V3"/>
        <path d="m7 5 5 6 5-6"/>
    </svg>
);

export default ChineseZodiacIcon;