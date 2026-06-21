import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import {
  verifyAdminSessionCookieValue,
  ADMIN_SESSION_COOKIE_NAME,
} from '@/app/lib/adminSession';
import {
  getOrCreateBrowserSessionId,
  BROWSER_SESSION_COOKIE_NAME,
  browserSessionCookieOptions,
} from '@/app/lib/browserSession';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_BUILD_PLACEHOLDER';

function getSupabaseOrigin() {
  try {
    return new URL(SUPABASE_URL).origin;
  } catch {
    return '';
  }
}

function buildCsp() {
  const supabaseOrigin = getSupabaseOrigin();
  const connectSrc = ["'self'", 'https://*.supabase.co'];
  if (supabaseOrigin) connectSrc.push(supabaseOrigin);

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: data: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://hcaptcha.com https://*.hcaptcha.com",
    "frame-src 'self' https://www.google.com https://recaptcha.google.com https://hcaptcha.com https://*.hcaptcha.com",
    `connect-src ${connectSrc.join(' ')} https://www.google.com https://hcaptcha.com https://*.hcaptcha.com`,
    "upgrade-insecure-requests",
  ].join('; ');
}

/** يمنع كاش HTML/RSC قديم يشير لـ chunks من build سابق (ChunkLoadError بعد النشر). */
function noStoreDocumentHeaders(res) {
  res.headers.set(
    'Cache-Control',
    'private, no-cache, no-store, max-age=0, must-revalidate'
  );
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  res.headers.set('Content-Security-Policy', buildCsp());
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/uploads/')) {
    const blocked = NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    noStoreDocumentHeaders(blocked);
    return blocked;
  }

  if (pathname.startsWith('/admin')) {
    const isLoginPath = pathname === '/admin/login';
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const sessionOk = token ? await verifyAdminSessionCookieValue(token) : false;

    if (isLoginPath && sessionOk) {
      let dest = '/admin';
      const raw = request.nextUrl.searchParams.get('next');
      if (raw && raw.startsWith('/admin') && !raw.startsWith('//')) {
        dest = raw;
      }
      const redirect = NextResponse.redirect(new URL(dest, request.url));
      noStoreDocumentHeaders(redirect);
      return redirect;
    }

    if (!isLoginPath && !sessionOk) {
      const login = new URL('/admin/login', request.url);
      login.searchParams.set('next', pathname + request.nextUrl.search);
      const redirect = NextResponse.redirect(login);
      noStoreDocumentHeaders(redirect);
      return redirect;
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  const { sessionId, isNew } = getOrCreateBrowserSessionId(request);
  if (isNew) {
    supabaseResponse.cookies.set(
      BROWSER_SESSION_COOKIE_NAME,
      sessionId,
      browserSessionCookieOptions()
    );
  }

  noStoreDocumentHeaders(supabaseResponse);
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
