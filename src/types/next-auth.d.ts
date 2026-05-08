import { RoleType } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string;
      rt?: string | null;
      rw?: string | null;
      isFirstLogin?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: RoleType;
    tenantId: string;
    rt?: string | null;
    rw?: string | null;
    isFirstLogin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    tenantId: string;
    rt?: string | null;
    rw?: string | null;
    isFirstLogin?: boolean;
  }
}
