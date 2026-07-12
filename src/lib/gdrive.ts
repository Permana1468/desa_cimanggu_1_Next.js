import { google } from "googleapis";
import { Readable } from "stream";
import prisma from "@/lib/prisma";
import { getAuthenticatedClient } from "@/actions/google";

// Helper function to convert Buffer to Readable stream
const bufferToStream = (buffer: Buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

export async function uploadToGoogleDrive(fileBuffer: Buffer, fileName: string, mimeType: string) {
  try {
    // 1. Ambil kredensial dari Database (yang diset di Admin Master)
    const config = await prisma.systemSetting.findUnique({
      where: { id: "global_config" }
    });
    const settings = (config?.settings as any) || {};
    const googleIntegration = settings.googleIntegration;

    if (!googleIntegration || !googleIntegration.isConnected) {
      throw new Error("Integrasi Google API belum diaktifkan di menu Master Admin.");
    }

    // 2. Dapatkan Authenticated Client (Bisa berupa Service Account atau OAuth2, handle token refresh otomatis)
    const { auth, clientEmail } = await getAuthenticatedClient(googleIntegration);

    // 3. Folder ID yang di-hardcode dari user
    const folderId = "1QDg-LrurA0mqwnxU6ne7sA1ispAG5CqB";

    const drive = google.drive({ version: "v3", auth: auth as any });

    const fileMetadata = {
      name: fileName,
      parents: [folderId], // Folder destination
    };

    const media = {
      mimeType: mimeType,
      body: bufferToStream(fileBuffer),
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
    });

    // Make the file public so anyone with the link can view it
    if (file.data.id) {
      await drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
    }

    // Return the direct download link or webViewLink
    // Note: webContentLink is a direct download link. webViewLink is the preview.
    return {
      success: true,
      url: file.data.webViewLink,
      id: file.data.id,
    };
  } catch (error: any) {
    console.error("Google Drive Upload Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
