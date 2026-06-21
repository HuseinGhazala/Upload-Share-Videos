/**
 * يحدّد إن كان الطلب مسموحاً بمشاهدة الفيديو.
 * لا توجد مكتبة عامة — الوصول عبر جلسة المتصفّح أو رابط مشاركة (accessToken).
 */
export function canAccessVideo(video, { accessToken, browserSessionId, userId } = {}) {
  if (accessToken && accessToken === video.accessToken) return true;
  if (browserSessionId && video.browserSessionId === browserSessionId) return true;
  if (userId && video.ownerId && video.ownerId === userId) return true;
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
