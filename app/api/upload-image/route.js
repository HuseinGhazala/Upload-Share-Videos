import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '../../lib/rateLimit';
import { validateVideoPayload, persistVideoBuffer } from '../../lib/completeVideoUpload';
import { getAuthenticatedUploadContext } from '../../lib/authSession';
import { getBrowserSessionIdFromCookies } from '../../lib/browserSession';
import { resolveMediaMimeType } from '../../lib/mediaTypes';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`upload-image:${ip}`, { max: 20, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json({ success: false, error: 'Too many image uploads.' }, { status: 429 });
    }

    const { user, maxUploadBytes, uploadAllowed } = await getAuthenticatedUploadContext();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول لرفع الصورة.' },
        { status: 401 }
      );
    }
    if (!uploadAllowed) {
      return NextResponse.json(
        { success: false, error: 'لا يوجد رصيد رفع. اشترِ باقة من صفحة الأسعار.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image');
    if (!file) {
      return NextResponse.json({ success: false, error: 'No image provided.' }, { status: 400 });
    }

    const mimeType = resolveMediaMimeType(file.name, file.type);
    const check = validateVideoPayload(
      { name: file.name, size: file.size, mimeType, visibility: 'public' },
      maxUploadBytes
    );
    if (check.error) {
      return NextResponse.json({ success: false, error: check.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const browserSessionId = await getBrowserSessionIdFromCookies();

    const saved = await persistVideoBuffer(buffer, {
      name: file.name,
      size: file.size,
      mimeType: check.mimeType ?? mimeType,
      visibility: 'public',
      ownerId: user.id,
      browserSessionId,
      maxVideoBytes: maxUploadBytes,
    });

    return NextResponse.json({
      success: true,
      item: {
        id: saved.id,
        type: 'image',
        mediaKind: saved.mediaKind,
        source: saved.source,
        url: saved.url,
        rawUrl: saved.rawUrl,
        accessToken: saved.accessToken,
        name: saved.name,
        size: saved.size,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
