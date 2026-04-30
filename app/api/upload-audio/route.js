import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import cloudinary, { uploadToCloudinary } from '../../lib/cloudinary';
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
    // #region agent log
    fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H5',location:'app/api/upload-audio/route.js:26',message:'audio upload payload received',data:{hasFile:Boolean(file),type:file?.type || 'none',size:file?.size || 0},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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

    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const publicId = `audio_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const uploadResult = await uploadToCloudinary(buffer, {
        resource_type: isVideoInput ? 'video' : 'video',
        public_id: publicId,
        folder: 'audio-uploads',
      });

      const audioUrl = cloudinary.url(uploadResult.public_id, {
        resource_type: 'video',
        format: 'mp3',
      });

      return NextResponse.json({
        success: true,
        item: {
          id: crypto.randomUUID(),
          type: 'audio',
          source: 'cloudinary',
          url: audioUrl,
          public_id: uploadResult.public_id,
          fromVideo: isVideoInput,
          name: file.name,
          size: file.size,
        },
      });
    }

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
        fromVideo: false,
        name: file.name,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    // #region agent log
    fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H5',location:'app/api/upload-audio/route.js:95',message:'audio upload failed',data:{errorName:error?.name || 'unknown',errorMessage:error?.message || 'unknown'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return NextResponse.json({ success: false, error: 'Audio upload failed.' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
