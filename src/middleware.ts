import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

function isSuperAdminEmail(e?: string): boolean {
  if (!e) return false;
  return e.toLowerCase().trim() === "priyanshurai121111@gmail.com";
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Completely redirect removed UI routes (/admin, /notifications) to /dashboard or /auth
  if (path.startsWith('/admin') || path.startsWith('/notifications')) {
    const hasAuthCookie = req.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
    return NextResponse.redirect(new URL(hasAuthCookie ? '/dashboard' : '/auth', req.url));
  }

  // Define protected routes
  const isProtectedUI = 
    path.startsWith('/dashboard') || 
    path.startsWith('/consultation') ||
    path.startsWith('/evidence-vault') ||
    path.startsWith('/payments') ||
    path.startsWith('/user/profile');

  // Define API routes
  const isProtectedApi = 
    (path.startsWith('/api/v1/user') && 
     !path.startsWith('/api/v1/user/login') && 
     !path.startsWith('/api/v1/user/register') &&
     !path.startsWith('/api/v1/user/otp') &&
     !path.startsWith('/api/v1/user/forgot-password') &&
     !path.startsWith('/api/v1/user/reset-password')) || 
    path.startsWith('/api/v1/evidence-vault') ||
    path.startsWith('/api/v1/payments') ||
    path.startsWith('/api/v1/consultation');

  const isAdminApi = path.startsWith('/api/v1/admin');

  // Fast path: If it's a completely public page (e.g. /, /auth, /academy, etc.)
  // and the visitor has no Supabase auth cookies, return immediately without any network roundtrip!
  const hasAuthCookie = req.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
  if (!isProtectedUI && !isProtectedApi && !isAdminApi && !hasAuthCookie) {
    return NextResponse.next();
  }

  // Update Supabase session and fetch user in ONE single, timeout-safe call
  const { response, user } = await updateSession(req);
  const isAuthed = !!user;
  const email = user?.email || '';

  // Protect general UI
  if (isProtectedUI && !isAuthed) {
    return NextResponse.redirect(new URL(`/auth?redirect=${encodeURIComponent(path)}`, req.url));
  }

  if (isAdminApi) {
    if (!isAuthed || !isSuperAdminEmail(email)) {
      return NextResponse.json({ success: false, error: 'Unauthorized Admin API access' }, { status: 403 });
    }
  }

  if (isProtectedApi && !isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized API access' }, { status: 401 });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};