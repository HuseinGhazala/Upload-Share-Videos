import { NextResponse } from 'next/server';
import { getVideoById } from '../../../../lib/videoStore';

function canAccess(video, token) {
  if (video.visibility === 'public') return true;
  return token && token === video.accessToken;
}

export async function GET(request, { params }) {
  const video = await getVideoById(params.id);
  // #region agent log
  fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H6',location:'app/api/videos/[id]/stream/route.js:11',message:'stream lookup result',data:{videoId:params.id,found:Boolean(video)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!video) {
    return NextResponse.json({ success: false, error: 'Video not found.' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');
  if (!canAccess(video, accessToken)) {
    return NextResponse.json({ success: false, error: 'Unauthorized access.' }, { status: 403 });
  }
  // #region agent log
  fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H7',location:'app/api/videos/[id]/stream/route.js:24',message:'stream redirect target resolved',data:{sourceUrl:video.sourceUrl,isAbsolute:video.sourceUrl?.startsWith('http')},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

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
