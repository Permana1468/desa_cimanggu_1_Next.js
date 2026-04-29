import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Standard Cinematic Modal Component
 * 
 * @param {boolean} isOpen - Control visibility
 * @param {function} onClose - Function to close modal
 * @param {string} title - Modal heading
 * @param {React.ReactNode} children - Modal content
 * @param {string} maxWidth - Tailwind max-width class (default: max-w-2xl)
 * @param {React.ReactNode} footer - Optional footer actions
 */
const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    maxWidth = 'max-w-2xl',
    footer,
    icon: Icon
}) => {
    
    // Prevent scroll on body when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 animate-fade-in group/modal">
            {/* Backdrop with heavy blur */}
            <div 
                className="absolute inset-0 bg-dark-overlay backdrop-blur-[15px] transition-opacity duration-500"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className={`relative z-10 w-full ${maxWidth} bg-dark-base border border-white/10
                            rounded-[1.5rem] md:rounded-[2rem] shadow-[0_25px_80px_rgba(0,0,0,0.5)] overflow-hidden
                            flex flex-col max-h-[92vh] animate-scale-up-long
                            backdrop-blur-3xl transition-colors duration-500`}>
                
                {/* Visual Glow Ornament */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-gold/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[90px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="px-6 md:px-8 py-5 md:py-6 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.03] shrink-0">
                    <div className="flex items-center gap-4">
                        {Icon && (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold-border flex items-center justify-center text-gold shadow-gold-glow">
                                <Icon size={20} />
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-text-main tracking-widest uppercase">
                                {title}
                            </h3>
                            <div className="h-0.5 w-10 bg-gold rounded-full mt-1.5 shadow-gold-glow" />
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-text-tertiary hover:text-text-main hover:bg-white/10 hover:shadow-lg transition-all duration-300 transform hover:rotate-90"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-gradient-to-b from-transparent to-white/[0.01]">
                    <div className="animate-fade-in-up">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 md:px-8 py-5 md:py-6 border-t border-white/[0.06] flex flex-col md:flex-row justify-end gap-3 bg-white/[0.02] backdrop-blur-md shrink-0">
                        {footer}
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scale-up-long {
                    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-scale-up-long {
                    animation: scale-up-long 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
            ` }} />
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default Modal;
