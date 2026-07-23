"use client";
import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

const ScrollReveal = ({ children, delay = 0, className = "" }: ScrollRevealProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentDomNode = domRef.current;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        if (currentDomNode) {
            observer.observe(currentDomNode);
        }

        return () => {
            if (currentDomNode) {
                observer.unobserve(currentDomNode);
            }
        };
    }, []);

    return (
        <div
            ref={domRef}
            className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
