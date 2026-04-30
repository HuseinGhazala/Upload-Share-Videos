import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '../../../../lib/rateLimit';
import { getVideoById, updateVideo } from '../../../../lib/videoStore';

const viewMemory = new Map();

function canAccess(video, token) {
  if (video.visibility === 'public') return true;
  return token && token === video.accessToken;
}

export async function POST(request, { params }) {
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
  if (!canAccess(video, accessToken)) {
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
