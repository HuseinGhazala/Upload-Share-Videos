import path from 'path';
import { NextResponse } from 'next/server';
import { getVideoById } from '../../../../../lib/videoStore';
import { getBrowserSessionIdFromCookies } from '../../../../../lib/browserSession';
import { getOptionalAuthUser } from '../../../../../lib/authSession';
import { canAccessVideo } from '../../../../../lib/videoAccess';
import { isShareAccessExpired } from '../../../../../lib/linkTtl';

export async function GET(request, props) {
  const params = await props.params;
  const videoId = params.id;
  const fileParts = params.file; // [...file] array
  
  if (!fileParts || fileParts.length === 0) {
    return NextResponse.json({ success: false, error: 'File not specified.' }, { status: 400 });
  }
  
  const fileName = fileParts.join('/');
  
  // Security check: prevent directory traversal
  if (fileName.includes('..') || fileName.startsWith('/')) {
    return NextResponse.json({ success: false, error: 'Forbidden path.' }, { status: 403 });
  }

  const video = await getVideoById(videoId);
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

  const filepath = path.join(process.cwd(), 'public', 'uploads', 'hls', videoId, fileName);
  
  try {
    const { stat } = await import('fs/promises');
    const { createReadStream } = await import('fs');
    const { Readable } = await import('stream');
    
    const fileStat = await stat(filepath);
    const fileSize = fileStat.size;

    let mimeType = 'application/octet-stream';
    if (fileName.endsWith('.m3u8')) mimeType = 'application/vnd.apple.mpegurl';
    else if (fileName.endsWith('.ts')) mimeType = 'video/MP2T';

    // TS chunks can be cached heavily. The playlist should not be cached.
    const cacheControl = fileName.endsWith('.m3u8')
      ? 'private, no-cache, no-store, must-revalidate'
      : 'public, max-age=31536000, immutable';

    const headers = {
      'Content-Type': mimeType,
      'Cache-Control': cacheControl,
      'Content-Length': fileSize.toString(),
      'Access-Control-Allow-Origin': '*',
    };

    const nodeStream = createReadStream(filepath);
    const stream = Readable.toWeb(nodeStream);

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'File not found.' }, { status: 404 });
  }
}

export const runtime = 'nodejs';
