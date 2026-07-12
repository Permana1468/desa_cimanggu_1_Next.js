import { NextResponse } from 'next/server';
import { uploadToGoogleDrive } from '@/lib/gdrive';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const mimeType = file.type || 'application/octet-stream';

    const result = await uploadToGoogleDrive(buffer, fileName, mimeType);

    if (result.success) {
      return NextResponse.json({ url: result.url });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API Upload Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat upload' }, { status: 500 });
  }
}
