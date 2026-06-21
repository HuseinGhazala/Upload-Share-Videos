import path from 'path';
import crypto from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { addVideo } from './videoStore';
import { isGitHubUploadConfigured, uploadVideoToGitHub } from './githubUpload';
import { visibilitySchema } from './validation';
import { FREE_MAX_VIDEO_BYTES } from './subscription';
import {
  ALLOWED_VIDEO_TYPES,
  getMediaKind,
  resolveMediaMimeType,
} from './mediaTypes';

export { ALLOWED_VIDEO_TYPES } from './mediaTypes';

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
  const resolvedMimeType = resolveMediaMimeType(name, mimeType);
  const mediaKind = getMediaKind(resolvedMimeType);
  if (!mediaKind) {
    return { error: 'نوع الملف غير مدعوم. المسموح: mp4، webm، mov، jpg، png، webp، gif، svg' };
  }
  if (size > maxVideoBytes) {
    const mb = Math.round(maxVideoBytes / (1024 * 1024));
    return { error: `الملف يتجاوز الحد المسموح لباقتك (${mb} ميجابايت).` };
  }
  return { visibility: visibilityResult.data, mediaKind, mimeType: resolvedMimeType };
}

/**
 * GitHub if configured, else local `public/uploads`. Caller validates payload first.
 */
export async function persistVideoBuffer(
  buffer,
  { name, size, mimeType, visibility, ownerId, browserSessionId, maxVideoBytes }
) {
  const check = validateVideoPayload({ name, size, mimeType, visibility }, maxVideoBytes ?? MAX_VIDEO_SIZE);
  if (check.error) {
    throw new Error(check.error);
  }
  const visibilityData = check.visibility;
  const mediaKind = check.mediaKind;
  const resolvedMimeType = check.mimeType ?? mimeType;

  const baseVideo = {
    id: crypto.randomUUID(),
    name,
    size,
    mimeType: resolvedMimeType,
    mediaKind,
    uploadedAt: new Date().toISOString(),
    visibility: visibilityData,
    views: 0,
    ownerId: ownerId || null,
    browserSessionId: browserSessionId || null,
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
        mimeType: resolvedMimeType,
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
  const filename = `media_${Date.now()}_${name.replace(/\s+/g, '_')}`;
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
