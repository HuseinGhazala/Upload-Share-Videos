import { NextResponse } from 'next/server';
import crypto from 'crypto';
import cloudinary from '../../../lib/cloudinary';
import { getClientIp, rateLimit } from '../../../lib/rateLimit';

const FOLDER = 'video-uploads';

function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Returns signed upload fields so the browser can POST the video directly to Cloudinary,
 * bypassing shared-hosting body/time limits (fixes gateway 503 on large uploads).
 */
export async function POST(request) {
  try {
    if (!cloudinaryConfigured()) {
      return NextResponse.json({ enabled: false });
    }

    const ip = getClientIp(request);
    const limited = rateLimit(`upload:${ip}`, { max: 10, windowMs: 60_000 });
    if (!limited.allowed) {
      return NextResponse.json(
        { enabled: false, error: 'Too many upload requests. Try again in a minute.' },
        { status: 429 }
      );
    }

    const publicId = `v_${crypto.randomBytes(16).toString('hex')}`;
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = {
      timestamp,
      folder: FOLDER,
      public_id: publicId,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      enabled: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder: FOLDER,
      publicId,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });
  } catch (e) {
    console.error('cloudinary-params:', e);
    return NextResponse.json({ enabled: false, error: 'Could not prepare upload.' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
