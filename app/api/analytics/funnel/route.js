import { NextResponse } from 'next/server';

const ALLOWED_EVENTS = new Set([
  'view_pricing',
  'select_package',
  'start_signup',
  'complete_signup',
  'start_login',
  'complete_login',
  'start_payment_proof',
  'submit_payment_proof',
  'plan_activated',
  'first_upload_after_activation',
]);

function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const event = typeof body.event === 'string' ? body.event : '';
  if (!ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Lightweight server log suitable for early CRO funnel monitoring.
  console.info('[funnel]', JSON.stringify({
    event,
    payload: body.payload || {},
    page: body.page || '',
    ts: body.ts || Date.now(),
    ip: getClientIp(request),
    ua: request.headers.get('user-agent') || '',
  }));

  return NextResponse.json({ ok: true });
}
