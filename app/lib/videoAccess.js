import { isImageMedia } from './mediaTypes';
import { isShareAccessExpired } from './linkTtl';

function isOwnerAccess(video, { browserSessionId, userId } = {}) {
  if (browserSessionId && video.browserSessionId === browserSessionId) return true;
  if (userId && video.ownerId && video.ownerId === userId) return true;
  return false;
}

/**
 * يحدّد إن كان الطلب مسموحاً بمشاهدة الفيديو.
 * انتهاء الرابط يمنع الوصول عبر accessToken فقط — المالك يرى ملفاته في جلسته.
 */
export function canAccessVideo(video, { accessToken, browserSessionId, userId } = {}) {
  if (isOwnerAccess(video, { browserSessionId, userId })) return true;
  if (accessToken && accessToken === video.accessToken) {
    if (isShareAccessExpired(video)) return false;
    return true;
  }
  return false;
}

/** يتحقّق من ملكية جلسة الرفع المجزّأ (يمنع تداخل الضيوف). */
export function verifyChunkUploadOwnership(manifest, { user, browserSessionId } = {}) {
  if (user?.isGuest) {
    return Boolean(manifest.browserSessionId && manifest.browserSessionId === browserSessionId);
  }
  return Boolean(manifest.ownerId && user?.id && manifest.ownerId === user.id);
}

/** يُرجع فيديوهات الجلسة الحالية فقط (أو فيديوهات المستخدم المسجّل). */
export function filterVideosBySession(videos, { browserSessionId, userId, mine } = {}) {
  if (mine && userId) {
    return videos.filter((v) => v.ownerId === userId);
  }
  if (!browserSessionId) return [];
  return videos.filter((v) => v.browserSessionId === browserSessionId);
}

export function filterVideosByMediaKind(videos, mediaKind) {
  if (mediaKind === 'image') return videos.filter((v) => isImageMedia(v));
  if (mediaKind === 'video') return videos.filter((v) => !isImageMedia(v));
  return videos;
}

export function countByMediaKind(videos) {
  let video = 0;
  let image = 0;
  for (const item of videos) {
    if (isImageMedia(item)) image += 1;
    else video += 1;
  }
  return { video, image, total: videos.length };
}
