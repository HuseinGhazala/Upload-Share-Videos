import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { addVideo } from '../../lib/videoStore';
import { getClientIp, rateLimit } from '../../lib/rateLimit';
import { isGitHubUploadConfigured, uploadVideoToGitHub } from '../../lib/githubUpload';
import { visibilitySchema } from '../../lib/validation';
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

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

    const formData = await request.formData();
    const file = formData.get('video');
    const visibilityInput = formData.get('visibility')?.toString() || 'public';
    const visibilityResult = visibilitySchema.safeParse(visibilityInput);

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    if (!visibilityResult.success) {
      return NextResponse.json({ success: false, error: 'Invalid visibility value.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: mp4, webm, mov' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Max size is 50MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const baseVideo = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      visibility: visibilityResult.data,
      views: 0,
      source: 'local',
      url: '',
      rawUrl: '',
      sourceUrl: '',
      thumbnailUrl: '',
      public_id: '',
      accessToken: crypto.randomBytes(16).toString('hex'),
    };

    // GitHub when configured, otherwise local disk
    if (isGitHubUploadConfigured()) {
      try {
        const githubResult = await uploadVideoToGitHub(buffer, {
          originalName: file.name,
          mimeType: file.type,
        });
        if (githubResult) {
          const savedVideo = await addVideo({
            ...baseVideo,
            public_id: githubResult.publicId,
            source: 'github',
            rawUrl: githubResult.sourceUrl,
            sourceUrl: githubResult.sourceUrl,
            ghOwner: githubResult.owner,
            ghRepo: githubResult.repo,
            ghBranch: githubResult.branch,
            url: `/api/videos/${baseVideo.id}/stream`,
            thumbnailUrl: '',
          });
          return NextResponse.json({ success: true, video: savedVideo });
        }
      } catch (githubError) {
        console.error('GitHub upload failed, falling back to local:', githubError);
      }
    }

    // Local fallback
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const filename = `video_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);
    const savedVideo = await addVideo({
      ...baseVideo,
      public_id: filename,
      source: 'local',
      rawUrl: `/uploads/${filename}`,
      sourceUrl: `/uploads/${filename}`,
      url: `/api/videos/${baseVideo.id}/stream`,
      thumbnailUrl: '',
    });

    return NextResponse.json({ success: true, video: savedVideo });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
