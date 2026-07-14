import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "drive-config.json");

export async function GET() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, "utf-8");
      const config = JSON.parse(data);
      // Don't send private key to frontend for security
      return NextResponse.json({
        folderId: config.folderId || "",
        clientEmail: config.clientEmail || "",
        hasPrivateKey: !!config.privateKey,
        connected: !!(config.clientEmail && config.privateKey && config.folderId)
      });
    }
    return NextResponse.json({
      folderId: "",
      clientEmail: "",
      hasPrivateKey: false,
      connected: false
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Read existing to preserve private key if not updated
    let existingConfig: any = {};
    if (fs.existsSync(CONFIG_PATH)) {
      try {
        existingConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      } catch (e) {}
    }

    const newConfig = {
      folderId: body.folderId !== undefined ? body.folderId : existingConfig.folderId,
      clientEmail: body.clientEmail !== undefined ? body.clientEmail : existingConfig.clientEmail,
      privateKey: body.privateKey ? body.privateKey : existingConfig.privateKey,
    };

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));

    return NextResponse.json({ success: true, connected: !!(newConfig.clientEmail && newConfig.privateKey && newConfig.folderId) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
