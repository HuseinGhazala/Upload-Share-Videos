export function buildWatchPath(id, accessToken) {
  const query = accessToken ? `?accessToken=${encodeURIComponent(accessToken)}` : '';
  return `/v/${id}${query}`;
}

export function buildShareUrl(id, accessToken, origin) {
  const path = buildWatchPath(id, accessToken);
  if (!origin) return path;
  return `${origin.replace(/\/$/, '')}${path}`;
}
