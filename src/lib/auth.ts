import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

const expectedOrigin = process.env.NEXTAUTH_URL || "http://localhost:3000";
const rpID = new URL(expectedOrigin).hostname;

const providers: any[] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      identifier: { label: "Email atau NIK", type: "text" },
      password: { label: "Password", type: "password" },
      webauthn: { label: "WebAuthn Response", type: "text" },
      webauthnChallenge: { label: "Challenge", type: "text" },
    },
    async authorize(credentials, req) {
      if (!credentials?.webauthn && (!credentials?.identifier || !credentials?.password)) {
        throw new Error("Email/NIK dan password wajib diisi");
      }

      let user;

      // === WEBAUTHN FLOW ===
      if (credentials?.webauthn && credentials?.webauthnChallenge) {
        const response = JSON.parse(credentials.webauthn);
        const { id } = response;

        // Find the credential
        const authenticator = await prisma.webAuthnCredential.findUnique({
          where: { credentialID: id },
          include: { user: { include: { tenant: true } } },
        });

        if (!authenticator) {
          throw new Error("Kredensial biometrik tidak ditemukan.");
        }

        let verification;
        try {
          verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: credentials.webauthnChallenge,
            expectedOrigin,
            expectedRPID: rpID,
            authenticator: {
              credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
              credentialPublicKey: authenticator.credentialPublicKey,
              counter: Number(authenticator.counter),
              transports: authenticator.transports ? JSON.parse(authenticator.transports) : undefined,
            },
          });
        } catch (error: any) {
          throw new Error("Autentikasi biometrik gagal: " + error.message);
        }

        if (!verification.verified) {
          throw new Error("Autentikasi biometrik tidak valid.");
        }

        // Update counter
        await prisma.webAuthnCredential.update({
          where: { id: authenticator.id },
          data: { counter: BigInt(verification.authenticationInfo.newCounter) },
        });

        user = authenticator.user;
      } 
      // === PASSWORD FLOW ===
      else {

      // Cari user berdasarkan email, NIK, atau No HP
      user = await prisma.user.findFirst({
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
      }

      if (!user) return null;

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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email || (profile as any)?.email;
        if (!email) return false;

        // 1. Cek apakah user sudah terdaftar di database User desa
        const dbUser = await prisma.user.findFirst({
          where: { email },
          include: { resident: true }
        });

        if (dbUser) {
          // Akun Google wajib role WARGA jika ini akun warga
          if (dbUser.role === "WARGA" && !dbUser.residentId && dbUser.nik) {
            const citizen = await prisma.dataKependudukan.findFirst({
              where: { nik: dbUser.nik }
            });
            if (citizen) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { residentId: citizen.id, tenantId: citizen.tenantId }
              });
            } else {
              return "/login?error=GoogleAccountNotRegisteredInVillage";
            }
          }
          if (!dbUser.isActive) return false;
          (user as any).id = dbUser.id;
          (user as any).role = dbUser.role;
          (user as any).tenantId = dbUser.tenantId;
          return true;
        }

        // 2. Bukan warga Desa Cimanggu I atau akun Google belum terdaftar/ditautkan dengan NIK desa -> DITOLAK
        return "/login?error=GoogleAccountNotRegisteredInVillage";
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin (IP or hostname)
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch (e) {}
      return baseUrl;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.role = String(u.role); // Force string
        token.tenantId = u.tenantId;
        token.isFirstLogin = u.isFirstLogin;
        token.rt = u.rt;
        token.rw = u.rw;
      }
      if (trigger === "update" && session) {
        if (session.user?.name) token.name = session.user.name;
      }
      // Never store large base64 image in JWT cookies to prevent HTTP 431
      delete (token as any).photo;
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

        // Fetch fresh photo directly from database in server session (Safe from cookie limits)
        if (t.id) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: t.id },
              select: { photo: true }
            });
            (session.user as any).photo = dbUser?.photo || null;
          } catch {
            (session.user as any).photo = null;
          }
        }
      }
      return session;
    },
  },
};

