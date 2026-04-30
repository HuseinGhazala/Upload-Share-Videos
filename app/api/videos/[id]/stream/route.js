import { NextResponse } from 'next/server';
import { getVideoById } from '../../../../lib/videoStore';

function canAccess(video, token) {
  if (video.visibility === 'public') return true;
  return token && token === video.accessToken;
}

export async function GET(request, { params }) {
  const video = await getVideoById(params.id);
  if (!video) {
    return NextResponse.json({ success: false, error: 'Video not found.' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');
  if (!canAccess(video, accessToken)) {
    return NextResponse.json({ success: false, error: 'Unauthorized access.' }, { status: 403 });
  }

  if (video.sourceUrl.startsWith('http')) {
    return NextResponse.redirect(video.sourceUrl, 307);
  }

  return NextResponse.redirect(new URL(video.sourceUrl, request.url), 307);
}
