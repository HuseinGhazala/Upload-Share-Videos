import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getClientIp, rateLimit } from '../../lib/rateLimit';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`upload-image:${ip}`, { max: 20, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json({ success: false, error: 'Too many image uploads.' }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('image');
    if (!file) {
      return NextResponse.json({ success: false, error: 'No image provided.' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image type. Allowed: jpg, png, webp.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ success: false, error: 'Image too large. Max 15MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg';

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');
    await mkdir(uploadsDir, { recursive: true });
    const filename = `image_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      item: {
        id: crypto.randomUUID(),
        type: 'image',
        source: 'local',
        url: `/uploads/images/${filename}`,
        public_id: filename,
        name: file.name,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ success: false, error: 'Image upload failed.' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
