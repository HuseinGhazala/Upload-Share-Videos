import { NextResponse } from 'next/server';
import { getVideoById } from '../../../../lib/videoStore';
import { getBrowserSessionIdFromCookies } from '../../../../lib/browserSession';
import { getOptionalAuthUser } from '../../../../lib/authSession';
import { canAccessVideo } from '../../../../lib/videoAccess';

export async function GET(request, { params }) {
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

  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  if (video.sourceUrl.startsWith('http')) {
    const absolute = new URL(video.sourceUrl);
    if (absolute.hostname === '0.0.0.0' && forwardedHost) {
      absolute.host = forwardedHost;
      absolute.protocol = `${forwardedProto}:`;
      return NextResponse.redirect(absolute.toString(), 307);
    }
    return NextResponse.redirect(video.sourceUrl, 307);
  }

  if (forwardedHost) {
    return NextResponse.redirect(`${forwardedProto}://${forwardedHost}${video.sourceUrl}`, 307);
  }

  return NextResponse.redirect(new URL(video.sourceUrl, request.url), 307);
}
