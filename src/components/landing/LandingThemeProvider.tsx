"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface LandingThemeContextType {
    isNightMode: boolean;
    toggleNightMode: () => void;
}

const LandingThemeContext = createContext<LandingThemeContextType | undefined>(undefined);

export function LandingThemeProvider({ 
    children, 
    initialIsNightMode = false 
}: { 
    children: React.ReactNode, 
    initialIsNightMode?: boolean 
}) {
    const [isNightMode, setIsNightMode] = useState(initialIsNightMode);

    useEffect(() => {
        // Sync with cookie on mount
        const cookies = document.cookie.split(';');
        const themeCookie = cookies.find(c => c.trim().startsWith('landingThemeMode='));
        if (themeCookie) {
            const val = themeCookie.split('=')[1];
            setIsNightMode(val === 'night');
        }
    }, []);

    const toggleNightMode = () => {
        const newValue = !isNightMode;
        setIsNightMode(newValue);
        document.cookie = `landingThemeMode=${newValue ? 'night' : 'normal'}; path=/; max-age=31536000`;
    };

    return (
        <LandingThemeContext.Provider value={{ isNightMode, toggleNightMode }}>
            <div className={`transition-colors duration-500 min-h-screen overflow-x-hidden relative ${isNightMode ? 'landing-night-mode bg-[#050914] text-white' : 'landing-light-mode bg-slate-50 text-slate-900'}`}>
                {/* Global CSS overrides for Light Mode without altering every single file */}
                {!isNightMode && (
                    <style dangerouslySetInnerHTML={{ __html: `
                        .landing-light-mode .text-white { color: #0f172a !important; }
                        .landing-light-mode .text-slate-200 { color: #1e293b !important; }
                        .landing-light-mode .text-slate-300,
                        .landing-light-mode .text-slate-400 { color: #475569 !important; }
                        
                        .landing-light-mode .bg-\\[\\#050914\\],
                        .landing-light-mode .bg-\\[\\#060b17\\] { background-color: #f8fafc !important; }
                        
                        .landing-light-mode .bg-slate-900,
                        .landing-light-mode .bg-slate-950,
                        .landing-light-mode .bg-\\[\\#080e1c\\] { background-color: #ffffff !important; }
                        
                        /* Navbar and Header Overrides - Aesthetic Glass */
                        .landing-light-mode .bg-\\[\\#080e1c\\]\\/95 { 
                            background-color: rgba(255, 255, 255, 0.7) !important; 
                            backdrop-filter: blur(20px) !important;
                            -webkit-backdrop-filter: blur(20px) !important;
                            border-bottom: 1px solid rgba(226, 232, 240, 0.8) !important;
                            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
                        }
                        
                        .landing-light-mode .bg-slate-900\\/60 {
                            background-color: rgba(255, 255, 255, 0.5) !important; 
                            backdrop-filter: blur(12px) !important;
                            -webkit-backdrop-filter: blur(12px) !important;
                            border: 1px solid rgba(255, 255, 255, 0.6) !important;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
                        }

                        /* Badge & Small Elements */
                        .landing-light-mode .bg-slate-900\\/90 {
                            background-color: rgba(255, 255, 255, 0.6) !important; 
                            backdrop-filter: blur(10px) !important;
                            -webkit-backdrop-filter: blur(10px) !important;
                            border: 1px solid rgba(226, 232, 240, 0.8) !important;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) !important;
                        }
                        
                        /* Login Form Inputs */
                        .landing-light-mode input.bg-slate-950\\/80 {
                            background-color: rgba(248, 250, 252, 0.9) !important; /* slate-50 */
                            border: 1px solid rgba(203, 213, 225, 0.8) !important; /* slate-300 */
                            color: #0f172a !important; /* text-slate-900 */
                            backdrop-filter: none !important;
                        }
                        .landing-light-mode input.bg-slate-950\\/80::placeholder {
                            color: #64748b !important; /* text-slate-500 */
                        }
                        .landing-light-mode input.bg-slate-950\\/80:focus {
                            border-color: #06b6d4 !important; /* cyan-500 */
                            box-shadow: 0 0 15px rgba(6, 182, 212, 0.2) !important;
                        }
                        
                        /* Subtitle Box (Platform digital terpadu...) - Remove ugly box */
                        .landing-light-mode .bg-slate-900\\/40 {
                            background-color: transparent !important;
                            backdrop-filter: none !important;
                            -webkit-backdrop-filter: none !important;
                            border-left-color: rgba(6, 182, 212, 0.5) !important; /* Keep the left border */
                        }
                        
                        /* General Modals/Cards */
                        .landing-light-mode .bg-slate-900\\/80,
                        .landing-light-mode .bg-slate-950\\/80,
                        .landing-light-mode .bg-slate-950\\/90,
                        .landing-light-mode .bg-slate-950\\/95,
                        .landing-light-mode .bg-slate-950\\/98 { 
                            background-color: rgba(255, 255, 255, 0.85) !important; 
                            backdrop-filter: blur(16px) !important;
                            -webkit-backdrop-filter: blur(16px) !important;
                            border: 1px solid rgba(226, 232, 240, 0.8) !important;
                        }
                        
                        .landing-light-mode .border-cyan-500\\/20,
                        .landing-light-mode .border-cyan-500\\/30,
                        .landing-light-mode .border-cyan-500\\/40,
                        .landing-light-mode .border-white\\/5,
                        .landing-light-mode .border-white\\/10,
                        .landing-light-mode .border-white\\/15 {
                            border-color: rgba(203, 213, 225, 0.6) !important; /* border-slate-300/60 */
                        }
                        
                        .landing-light-mode .shadow-\\[0_0_50px_rgba\\(6\\,182\\,212\\,0\\.15\\)\\],
                        .landing-light-mode .shadow-\\[0_0_50px_rgba\\(6\\,182\\,212\\,0\\.2\\)\\] {
                            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08) !important;
                        }
                        
                        .landing-light-mode .mix-blend-luminosity {
                            mix-blend-mode: normal !important;
                            opacity: 0.15 !important;
                        }
                        
                        /* Hero Fog Shadows and Gradients */
                        .landing-light-mode .from-\\[\\#060a17\\]\\/90 {
                            --tw-gradient-from: rgba(248, 250, 252, 0.95) var(--tw-gradient-from-position) !important;
                        }
                        .landing-light-mode .via-\\[\\#060a17\\]\\/60 {
                            --tw-gradient-via: rgba(248, 250, 252, 0.75) var(--tw-gradient-via-position) !important;
                        }
                        .landing-light-mode .via-\\[\\#060a17\\]\\/85 {
                            --tw-gradient-via: rgba(248, 250, 252, 0.9) var(--tw-gradient-via-position) !important;
                        }
                        
                        /* Smooth bottom fade for hero background */
                        .landing-light-mode .from-\\[\\#060b17\\] {
                            --tw-gradient-from: #f8fafc var(--tw-gradient-from-position) !important;
                            --tw-gradient-to: rgba(248, 250, 252, 0) var(--tw-gradient-to-position) !important;
                            --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
                        }
                        .landing-light-mode .to-black\\/40 {
                            --tw-gradient-to: rgba(248, 250, 252, 0.6) var(--tw-gradient-to-position) !important;
                        }
                        .landing-light-mode .to-black\\/30 {
                            --tw-gradient-to: rgba(248, 250, 252, 0.5) var(--tw-gradient-to-position) !important;
                        }
                        
                        /* Fix buttons/badges */
                        .landing-light-mode .bg-cyan-500\\/15 { background-color: rgba(6, 182, 212, 0.1) !important; }
                        .landing-light-mode .bg-yellow-500\\/15 { background-color: rgba(250, 204, 21, 0.15) !important; }
                        .landing-light-mode .bg-purple-500\\/15 { background-color: rgba(168, 85, 247, 0.1) !important; }
                    `}} />
                )}
                {children}
            </div>
        </LandingThemeContext.Provider>
    );
}

export function useLandingTheme() {
    const context = useContext(LandingThemeContext);
    if (context === undefined) {
        // Fallback for components like TechNightCanvas used outside of LandingThemeProvider (e.g. login page)
        return { isNightMode: true, toggleNightMode: () => {} };
    }
    return context;
}
