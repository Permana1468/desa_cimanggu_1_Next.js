import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { target, message } = body;

        if (!target || !message) {
            return NextResponse.json({ success: false, error: "Nomor tujuan dan pesan wajib diisi" }, { status: 400 });
        }

        // Using user's provided token or fallback to environment variable
        const fonnteToken = process.env.FONNTE_TOKEN || "ssiQVs67VWuAGXTDfMWj";

        const formData = new FormData();
        formData.append("target", target);
        formData.append("message", message);
        formData.append("countryCode", "62"); // Auto format to Indonesia

        const response = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
                "Authorization": fonnteToken,
            },
            body: formData
        });

        const data = await response.json();

        if (data.status) {
            return NextResponse.json({ success: true, data });
        } else {
            return NextResponse.json({ success: false, error: data.reason || "Fonnte API Error" }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Fonnte API Error:", error);
        return NextResponse.json({ success: false, error: "Terjadi kesalahan internal server" }, { status: 500 });
    }
}
