import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import {
  verifyAdminSessionCookieValue,
  ADMIN_SESSION_COOKIE_NAME,
} from '@/app/lib/adminSession';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_BUILD_PLACEHOLDER';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

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
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (!isLoginPath && !sessionOk) {
      const login = new URL('/admin/login', request.url);
      login.searchParams.set('next', pathname + request.nextUrl.search);
      return NextResponse.redirect(login);
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
