import { NextResponse } from 'next/server';
import { getAllVideos } from '../../lib/videoStore';
import { getClientIp, rateLimit } from '../../lib/rateLimit';
import { getOptionalAuthUser } from '../../lib/authSession';

export async function GET(request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`stats:${ip}`, { max: 30, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 });
  }

  const url = new URL(request.url);
  const mine = url.searchParams.get('mine') === '1' || url.searchParams.get('mine') === 'true';

  let videos = await getAllVideos();

  if (mine) {
    const user = await getOptionalAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'يجب تسجيل الدخول لعرض الإحصائيات الخاصة بك.' },
        { status: 401 }
      );
    }
    videos = videos.filter((v) => v.ownerId === user.id);
  }
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

  return NextResponse.json({
    success: true,
    stats: {
      totalVideos,
      totalViews,
      totalSizeMb: Number(totalSizeMb.toFixed(2)),
      byVisibility,
    },
  });
}
