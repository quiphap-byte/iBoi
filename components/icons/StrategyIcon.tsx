import React from 'react';

const StrategyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 14 4-4"/>
        <path d="M3.34 19a10 10 0 1 1 17.32 0"/>
        <path d="m12 18-2-2"/>
        <path d="m12 12-2-2"/>
        <path d="m12 6-2-2"/>
        <path d="m6 12-2-2"/>
    </svg>
);

export default StrategyIcon;
