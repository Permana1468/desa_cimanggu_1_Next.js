"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Define timeout to 15 minutes (15 * 60 * 1000 ms)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export default function SessionTimeoutHandler() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const lastActivity = useRef<number>(0);

  // 0. Console Developer Signature
  useEffect(() => {
    console.log(
      `%c
███╗   ███╗██╗   ██╗██╗  ██╗ █████╗ ███╗   ███╗ █████╗ ██████╗ 
████╗ ████║██║   ██║██║  ██║██╔══██╗████╗ ████║██╔══██╗██╔══██╗
██╔████╔██║██║   ██║███████║███████║██╔████╔██║███████║██║  ██║
██║╚██╔╝██║██║   ██║██╔══██║██╔══██║██║╚██╔╝██║██╔══██║██║  ██║
██║ ╚═╝ ██║╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║██║  ██║██████╔╝
╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝ 
                                                               
 █████╗ ██╗     ██████╗ ██╗ █████╗ ███╗   ██╗███████╗██╗  ██╗ █████╗ ██╗  ██╗
██╔══██╗██║     ██╔══██╗██║██╔══██╗████╗  ██║██╔════╝╚██╗██╔╝██╔══██╗██║  ██║
███████║██║     ██║  ██║██║███████║██╔██╗ ██║███████╗ ╚███╔╝ ███████║███████║
██╔══██║██║     ██║  ██║██║██╔══██║██║╚██╗██║╚════██║  ██╔╝  ██╔══██║██╔══██║
██║  ██║███████╗██████╔╝██║██║  ██║██║ ╚████║███████║  ██║   ██║  ██║██║  ██║
╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝  ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝
      `,
      "color: #6366f1; font-family: monospace; font-weight: bold; line-height: 1.2;"
    );
    console.log(
      "%cMuhamad Aldiansyah — Lead Fullstack Engineer",
      "color: #ffffff; font-family: system-ui, sans-serif; font-size: 13px; font-weight: 800; background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 8px 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);"
    );
  }, []);

  // Check if current route is a protected/guarded route
  const isGuardedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/kelembagaan") ||
    pathname.startsWith("/master-admin") ||
    pathname.startsWith("/resident");

  // 1. Session Storage check: Tab/Browser Close Detection
  useEffect(() => {
    if (status === "authenticated" && isGuardedRoute) {
      const isTabActive = sessionStorage.getItem("tab_session_active") === "true";
      if (!isTabActive) {
        // Automatically sign out if sessionStorage does not have active flag
        signOut({ callbackUrl: "/login?reason=expired" });
      }
    }
  }, [status, pathname, isGuardedRoute]);

  // 2. Idle Timeout check: Inactivity Detection
  useEffect(() => {
    if (status !== "authenticated" || !isGuardedRoute) return;

    // Initialize activity time
    lastActivity.current = Date.now();

    const handleActivity = () => {
      lastActivity.current = Date.now();
    };

    // Listen to user activity events
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check inactivity periodically (every 10 seconds)
    const checkInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity.current >= INACTIVITY_TIMEOUT) {
        clearInterval(checkInterval);
        signOut({ callbackUrl: "/login?reason=inactive" });
      }
    }, 10000);

    return () => {
      // Cleanup event listeners and interval
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(checkInterval);
    };
  }, [status, isGuardedRoute]);

  return null;
}
