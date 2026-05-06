import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
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
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.isFirstLogin = (user as any).isFirstLogin;
        token.rt = (user as any).rt;
        token.rw = (user as any).rw;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).isFirstLogin = token.isFirstLogin;
        (session.user as any).rt = token.rt;
        (session.user as any).rw = token.rw;
      }
      return session;
    },
  },
};
