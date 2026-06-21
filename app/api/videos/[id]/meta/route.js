import { NextResponse } from 'next/server';
import { getVideoById } from '../../../../lib/videoStore';
import { getClientIp, rateLimit } from '../../../../lib/rateLimit';
import { getBrowserSessionIdFromCookies } from '../../../../lib/browserSession';
import { getOptionalAuthUser } from '../../../../lib/authSession';
import { canAccessVideo } from '../../../../lib/videoAccess';
import { isShareAccessExpired } from '../../../../lib/linkTtl';
import { isImageMedia } from '../../../../lib/mediaTypes';
import { buildWatchPath } from '../../../../lib/shareLinks';

export async function GET(request, props) {
  const params = await props.params;
  const ip = getClientIp(request);
  const limited = rateLimit(`meta:${ip}`, { max: 90, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 });
  }

  const video = await getVideoById(params.id);
  if (!video) {
    return NextResponse.json({ success: false, error: 'Not found.' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');
  const browserSessionId = await getBrowserSessionIdFromCookies();
  const user = await getOptionalAuthUser();

  if (!canAccessVideo(video, { accessToken, browserSessionId, userId: user?.id })) {
    if (isShareAccessExpired(video) && accessToken === video.accessToken) {
      return NextResponse.json({ success: false, error: 'انتهت صلاحية رابط المشاركة.' }, { status: 410 });
    }
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
  }

  const isOwner =
    (browserSessionId && video.browserSessionId === browserSessionId) ||
    (user?.id && video.ownerId === user.id);

  return NextResponse.json({
    success: true,
    item: {
      id: video.id,
      name: video.name,
      mimeType: video.mimeType,
      mediaKind: isImageMedia(video) ? 'image' : 'video',
      streamUrl: video.url,
      views: video.views || 0,
      uploadedAt: video.uploadedAt,
      expiresAt: video.expiresAt || null,
      linkTtl: video.linkTtl || 'never',
      lastViewedAt: video.lastViewedAt || null,
      watchPath: buildWatchPath(video.id, video.accessToken),
      viewLog: isOwner ? (video.viewLog || []).slice(0, 10) : undefined,
    },
  });
}
