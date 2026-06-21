import { NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { getClientIp, rateLimit } from '../../../../lib/rateLimit';
import { validateVideoPayload } from '../../../../lib/completeVideoUpload';
import { chunkTempRoot } from '../../../../lib/chunkedUploadConfig';
import { VIDEO_UPLOAD_CHUNK_BYTES } from '../../../../lib/uploadChunkSize';
import { cleanupExpiredChunkSessions } from '../../../../lib/chunkCleanup';
import { getAuthenticatedUploadContext } from '../../../../lib/authSession';
import { getBrowserSessionIdFromCookies } from '../../../../lib/browserSession';

/** Hard ceiling independent of tier (prevents pathological manifests). */
const MAX_CHUNKS_CAP = 500;

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`upload:${ip}`, { max: 15, windowMs: 60_000 });
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
          error: 'لا يوجد رصيد رفع. اشترِ باقة من صفحة الأسعار.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const fileName = body.fileName?.toString() || '';
    const size = Number(body.size);
    const mimeType = body.mimeType?.toString() || '';
    const visibility = body.visibility?.toString() || 'public';
    const linkTtl = body.linkTtl?.toString() || 'never';

    const check = validateVideoPayload(
      { name: fileName, size, mimeType, visibility },
      maxUploadBytes
    );
    if (check.error) {
      return NextResponse.json({ success: false, error: check.error }, { status: 400 });
    }

    const tierMaxChunks = Math.ceil(maxUploadBytes / VIDEO_UPLOAD_CHUNK_BYTES);
    const totalChunks = Math.ceil(size / VIDEO_UPLOAD_CHUNK_BYTES);
    const allowedChunks = Math.min(tierMaxChunks, MAX_CHUNKS_CAP);
    if (!Number.isFinite(totalChunks) || totalChunks < 1 || totalChunks > allowedChunks) {
      return NextResponse.json(
        { success: false, error: 'Invalid size or file too large for chunked upload.' },
        { status: 400 }
      );
    }

    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomBytes(24).toString('hex');
    const browserSessionId = await getBrowserSessionIdFromCookies();
    const root = chunkTempRoot();
    await mkdir(root, { recursive: true });
    const dir = path.join(root, sessionId);
    await mkdir(dir, { recursive: true });

    const manifest = {
      fileName,
      size,
      mimeType,
      visibility,
      linkTtl,
      ownerId: user.id,
      browserSessionId,
      maxUploadBytes,
      totalChunks,
      chunkSizeBytes: VIDEO_UPLOAD_CHUNK_BYTES,
      sessionToken,
      createdAt: Date.now(),
    };
    await writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest));

    await cleanupExpiredChunkSessions();

    return NextResponse.json({
      success: true,
      sessionId,
      sessionToken,
      chunkSizeBytes: VIDEO_UPLOAD_CHUNK_BYTES,
      totalChunks,
    });
  } catch (e) {
    console.error('chunked/start:', e);
    return NextResponse.json({ success: false, error: 'Could not start upload.' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
