import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getClientIp, rateLimit } from '../../lib/rateLimit';
import { uploadToCloudinary } from '../../lib/cloudinary';

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
    // #region agent log
    fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H4',location:'app/api/upload-image/route.js:21',message:'image upload payload received',data:{hasFile:Boolean(file),type:file?.type || 'none',size:file?.size || 0},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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

    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const publicId = `image_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const result = await uploadToCloudinary(buffer, {
          resource_type: 'image',
          public_id: publicId,
          folder: 'image-uploads',
        });

        return NextResponse.json({
          success: true,
          item: {
            id: crypto.randomUUID(),
            type: 'image',
            source: 'cloudinary',
            url: result.secure_url,
            public_id: result.public_id,
            name: file.name,
            size: file.size,
          },
        });
      } catch (err) {
        console.error('Cloudinary image upload failed, fallback local:', err);
        // #region agent log
        fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H4',location:'app/api/upload-image/route.js:67',message:'image cloudinary fallback triggered',data:{errorName:err?.name || 'unknown',httpCode:err?.http_code || null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      }
    }

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
