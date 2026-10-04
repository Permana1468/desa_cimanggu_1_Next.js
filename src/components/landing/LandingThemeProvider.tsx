"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface LandingThemeContextType {
    isNightMode: boolean;
    toggleNightMode: () => void;
    isDualMode: boolean;
    toggleDualMode: () => void;
    language: 'id' | 'en';
    setLanguage: (lang: 'id' | 'en') => void;
}

const LandingThemeContext = createContext<LandingThemeContextType | undefined>(undefined);

export function LandingThemeProvider({ 
    children, 
    initialIsNightMode = false,
    initialIsDualMode = false
}: { 
    children: React.ReactNode, 
    initialIsNightMode?: boolean,
    initialIsDualMode?: boolean
}) {
    const [isNightMode, setIsNightMode] = useState(initialIsNightMode);
    const [isDualMode, setIsDualMode] = useState(initialIsDualMode);
    const [language, setLanguageState] = useState<'id' | 'en'>('id');

    useEffect(() => {
        // Sync with cookie on mount
        const cookies = document.cookie.split(';');
        const themeCookie = cookies.find(c => c.trim().startsWith('landingThemeMode='));
        if (themeCookie) {
            const val = themeCookie.split('=')[1];
            setIsNightMode(val === 'night');
        }
        const dualCookie = cookies.find(c => c.trim().startsWith('landingDualMode='));
        if (dualCookie) {
            const val = dualCookie.split('=')[1];
            setIsDualMode(val === 'true');
        }
        const langCookie = cookies.find(c => c.trim().startsWith('landingLanguage='));
        if (langCookie) {
            const val = langCookie.split('=')[1];
            if (val === 'id' || val === 'en') setLanguageState(val);
        }
    }, []);

    const toggleNightMode = () => {
        const newValue = !isNightMode;
        setIsNightMode(newValue);
        document.cookie = `landingThemeMode=${newValue ? 'night' : 'normal'}; path=/; max-age=31536000`;
    };

    const toggleDualMode = () => {
        const newValue = !isDualMode;
        setIsDualMode(newValue);
        document.cookie = `landingDualMode=${newValue}; path=/; max-age=31536000`;
    };

    const setLanguage = (lang: 'id' | 'en') => {
        setLanguageState(lang);
        document.cookie = `landingLanguage=${lang}; path=/; max-age=31536000`;
    };

    return (
        <LandingThemeContext.Provider value={{ isNightMode, toggleNightMode, isDualMode, toggleDualMode, language, setLanguage }}>
            <div className="transition-colors duration-500 min-h-screen overflow-x-hidden relative landing-night-mode bg-[#050914] text-white">
                {children}
            </div>
        </LandingThemeContext.Provider>
    );
}

export function useLandingTheme() {
    const context = useContext(LandingThemeContext);
    if (context === undefined) {
        // Fallback for components like TechNightCanvas used outside of LandingThemeProvider (e.g. login page)
        return { isNightMode: true, toggleNightMode: () => {}, isDualMode: false, toggleDualMode: () => {}, language: 'id', setLanguage: () => {} };
    }
    return context;
}
