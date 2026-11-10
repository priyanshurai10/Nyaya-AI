import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Quick check: If there are no auth cookies at all, skip network call entirely
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))

  if (!hasAuthCookie) {
    return { response: supabaseResponse, user: null }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    // Timeout promise after 2 seconds to prevent Vercel 504 middleware timeouts
    const userPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase Auth timeout')), 2000)
    )

    const result = (await Promise.race([userPromise, timeoutPromise])) as {
      data: { user: any }
      error?: any
    }
    return { response: supabaseResponse, user: result?.data?.user || null }
  } catch (err) {
    // If Supabase is paused or times out, fail gracefully
    return { response: supabaseResponse, user: null }
  }
}
