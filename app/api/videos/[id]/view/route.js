import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '../../../../lib/rateLimit';
import { getVideoById, updateVideo } from '../../../../lib/videoStore';
import { getBrowserSessionIdFromCookies } from '../../../../lib/browserSession';
import { getOptionalAuthUser } from '../../../../lib/authSession';
import { canAccessVideo } from '../../../../lib/videoAccess';

const viewMemory = new Map();

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
    return NextResponse.json({ success: true, views: video.views });
  }
  viewMemory.set(key, now);

  const updated = await updateVideo(video.id, (v) => ({
    ...v,
    views: (v.views || 0) + 1,
  }));

  return NextResponse.json({ success: true, views: updated?.views || video.views });
}
