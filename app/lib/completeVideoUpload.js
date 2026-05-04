import path from 'path';
import crypto from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { addVideo } from './videoStore';
import { isGitHubUploadConfigured, uploadVideoToGitHub } from './githubUpload';
import { visibilitySchema } from './validation';
import { FREE_MAX_VIDEO_BYTES } from './subscription';

export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
/** Legacy default max (matches free tier). */
export const MAX_VIDEO_SIZE = FREE_MAX_VIDEO_BYTES;

export function validateVideoPayload({ name, size, mimeType, visibility }, maxVideoBytes = MAX_VIDEO_SIZE) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { error: 'اسم الملف غير صالح.' };
  }
  const visibilityResult = visibilitySchema.safeParse(visibility);
  if (!visibilityResult.success) {
    return { error: 'إعداد «الظهور» غير صالح.' };
  }
  if (!ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    return { error: 'نوع الملف غير مدعوم. المسموح: mp4، webm، mov' };
  }
  if (size > maxVideoBytes) {
    const mb = Math.round(maxVideoBytes / (1024 * 1024));
    return { error: `الملف يتجاوز الحد المسموح لباقتك (${mb} ميجابايت).` };
  }
  return { visibility: visibilityResult.data };
}

/**
 * GitHub if configured, else local `public/uploads`. Caller validates payload first.
 */
export async function persistVideoBuffer(
  buffer,
  { name, size, mimeType, visibility, ownerId, maxVideoBytes }
) {
  const check = validateVideoPayload({ name, size, mimeType, visibility }, maxVideoBytes ?? MAX_VIDEO_SIZE);
  if (check.error) {
    throw new Error(check.error);
  }
  const visibilityData = check.visibility;

  const baseVideo = {
    id: crypto.randomUUID(),
    name,
    size,
    mimeType,
    uploadedAt: new Date().toISOString(),
    visibility: visibilityData,
    views: 0,
    ownerId: ownerId || null,
    source: 'local',
    url: '',
    rawUrl: '',
    sourceUrl: '',
    thumbnailUrl: '',
    public_id: '',
    accessToken: crypto.randomBytes(16).toString('hex'),
  };

  if (isGitHubUploadConfigured()) {
    try {
      const githubResult = await uploadVideoToGitHub(buffer, {
        originalName: name,
        mimeType,
      });
      if (githubResult) {
        return await addVideo({
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
      }
    } catch (e) {
      console.error('GitHub upload failed, falling back to local:', e);
    }
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  const filename = `video_${Date.now()}_${name.replace(/\s+/g, '_')}`;
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  return await addVideo({
    ...baseVideo,
    public_id: filename,
    source: 'local',
    rawUrl: `/uploads/${filename}`,
    sourceUrl: `/uploads/${filename}`,
    url: `/api/videos/${baseVideo.id}/stream`,
    thumbnailUrl: '',
  });
}
