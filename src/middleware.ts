import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Paths publik yang tidak perlu auth
  const publicPaths = [
    '/authentication',
    '/api/auth',
    '/_next',
    '/favicon.ico',
  ]
  const isPublic = publicPaths.some(path => pathname.startsWith(path))

  // 2. Jika belum login & bukan public path → redirect to login
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token && !isPublic) {
    const url = new URL('/authentication', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // 3. Role‐based guard (opsional)
  const protectedRoutes = [
    { path: '/dashboard', roles: ['admin','project_manager','employee'] },
    { path: '/employees', roles: ['admin','project_manager'] },
    { path: '/projects', roles: ['admin','project_manager'] },
    { path: '/template-maker', roles: ['admin','project_manager'] },
  ]
  const matched = protectedRoutes.find(r =>
    pathname === r.path || pathname.startsWith(`${r.path}/`)
  )
  if (matched && token && !matched.roles.includes(token.role as string)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};