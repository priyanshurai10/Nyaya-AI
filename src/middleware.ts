import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "nyaya_ai_super_secret_jwt_key_2026_production"
);

export async function middleware(req: NextRequest) {
  let token = req.cookies.get('nyaya_token')?.value;
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  const path = req.nextUrl.pathname;
  console.log('[Middleware] Path:', path, 'Token length:', token ? token.length : 0);

  let isAuthed = false;
  let role = 'USER';

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const userId = payload.id || payload.sub;
      if (payload && userId) {
        isAuthed = true;
        role = (payload.role as string) || 'USER';
      }
    } catch (err) {
      console.error('[Middleware JWT Verification Failed]:', err);
      isAuthed = false;
    }
  }

  // Define protected routes
  const isProtectedUI = 
    path.startsWith('/dashboard') || 
    path.startsWith('/admin') ||
    path.startsWith('/bookmarks') ||
    path.startsWith('/learning-progress') ||
    path.startsWith('/notifications') ||
    path.startsWith('/consultation') ||
    path.startsWith('/evidence-vault') ||
    path.startsWith('/payments');

  // Protect Admin UI
  if (path.startsWith('/admin')) {
    if (!isAuthed) {
      return NextResponse.redirect(new URL(`/auth?redirect=${encodeURIComponent(path)}&error=AdminAccessDenied`, req.url));
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Protect general UI
  if (isProtectedUI && !isAuthed) {
    return NextResponse.redirect(new URL(`/auth?redirect=${encodeURIComponent(path)}`, req.url));
  }

  // Protect API routes
  const isProtectedApi = 
    (path.startsWith('/api/v1/user') && 
     !path.startsWith('/api/v1/user/login') && 
     !path.startsWith('/api/v1/user/register') &&
     !path.startsWith('/api/v1/user/otp')) || 
    path.startsWith('/api/v1/bookmarks') ||
    path.startsWith('/api/v1/evidence-vault') ||
    path.startsWith('/api/v1/payments') ||
    path.startsWith('/api/v1/consultation');

  const isAdminApi = path.startsWith('/api/v1/admin');

  if (isAdminApi) {
    if (!isAuthed || role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized Admin API access' }, { status: 401 });
    }
  }

  if (isProtectedApi && !isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized API access' }, { status: 401 });
  }

  const requestHeaders = new Headers(req.headers);
  if (token) {
    requestHeaders.set('authorization', `Bearer ${token}`);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
