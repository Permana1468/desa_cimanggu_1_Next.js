import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

// We rely on standard RP ID mapping. In production, this should match your real domain.
const rpName = "Desa Cimanggu I";
const expectedOrigin = process.env.NEXTAUTH_URL || "http://localhost:3000";
const rpID = new URL(expectedOrigin).hostname;

export async function POST(req: NextRequest) {
  try {
    console.log("HELLO FROM WEBAUTHN API");
    
    const body = await req.json();
    const { action } = body;

    if (action === "generate-registration") {
      const session = await getServerSession(authOptions);
      if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized - Registration" }, { status: 401 });
      }

      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      // Retrieve existing credentials to prevent re-registering the same device
      const userWebAuthnCredentials = await prisma.webAuthnCredential.findMany({
        where: { userId: user.id },
      });

      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: Buffer.from(user.id).toString('base64url'),
        userName: user.email || user.nik || user.id,
        // Require user verification for fingerprint/FaceID
        authenticatorSelection: {
          residentKey: "required",
          userVerification: "preferred",
        },
        excludeCredentials: userWebAuthnCredentials.map((cred) => ({
          id: Buffer.from(cred.credentialID, 'base64url').toString('base64'),
          type: "public-key",
          transports: cred.transports ? JSON.parse(cred.transports) : undefined,
        })) as any,
      });

      // Save challenge to the user in DB
      await prisma.user.update({
        where: { id: user.id },
        data: { currentChallenge: options.challenge },
      });

      return NextResponse.json(options);
    }

    if (action === "verify-registration") {
      const session = await getServerSession(authOptions);
      if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized - Registration" }, { status: 401 });
      }

      const { response } = body;
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user || !user.currentChallenge) {
        return NextResponse.json({ error: "Challenge not found" }, { status: 400 });
      }

      let verification;
      try {
        verification = await verifyRegistrationResponse({
          response,
          expectedChallenge: user.currentChallenge,
          expectedOrigin,
          expectedRPID: rpID,
        });
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      const { verified, registrationInfo } = verification;

      if (verified && registrationInfo) {
        const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp } = registrationInfo;

        await prisma.webAuthnCredential.create({
          data: {
            userId: user.id,
            credentialID: Buffer.from(credentialID).toString('base64url'),
            credentialPublicKey: Buffer.from(credentialPublicKey),
            counter: BigInt(counter),
            credentialDeviceType,
            credentialBackedUp,
            transports: JSON.stringify(response.response.transports || []),
          },
        });

        // Clear challenge
        await prisma.user.update({
          where: { id: user.id },
          data: { currentChallenge: null },
        });

        return NextResponse.json({ verified: true });
      }
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    if (action === "generate-authentication") {
      // For passkeys, we do not need to specify an email (discoverable credentials)
      // So we don't know the user yet. We will generate generic options.
      
      const options = await generateAuthenticationOptions({
        rpID,
        userVerification: "preferred",
      });

      // We need to store this challenge somewhere. 
      // Because we don't know the user yet, we can't save it to a specific User row.
      // So we'll just set it in a cookie that we will read during NextAuth `authorize`!
      const res = NextResponse.json(options);
      res.cookies.set("webauthn_challenge", options.challenge, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 300, // 5 minutes
      });

      return res;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("WebAuthn API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
