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

function normalizePayload(payload) {
  if (!payload || typeof payload !== 'object') return {};
  const clean = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (typeof value === 'string') {
      clean[key] = value.slice(0, 120);
      return;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value;
    }
  });
  return clean;
}

export async function trackFunnelEvent(eventName, payload = {}) {
  if (typeof window === 'undefined') return;
  if (!ALLOWED_EVENTS.has(eventName)) return;

  const body = JSON.stringify({
    event: eventName,
    payload: normalizePayload(payload),
    page: window.location.pathname,
    ts: Date.now(),
  });

  const url = '/api/analytics/funnel';
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      keepalive: true,
      body,
    });
  } catch {
    // Analytics events should never block UX.
  }
}

export function getAttributionFromLocation() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    from: params.get('from') || '',
    campaign: params.get('campaign') || '',
    variant: params.get('v') || '',
  };
}
