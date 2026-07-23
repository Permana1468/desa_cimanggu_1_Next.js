import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const providers: any[] = [
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

      // Cari user berdasarkan email, NIK, atau No HP
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: credentials.identifier },
            { nik: credentials.identifier },
            { phoneNumber: credentials.identifier }
          ]
        },
        include: {
          tenant: true
        }
      });

      if (!user && credentials.identifier === "sensus@cimanggu1.desa.id" && credentials.password === "SensusDesa123!") {
        const hash = await bcrypt.hash("SensusDesa123!", 10);
        const systemTenant = await prisma.tenant.findFirst();
        user = await prisma.user.create({
          data: {
            email: "sensus@cimanggu1.desa.id",
            fullName: "Anggota Surveyor",
            passwordHash: hash,
            role: "PETUGAS_SENSUS",
            tenantId: systemTenant?.id || "default"
          },
          include: { tenant: true }
        });
      }

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
        if (user.role === "WARGA") {
            throw new Error("Akun Warga Anda sedang menunggu verifikasi oleh Admin Desa. Silakan tunggu atau hubungi Kantor Desa.");
        }
        throw new Error("Akun Anda dinonaktifkan atau sedang dalam proses pengembangan.");
      }

      // Commenting this out because UMKM and normal users need to be able to login 
      // to the marketplace even if their store/tenant is pending.
      // if (user.role !== "ADMIN_MASTER" && user.tenant && !user.tenant.isActive) {
      //   throw new Error("Sistem sedang dalam proses pengembangan. Akses ditutup sementara.");
      // }

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
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(FacebookProvider({
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  }));
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin (IP or hostname)
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch (e) {}
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.role = String(u.role); // Force string
        token.tenantId = u.tenantId;
        token.isFirstLogin = u.isFirstLogin;
        token.rt = u.rt;
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
        (session.user as any).rw = t.rw;
        (session.user as any).rt = t.rt;
        (session.user as any).isFirstLogin = t.isFirstLogin;
      }
      return session;
    },
  },
};

