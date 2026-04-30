import { NextResponse } from 'next/server';
import { getAllVideos } from '../../lib/videoStore';
import { getClientIp, rateLimit } from '../../lib/rateLimit';
import { paginationSchema } from '../../lib/validation';

function canAccess(video, accessToken) {
  if (video.visibility === 'public') return true;
  return accessToken && accessToken === video.accessToken;
}

export async function GET(request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`videos:${ip}`, { max: 60, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 });
  }

  const url = new URL(request.url);
  const parseResult = paginationSchema.safeParse({
    page: url.searchParams.get('page') ?? 1,
    limit: url.searchParams.get('limit') ?? 6,
    visibility: url.searchParams.get('visibility') ?? undefined,
    accessToken: url.searchParams.get('accessToken') ?? undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json({ success: false, error: 'Invalid query params.' }, { status: 400 });
  }

  const { page, limit, visibility, accessToken } = parseResult.data;
  let videos = await getAllVideos();
  if (visibility) videos = videos.filter((v) => v.visibility === visibility);
  videos = videos.filter((v) => canAccess(v, accessToken));

  const total = videos.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const items = videos.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    items,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  });
}
