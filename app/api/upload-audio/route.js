import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getClientIp, rateLimit } from '../../lib/rateLimit';

const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm'];
const ALLOWED_VIDEO_FOR_AUDIO = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_AUDIO_SIZE = 50 * 1024 * 1024;

function isAllowed(type) {
  return ALLOWED_AUDIO_TYPES.includes(type) || ALLOWED_VIDEO_FOR_AUDIO.includes(type);
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`upload-audio:${ip}`, { max: 20, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json({ success: false, error: 'Too many audio requests.' }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('audio');
    if (!file) {
      return NextResponse.json({ success: false, error: 'No audio/video file provided.' }, { status: 400 });
    }

    if (!isAllowed(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type for audio upload.' }, { status: 400 });
    }

    if (file.size > MAX_AUDIO_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large. Max 50MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const isVideoInput = ALLOWED_VIDEO_FOR_AUDIO.includes(file.type);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
    await mkdir(uploadsDir, { recursive: true });
    const extension = file.type.includes('wav') ? 'wav' : file.type.includes('ogg') ? 'ogg' : 'mp3';
    const filename = `audio_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;
    await writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({
      success: true,
      item: {
        id: crypto.randomUUID(),
        type: 'audio',
        source: 'local',
        url: `/uploads/audio/${filename}`,
        public_id: filename,
        fromVideo: isVideoInput,
        name: file.name,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json({ success: false, error: 'Audio upload failed.' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
