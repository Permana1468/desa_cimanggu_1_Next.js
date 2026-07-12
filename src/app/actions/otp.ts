"use server";

export async function sendWhatsappOtp(phone: string, otp: string) {
    try {
        // Implementasi integrasi Fonnte / WhatsApp Gateway API
        const token = process.env.FONNTE_TOKEN;
        
        if (!token) {
            console.log(`[DEV MODE] Mengirim OTP ${otp} ke ${phone} via WhatsApp (Token Fonnte tidak ditemukan, simulasi berhasil).`);
            return { success: true, message: "OTP berhasil dikirim (Simulasi)" };
        }

        const res = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
                "Authorization": token,
            },
            body: new URLSearchParams({
                target: phone,
                message: `*DesaMart UMKM*\n\nKode OTP Anda adalah: *${otp}*\n\nJangan berikan kode ini kepada siapapun.`,
                countryCode: "62"
            })
        });

        const data = await res.json();
        if (data.status) {
            return { success: true, message: "OTP berhasil dikirim ke WhatsApp" };
        } else {
            return { success: false, error: data.reason || "Gagal mengirim pesan WhatsApp" };
        }
    } catch (error: any) {
        return { success: false, error: error.message || "Terjadi kesalahan sistem saat mengirim OTP" };
    }
}
