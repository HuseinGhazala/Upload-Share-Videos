const PROVIDER = (process.env.AUTH_CAPTCHA_PROVIDER || '').trim().toLowerCase();
const RECAPTCHA_SECRET = (process.env.RECAPTCHA_SECRET_KEY || '').trim();
const HCAPTCHA_SECRET = (process.env.HCAPTCHA_SECRET_KEY || '').trim();

function getProviderConfig() {
  if (PROVIDER === 'recaptcha' && RECAPTCHA_SECRET) {
    return {
      provider: 'recaptcha',
      verifyUrl: 'https://www.google.com/recaptcha/api/siteverify',
      secret: RECAPTCHA_SECRET,
    };
  }

  if (PROVIDER === 'hcaptcha' && HCAPTCHA_SECRET) {
    return {
      provider: 'hcaptcha',
      verifyUrl: 'https://hcaptcha.com/siteverify',
      secret: HCAPTCHA_SECRET,
    };
  }

  return null;
}

export function getCaptchaClientConfig() {
  const provider = (process.env.AUTH_CAPTCHA_PROVIDER || '').trim().toLowerCase();
  if (provider === 'recaptcha') {
    return {
      provider,
      siteKey: (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '').trim(),
    };
  }
  if (provider === 'hcaptcha') {
    return {
      provider,
      siteKey: (process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '').trim(),
    };
  }
  return { provider: '', siteKey: '' };
}

export async function verifyCaptchaToken(token, ip) {
  const config = getProviderConfig();
  if (!config) return { ok: true };
  if (!token) return { ok: false, error: 'captcha_missing' };

  const body = new URLSearchParams();
  body.set('secret', config.secret);
  body.set('response', token);
  if (ip && ip !== 'unknown') body.set('remoteip', ip);

  try {
    const res = await fetch(config.verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, error: 'captcha_verify_failed' };
    const data = await res.json();
    if (!data?.success) return { ok: false, error: 'captcha_invalid' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'captcha_unreachable' };
  }
}
