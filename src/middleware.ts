import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

function isSuperAdminEmail(e?: string): boolean {
  if (!e) return false;
  return e.toLowerCase().trim() === "priyanshurai121111@gmail.com";
}

export async function middleware(req: NextRequest) {
  // Update Supabase session
  let response = await updateSession(req);
  
  // Create a supabase client strictly for middleware checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  const isAuthed = !!user;
  const email = user?.email || '';

  // Completely redirect removed UI routes (/admin, /notifications) to /dashboard
  if (path.startsWith('/admin') || path.startsWith('/notifications')) {
    return NextResponse.redirect(new URL(isAuthed ? '/dashboard' : '/auth', req.url));
  }

  // Define protected routes
  const isProtectedUI = 
    path.startsWith('/dashboard') || 
    path.startsWith('/consultation') ||
    path.startsWith('/evidence-vault') ||
    path.startsWith('/payments') ||
    path.startsWith('/user/profile');

  // Protect general UI
  if (isProtectedUI && !isAuthed) {
    return NextResponse.redirect(new URL(`/auth?redirect=${encodeURIComponent(path)}`, req.url));
  }

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