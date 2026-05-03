import { NextResponse } from 'next/server';
import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { getClientIp, rateLimit } from '../../../../lib/rateLimit';
import { chunkTempRoot } from '../../../../lib/chunkedUploadConfig';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`chunk:${ip}`, { max: 400, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many chunk requests. Slow down or try again soon.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const sessionId = formData.get('sessionId')?.toString();
    const sessionToken = formData.get('sessionToken')?.toString();
    const indexRaw = formData.get('index')?.toString();
    const part = formData.get('part');

    if (!sessionId || !sessionToken || indexRaw == null || !part) {
      return NextResponse.json({ success: false, error: 'Missing chunk fields.' }, { status: 400 });
    }

    const index = parseInt(indexRaw, 10);
    if (Number.isNaN(index) || index < 0) {
      return NextResponse.json({ success: false, error: 'Invalid chunk index.' }, { status: 400 });
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

    if (index >= manifest.totalChunks) {
      return NextResponse.json({ success: false, error: 'Chunk index out of range.' }, { status: 400 });
    }

    const bytes = await part.arrayBuffer();
    const buf = Buffer.from(bytes);
    const maxPart = manifest.chunkSizeBytes + 1024;
    if (buf.length > maxPart) {
      return NextResponse.json({ success: false, error: 'Chunk too large.' }, { status: 400 });
    }

    await writeFile(path.join(dir, `part-${index}`), buf);

    return NextResponse.json({
      success: true,
      received: index + 1,
      total: manifest.totalChunks,
    });
  } catch (e) {
    console.error('chunked/part:', e);
    return NextResponse.json({ success: false, error: 'Chunk upload failed.' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
