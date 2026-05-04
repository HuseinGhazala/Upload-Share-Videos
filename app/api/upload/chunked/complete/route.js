import { NextResponse } from 'next/server';
import path from 'path';
import { readFile, rm } from 'fs/promises';
import { getClientIp, rateLimit } from '../../../../lib/rateLimit';
import { persistVideoBuffer } from '../../../../lib/completeVideoUpload';
import { chunkTempRoot } from '../../../../lib/chunkedUploadConfig';
import { cleanupExpiredChunkSessions } from '../../../../lib/chunkCleanup';
import {
  getAuthenticatedUploadContext,
  consumeUploadCreditAfterSuccessfulSave,
} from '../../../../lib/authSession';

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

    const { user, uploadAllowed } = await getAuthenticatedUploadContext();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول لإنهاء الرفع.' },
        { status: 401 }
      );
    }
    if (!uploadAllowed) {
      return NextResponse.json(
        { success: false, error: 'لا يوجد رصيد رفع لإكمال هذه العملية.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const sessionId = body.sessionId?.toString();
    const sessionToken = body.sessionToken?.toString();
    if (!sessionId || !sessionToken) {
      return NextResponse.json({ success: false, error: 'Missing session.' }, { status: 400 });
    }

    const dir = path.join(chunkTempRoot(), sessionId);
    let manifest;
    try {
      manifest = JSON.parse(await readFile(path.join(dir, 'manifest.json'), 'utf8'));
    } catch {
      return NextResponse.json({ success: false, error: 'Upload session not found or expired.' }, { status: 404 });
    }

    if (manifest.sessionToken !== sessionToken) {
      return NextResponse.json({ success: false, error: 'Invalid session.' }, { status: 403 });
    }

    if (!manifest.ownerId || manifest.ownerId !== user.id) {
      return NextResponse.json({ success: false, error: 'هذه الجلسة لا تخص حسابك.' }, { status: 403 });
    }

    const parts = [];
    for (let i = 0; i < manifest.totalChunks; i++) {
      try {
        parts.push(await readFile(path.join(dir, `part-${i}`)));
      } catch {
        return NextResponse.json(
          { success: false, error: `Missing chunk ${i}. Upload all parts first.` },
          { status: 400 }
        );
      }
    }

    const buffer = Buffer.concat(parts);
    if (buffer.length !== manifest.size) {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
      return NextResponse.json(
        { success: false, error: 'Reassembled size does not match. Please try again.' },
        { status: 400 }
      );
    }

    const video = await persistVideoBuffer(buffer, {
      name: manifest.fileName,
      size: manifest.size,
      mimeType: manifest.mimeType,
      visibility: manifest.visibility,
      ownerId: manifest.ownerId,
      maxVideoBytes: manifest.maxUploadBytes,
    });

    const consumed = await consumeUploadCreditAfterSuccessfulSave();
    if (!consumed.ok) {
      console.error('Chunked upload saved but credit consume failed:', consumed.error);
    }

    await rm(dir, { recursive: true, force: true });
    await cleanupExpiredChunkSessions();

    return NextResponse.json({
      success: true,
      video,
      ...(consumed.ok ? {} : { creditWarning: true }),
    });
  } catch (e) {
    console.error('chunked/complete:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Could not finalize upload.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
