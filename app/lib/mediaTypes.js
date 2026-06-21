export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export const ALLOWED_MEDIA_TYPES = [...ALLOWED_VIDEO_TYPES, ...ALLOWED_IMAGE_TYPES];

export function getMediaKind(mimeType) {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video';
  return null;
}

export function isImageMedia(item) {
  if (!item) return false;
  if (item.mediaKind === 'image') return true;
  return ALLOWED_IMAGE_TYPES.includes(item.mimeType);
}

export function isVideoMedia(item) {
  if (!item) return false;
  if (item.mediaKind === 'video') return true;
  return ALLOWED_VIDEO_TYPES.includes(item.mimeType);
}

export const MEDIA_ACCEPT =
  'video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.svg';

export const MEDIA_FORMATS_AR = 'MP4 أو WebM أو MOV أو JPG أو PNG أو WebP أو GIF أو SVG';

const EXT_TO_MIME = {
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};

/** بعض المتصفحات لا تُرسل MIME صحيحاً (خصوصاً SVG) — نستنتجه من الامتداد. */
export function resolveMediaMimeType(name, mimeType) {
  const normalized = (mimeType || '').toLowerCase().trim();
  if (normalized && normalized !== 'application/octet-stream' && getMediaKind(normalized)) {
    return normalized;
  }
  const ext = (name || '').split('.').pop()?.toLowerCase();
  return ext && EXT_TO_MIME[ext] ? EXT_TO_MIME[ext] : normalized;
}

export function isAllowedMediaFile(name, mimeType) {
  return Boolean(getMediaKind(resolveMediaMimeType(name, mimeType)));
}
