import { NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { getClientIp, rateLimit } from '../../../../lib/rateLimit';
import { validateVideoPayload } from '../../../../lib/completeVideoUpload';
import { chunkTempRoot } from '../../../../lib/chunkedUploadConfig';
import { VIDEO_UPLOAD_CHUNK_BYTES } from '../../../../lib/uploadChunkSize';
import { cleanupExpiredChunkSessions } from '../../../../lib/chunkCleanup';

const MAX_CHUNKS = 120; // 50MB / 512KB ≈ 100

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

    const body = await request.json();
    const fileName = body.fileName?.toString() || '';
    const size = Number(body.size);
    const mimeType = body.mimeType?.toString() || '';
    const visibility = body.visibility?.toString() || 'public';

    const check = validateVideoPayload({ name: fileName, size, mimeType, visibility });
    if (check.error) {
      return NextResponse.json({ success: false, error: check.error }, { status: 400 });
    }

    const totalChunks = Math.ceil(size / VIDEO_UPLOAD_CHUNK_BYTES);
    if (!Number.isFinite(totalChunks) || totalChunks < 1 || totalChunks > MAX_CHUNKS) {
      return NextResponse.json(
        { success: false, error: 'Invalid size or file too large for chunked upload.' },
        { status: 400 }
      );
    }

    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomBytes(24).toString('hex');
    const root = chunkTempRoot();
    await mkdir(root, { recursive: true });
    const dir = path.join(root, sessionId);
    await mkdir(dir, { recursive: true });

    const manifest = {
      fileName,
      size,
      mimeType,
      visibility,
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
