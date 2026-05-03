import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import cloudinary, { getOptimizedVideoUrl, getThumbnailUrl } from '../../../lib/cloudinary';
import { addVideo } from '../../../lib/videoStore';
import { getClientIp, rateLimit } from '../../../lib/rateLimit';
import { visibilitySchema } from '../../../lib/validation';

const MAX_SIZE = 50 * 1024 * 1024;

const bodySchema = z.object({
  public_id: z.string().min(1),
  visibility: visibilitySchema,
  name: z.string().min(1).max(500),
  size: z.number().int().positive().max(MAX_SIZE),
  mimeType: z.enum(['video/mp4', 'video/webm', 'video/quicktime']),
});

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

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid payload.' }, { status: 400 });
    }

    const { public_id, visibility, name, size, mimeType } = parsed.data;

    try {
      await cloudinary.api.resource(public_id, { resource_type: 'video' });
    } catch (e) {
      console.error('register-cloudinary verify:', e);
      return NextResponse.json(
        {
          success: false,
          error:
            'Could not verify the upload in Cloudinary. Wait a moment and try registering again, or re-upload.',
        },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const baseVideo = {
      id,
      name,
      size,
      mimeType,
      uploadedAt: new Date().toISOString(),
      visibility,
      views: 0,
      source: 'cloudinary',
      public_id,
      rawUrl: getOptimizedVideoUrl(public_id),
      sourceUrl: getOptimizedVideoUrl(public_id),
      url: `/api/videos/${id}/stream`,
      thumbnailUrl: getThumbnailUrl(public_id),
      accessToken: crypto.randomBytes(16).toString('hex'),
    };

    const savedVideo = await addVideo(baseVideo);
    return NextResponse.json({ success: true, video: savedVideo });
  } catch (error) {
    console.error('register-cloudinary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
