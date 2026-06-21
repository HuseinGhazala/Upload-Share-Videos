export const LINK_TTL_OPTIONS = [
  { value: 'hour', labelAr: 'ساعة واحدة' },
  { value: 'day', labelAr: 'يوم واحد' },
  { value: 'week', labelAr: 'أسبوع' },
  { value: 'never', labelAr: 'بدون انتهاء' },
];

const TTL_MS = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
};

export function computeExpiresAt(linkTtl) {
  if (!linkTtl || linkTtl === 'never') return null;
  const ms = TTL_MS[linkTtl];
  if (!ms) return null;
  return new Date(Date.now() + ms).toISOString();
}

export function isLinkExpired(video) {
  if (!video?.expiresAt) return false;
  return Date.now() > new Date(video.expiresAt).getTime();
}

export function isShareAccessExpired(video) {
  return isLinkExpired(video);
}
