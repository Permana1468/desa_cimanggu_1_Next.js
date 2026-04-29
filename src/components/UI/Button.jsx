import React from 'react';

const Button = ({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    disabled = false,
    icon: Icon = null,
    type = 'button'
}) => {
    const variants = {
        primary: 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20',
        secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
        danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
        success: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20',
        outline: 'bg-transparent border border-white/20 text-white hover:bg-white/5',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-5 py-2.5 text-sm rounded-xl',
        lg: 'px-6 py-3 text-base rounded-2xl',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg 
                ${variants[variant]} 
                ${sizes[size]} 
                ${className}
            `}
        >
            {Icon && <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} />}
            {children}
        </button>
    );
};

export default Button;
