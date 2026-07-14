import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

// Helper to initialize Google Drive Client
function getDriveClient() {
  let clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // Try reading from config file
  const CONFIG_PATH = path.join(process.cwd(), "drive-config.json");
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      if (config.clientEmail) clientEmail = config.clientEmail;
      if (config.privateKey) privateKey = config.privateKey.replace(/\\n/g, '\n');
    } catch (e) {}
  }

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google Service Account Credentials. Harap lengkapi di Pengaturan Integrasi.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
      return NextResponse.json({ error: "folderId parameter is required" }, { status: 400 });
    }

    const drive = getDriveClient();
    
    // List files in the folder
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, size, webViewLink, webContentLink, createdTime)",
      orderBy: "createdTime desc",
    });

    return NextResponse.json({ files: res.data.files });
  } catch (error: any) {
    console.error("Drive API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const folderId = formData.get("folderId") as string;
    const file = formData.get("file") as File;

    if (!folderId || !file) {
      return NextResponse.json({ error: "folderId and file are required" }, { status: 400 });
    }

    const drive = getDriveClient();
    
    // Convert File to Buffer to Stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata = {
      name: file.name,
      parents: [folderId],
    };
    
    const media = {
      mimeType: file.type,
      body: stream,
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink, webContentLink",
    });

    // Make the file publicly accessible so anyone can view/download it
    try {
      await drive.permissions.create({
        fileId: res.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        }
      });
    } catch (permErr) {
      console.warn("Failed to set file to public:", permErr);
    }

    return NextResponse.json({ file: res.data });
  } catch (error: any) {
    console.error("Drive API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
