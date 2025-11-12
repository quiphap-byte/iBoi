
import React from 'react';

const AstrologyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="m2 12 5 2-5 2" />
        <path d="m22 12-5-2 5-2" />
        <path d="m12 2 2 5-2 5" />
        <path d="m12 22 2-5-2-5" />
    </svg>
);

export default AstrologyIcon;
