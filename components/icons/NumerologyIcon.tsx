
import React from 'react';

const NumerologyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0Z"/>
        <path d="M5 12V2l-3 3"/>
        <path d="m20 10-2 3 2 3h-3"/>
        <path d="M15 10v6"/>
    </svg>
);

export default NumerologyIcon;
