import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email atau NIK", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Email/NIK dan password wajib diisi");
        }

        // Cari user berdasarkan email ATAU NIK
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { nik: credentials.identifier }
            ]
          },
        });

        if (!user || !user.passwordHash) {
          // Log failed attempt - User not found
          const systemTenant = await prisma.tenant.findFirst();
          if (systemTenant) {
            await prisma.auditLog.create({
              data: {
                action: "LOGIN_FAILED",
                entity: "Security",
                details: { identifier: credentials.identifier, reason: "User not found" },
                category: "SECURITY",
                tenantId: systemTenant.id
              }
            });
          }
          throw new Error("Akun tidak ditemukan atau belum terdaftar");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          // Log failed attempt - Wrong password
          await prisma.auditLog.create({
            data: {
              action: "LOGIN_FAILED",
              entity: "Security",
              userId: user.id,
              details: { identifier: credentials.identifier, reason: "Wrong password" },
              category: "SECURITY",
              tenantId: user.tenantId
            }
          });
          throw new Error("Kata sandi salah");
        }

        if (!user.isActive) {
          throw new Error("Akun Anda dinonaktifkan. Hubungi admin.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          tenantId: user.tenantId,
          rt: (user as any).rt,
          rw: (user as any).rw,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.role = String(u.role); // Force string
        token.tenantId = u.tenantId;
        token.isFirstLogin = u.isFirstLogin;
        token.rt = u.rt;
        token.rw = u.rw;
        token.rw = u.rw;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as any;
        (session.user as any).id = t.id;
        (session.user as any).role = String(t.role); // Force string
        (session.user as any).tenantId = t.tenantId;
        (session.user as any).isFirstLogin = t.isFirstLogin;
        (session.user as any).rt = t.rt;
        (session.user as any).rw = t.rw;
      }
      return session;
    },
  },
};
