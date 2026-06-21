import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '../../../../lib/rateLimit';
import { getVideoById, updateVideo } from '../../../../lib/videoStore';
import { getBrowserSessionIdFromCookies } from '../../../../lib/browserSession';
import { getOptionalAuthUser } from '../../../../lib/authSession';
import { canAccessVideo } from '../../../../lib/videoAccess';

const viewMemory = new Map();
const MAX_VIEW_LOG = 20;

function hashViewer(ip, userAgent) {
  const salt = process.env.VIEW_HASH_SALT || 'view-salt';
  return crypto
    .createHash('sha256')
    .update(`${salt}:${ip}:${(userAgent || '').slice(0, 80)}`)
    .digest('hex')
    .slice(0, 10);
}

export async function POST(request, props) {
  const params = await props.params;
  const ip = getClientIp(request);
  const limited = rateLimit(`view:${ip}`, { max: 120, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 });
  }

  const video = await getVideoById(params.id);
  if (!video) {
    return NextResponse.json({ success: false, error: 'Video not found.' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');
  const browserSessionId = await getBrowserSessionIdFromCookies();
  const user = await getOptionalAuthUser();

  if (!canAccessVideo(video, { accessToken, browserSessionId, userId: user?.id })) {
    return NextResponse.json({ success: false, error: 'Unauthorized access.' }, { status: 403 });
  }

  const key = `${video.id}:${ip}`;
  const now = Date.now();
  const lastSeen = viewMemory.get(key);
  if (lastSeen && now - lastSeen < 30_000) {
    return NextResponse.json({
      success: true,
      views: video.views,
      lastViewedAt: video.lastViewedAt,
    });
  }
  viewMemory.set(key, now);

  const ua = request.headers.get('user-agent') || '';
  const viewerHash = hashViewer(ip, ua);
  const viewedAt = new Date().toISOString();

  const updated = await updateVideo(video.id, (v) => {
    const log = Array.isArray(v.viewLog) ? [...v.viewLog] : [];
    log.unshift({ at: viewedAt, viewerHash });
    return {
      ...v,
      views: (v.views || 0) + 1,
      lastViewedAt: viewedAt,
      viewLog: log.slice(0, MAX_VIEW_LOG),
    };
  });

  return NextResponse.json({
    success: true,
    views: updated?.views || video.views,
    lastViewedAt: updated?.lastViewedAt || viewedAt,
  });
}
