"use client";

import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense>
      <SessionProvider>{children}</SessionProvider>
    </Suspense>
  );
};
