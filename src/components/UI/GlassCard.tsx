import React from 'react';

const GlassCard = ({ children, className = '', hover = true }) => {
    return (
        <div className={`
            relative bg-[#1e293b]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl overflow-hidden
            ${hover ? 'hover:border-white/20 transition-all duration-300' : ''}
            ${className}
        `}>
            {/* Subtle highlight effect */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default GlassCard;
