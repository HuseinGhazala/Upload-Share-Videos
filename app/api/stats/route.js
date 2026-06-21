import { NextResponse } from 'next/server';
import { getAllVideos } from '../../lib/videoStore';
import { getClientIp, rateLimit } from '../../lib/rateLimit';
import { getOptionalAuthUser } from '../../lib/authSession';
import { getBrowserSessionIdFromCookies } from '../../lib/browserSession';
import { filterVideosBySession, countByMediaKind } from '../../lib/videoAccess';
import { isImageMedia } from '../../lib/mediaTypes';

export async function GET(request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`stats:${ip}`, { max: 30, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 });
  }

  const url = new URL(request.url);
  const mine = url.searchParams.get('mine') === '1' || url.searchParams.get('mine') === 'true';
  const browserSessionId = await getBrowserSessionIdFromCookies();
  const user = mine ? await getOptionalAuthUser() : null;

  if (mine && !user) {
    return NextResponse.json(
      { success: false, error: 'يجب تسجيل الدخول لعرض الإحصائيات الخاصة بك.' },
      { status: 401 }
    );
  }

  let videos = await getAllVideos();
  videos = filterVideosBySession(videos, {
    browserSessionId,
    userId: user?.id,
    mine,
  });

  const { video: totalVideoFiles, image: totalImageFiles } = countByMediaKind(videos);
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalSizeMb = videos.reduce((sum, item) => sum + (item.size || 0), 0) / (1024 * 1024);

  const byVisibility = videos.reduce(
    (acc, item) => {
      acc[item.visibility] = (acc[item.visibility] || 0) + 1;
      return acc;
    },
    { public: 0, private: 0, unlisted: 0 }
  );

  const recentViews = videos
    .filter((v) => v.lastViewedAt)
    .sort((a, b) => new Date(b.lastViewedAt) - new Date(a.lastViewedAt))
    .slice(0, 5)
    .map((v) => ({
      id: v.id,
      name: v.name,
      mediaKind: isImageMedia(v) ? 'image' : 'video',
      views: v.views || 0,
      lastViewedAt: v.lastViewedAt,
    }));

  return NextResponse.json({
    success: true,
    stats: {
      totalVideos,
      totalVideoFiles,
      totalImageFiles,
      totalViews,
      totalSizeMb: Number(totalSizeMb.toFixed(2)),
      byVisibility,
      recentViews,
    },
  });
}
