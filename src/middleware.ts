import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "nyaya_ai_super_secret_jwt_key_2026_production"
);

function isSuperAdminEmail(e?: string): boolean {
  if (!e) return false;
  return e.toLowerCase().trim() === "priyanshurai121111@gmail.com";
}

export async function middleware(req: NextRequest) {
  let token = req.cookies.get('nyaya_token')?.value;
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  const path = req.nextUrl.pathname;

  let isAuthed = false;
  let role = 'USER';
  let email = '';

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const userId = payload.id || payload.sub;
      email = (payload.email as string) || '';
      if (payload && userId) {
        isAuthed = true;
        role = (payload.role as string) || 'USER';
        if (isSuperAdminEmail(email)) {
          role = 'ADMIN';
        }
      }
    } catch (err) {
      isAuthed = false;
    }
  }

  // Completely redirect removed UI routes (/admin, /notifications) to /dashboard
  if (path.startsWith('/admin') || path.startsWith('/notifications')) {
    return NextResponse.redirect(new URL(isAuthed ? '/dashboard' : '/auth', req.url));
  }

  // Define protected routes
  const isProtectedUI = 
    path.startsWith('/dashboard') || 
    path.startsWith('/consultation') ||
    path.startsWith('/evidence-vault') ||
    path.startsWith('/payments');

  // Protect general UI
  if (isProtectedUI && !isAuthed) {
    return NextResponse.redirect(new URL(`/auth?redirect=${encodeURIComponent(path)}`, req.url));
  }

  // Protect API routes (Removed dead APIs)
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

  if (isAdminApi) {
    if (!isAuthed || !isSuperAdminEmail(email)) {
      return NextResponse.json({ success: false, error: 'Unauthorized Admin API access' }, { status: 403 });
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};