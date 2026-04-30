import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { addVideo } from '../../lib/videoStore';
import { getClientIp, rateLimit } from '../../lib/rateLimit';
import { uploadVideoToGitHub } from '../../lib/githubUpload';
import {
  getOptimizedVideoUrl,
  getThumbnailUrl,
  uploadToCloudinary,
} from '../../lib/cloudinary';
import { visibilitySchema } from '../../lib/validation';
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    // #region agent log
    fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H1',location:'app/api/upload/route.js:19',message:'video upload request received',data:{ipMasked:ip ? 'present' : 'missing'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H2',location:'app/api/upload/route.js:32',message:'video upload payload validated',data:{hasFile:Boolean(file),type:file?.type || 'none',size:file?.size || 0,visibility:visibilityInput},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

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
      sourceUrl: '',
      thumbnailUrl: '',
      public_id: '',
      accessToken: crypto.randomBytes(16).toString('hex'),
    };

    // Try Cloudinary first
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const result = await uploadToCloudinary(buffer, {
          public_id: `video_${Date.now()}`,
          eager: [
            {
              quality: 'auto:good',
              fetch_format: 'mp4',
              video_codec: 'auto',
            },
          ],
        });
        const savedVideo = await addVideo({
          ...baseVideo,
          source: 'cloudinary',
          public_id: result.public_id,
          sourceUrl: getOptimizedVideoUrl(result.public_id),
          url: `/api/videos/${baseVideo.id}/stream`,
          thumbnailUrl: getThumbnailUrl(result.public_id),
        });
        // #region agent log
        fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H3',location:'app/api/upload/route.js:98',message:'video uploaded to cloudinary',data:{source:'cloudinary',videoId:savedVideo.id},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return NextResponse.json({ success: true, video: savedVideo });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed, falling back to local:', cloudinaryError);
        // #region agent log
        fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H3',location:'app/api/upload/route.js:102',message:'video cloudinary fallback triggered',data:{errorName:cloudinaryError?.name || 'unknown',httpCode:cloudinaryError?.http_code || null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      }
    }

    // Fallback: save locally
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
          sourceUrl: githubResult.sourceUrl,
          url: `/api/videos/${baseVideo.id}/stream`,
          thumbnailUrl: '',
        });
        return NextResponse.json({ success: true, video: savedVideo });
      }
    } catch (githubError) {
      console.error('GitHub upload failed, falling back to local:', githubError);
    }

    // Last fallback: save locally
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const filename = `video_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);
    const savedVideo = await addVideo({
      ...baseVideo,
      public_id: filename,
      source: 'local',
      sourceUrl: `/uploads/${filename}`,
      url: `/api/videos/${baseVideo.id}/stream`,
      thumbnailUrl: '',
    });
    // #region agent log
    fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H3',location:'app/api/upload/route.js:122',message:'video stored locally',data:{source:'local',videoId:savedVideo.id},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    return NextResponse.json({ success: true, video: savedVideo });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
