import React from 'react';

const PhysiognomyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10c0-5.52-4.48-10-10-10Z"/>
        <path d="M9 16s1.5-2 3-2 3 2 3 2"/>
        <path d="M9 9h.01"/>
        <path d="M15 9h.01"/>
    </svg>
);

export default PhysiognomyIcon;