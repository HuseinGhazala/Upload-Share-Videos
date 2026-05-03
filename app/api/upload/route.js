import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '../../lib/rateLimit';
import { validateVideoPayload, persistVideoBuffer } from '../../lib/completeVideoUpload';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`upload:${ip}`, { max: 10, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many upload requests. Try again in a minute.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('video');
    const visibilityInput = formData.get('visibility')?.toString() || 'public';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const check = validateVideoPayload({
      name: file.name,
      size: file.size,
      mimeType: file.type,
      visibility: visibilityInput,
    });
    if (check.error) {
      return NextResponse.json({ success: false, error: check.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const savedVideo = await persistVideoBuffer(buffer, {
      name: file.name,
      size: file.size,
      mimeType: file.type,
      visibility: visibilityInput,
    });

    return NextResponse.json({ success: true, video: savedVideo });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
