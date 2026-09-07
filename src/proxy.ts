import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isOwnerEmail } from '@/lib/owner'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/hq')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Being *any* authenticated Supabase user used to be enough to reach HQ. If
  // signups are ever enabled on the project, that means a stranger can register
  // and walk into the CRM. Restrict to the owner accounts we actually expect.
  //
  // The predicate lives in @/lib/owner so the API routes enforce the identical
  // rule — this check is only the optimistic half. See src/lib/auth.ts.
  if (!isOwnerEmail(user.email)) {
    const denied = new URL('/login', request.url)
    denied.searchParams.set('error', 'not_authorized')
    return NextResponse.redirect(denied)
  }

  return response
}

export const config = {
  matcher: ['/hq/:path*'],
}
