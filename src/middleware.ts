import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  //  1. Bypass untuk static files & images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|gif|css|js)$/i)
  ) {
    return NextResponse.next()
  }

  // 2. Path-path publik (nggak butuh login)
  const publicPaths = [
    '/authentication',
    '/api/auth', // auth API route
  ]
  const isPublic = publicPaths.some(path => pathname.startsWith(path))

  // 3. Cek token (login)
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token && !isPublic) {
    const url = new URL('/authentication', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // 4. Role-based guard
  const protectedRoutes = [
    { path: '/dashboard', roles: ['admin', 'project_manager', 'employee'] },
    { path: '/employees', roles: ['admin', 'project_manager'] },
    { path: '/projects', roles: ['admin', 'project_manager'] },
    { path: '/template-maker', roles: ['admin', 'project_manager'] },
  ]

  const matched = protectedRoutes.find(r =>
    pathname === r.path || pathname.startsWith(`${r.path}/`)
  )

  if (matched && token && !matched.roles.includes(token.role as string)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  //  5. Lolos semua pengecekan → lanjutkan
  return NextResponse.next()
}

//  Matcher untuk menghindari pemrosesan terhadap static & API (bisa diperluas)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(png|jpg|jpeg|webp|svg|ico|gif|css|js)).*)',
  ],
}
