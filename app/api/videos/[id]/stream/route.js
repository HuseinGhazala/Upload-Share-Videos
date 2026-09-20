import path from 'path';
import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { getVideoById } from '../../../../lib/videoStore';
import { getBrowserSessionIdFromCookies } from '../../../../lib/browserSession';
import { getOptionalAuthUser } from '../../../../lib/authSession';
import { canAccessVideo } from '../../../../lib/videoAccess';
import { isShareAccessExpired } from '../../../../lib/linkTtl';

export async function GET(request, props) {
  const params = await props.params;
  const video = await getVideoById(params.id);
  if (!video) {
    return NextResponse.json({ success: false, error: 'Video not found.' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');
  const browserSessionId = await getBrowserSessionIdFromCookies();
  const user = await getOptionalAuthUser();

  if (!canAccessVideo(video, { accessToken, browserSessionId, userId: user?.id })) {
    if (isShareAccessExpired(video) && accessToken === video.accessToken) {
      return NextResponse.json({ success: false, error: 'انتهت صلاحية رابط المشاركة.' }, { status: 410 });
    }
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

  if (video.sourceUrl.startsWith('/uploads/')) {
    const filepath = path.join(process.cwd(), 'public', video.sourceUrl);
    try {
      const { stat } = await import('fs/promises');
      const { createReadStream } = await import('fs');
      const { Readable } = await import('stream');
      
      const fileStat = await stat(filepath);
      const fileSize = fileStat.size;
      const range = request.headers.get('range');

      let headers = {
        'Content-Type': video.mimeType || 'video/mp4',
        'Cache-Control': 'private, max-age=2592000', // Cache for 30 days
        'Accept-Ranges': 'bytes',
      };
      
      let status = 200;
      let nodeStream;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        
        headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
        headers['Content-Length'] = chunksize.toString();
        status = 206;
        
        nodeStream = createReadStream(filepath, { start, end });
      } else {
        headers['Content-Length'] = fileSize.toString();
        nodeStream = createReadStream(filepath);
      }

      const stream = Readable.toWeb(nodeStream);
      return new NextResponse(stream, {
        status,
        headers,
      });
    } catch (error) {
      console.error('Streaming error:', error);
      return NextResponse.json({ success: false, error: 'File not found or streaming failed.' }, { status: 404 });
    }
  }

  if (forwardedHost) {
    return NextResponse.redirect(`${forwardedProto}://${forwardedHost}${video.sourceUrl}`, 307);
  }

  return NextResponse.redirect(new URL(video.sourceUrl, request.url), 307);
}

export const runtime = 'nodejs';
