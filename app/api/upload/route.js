import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '../../lib/rateLimit';
import { validateVideoPayload, persistVideoBuffer } from '../../lib/completeVideoUpload';
import {
  getAuthenticatedUploadContext,
  consumeUploadCreditAfterSuccessfulSave,
} from '../../lib/authSession';

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

    const { user, maxUploadBytes, uploadAllowed } = await getAuthenticatedUploadContext();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول لرفع الفيديوهات.' },
        { status: 401 }
      );
    }
    if (!uploadAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يوجد رصيد رفع. اشترِ إحدى الباقات من صفحة الأسعار (١٠ / ٢٥ / ٥٠ ريال).',
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('video');
    const visibilityInput = formData.get('visibility')?.toString() || 'public';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const check = validateVideoPayload(
      {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        visibility: visibilityInput,
      },
      maxUploadBytes
    );
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
      ownerId: user.id,
      maxVideoBytes: maxUploadBytes,
    });

    const consumed = await consumeUploadCreditAfterSuccessfulSave();
    if (!consumed.ok) {
      console.error('Upload saved but credit consume failed:', consumed.error);
    }

    return NextResponse.json({
      success: true,
      video: savedVideo,
      ...(consumed.ok ? {} : { creditWarning: true }),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
