import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // console.log('[Middleware] Path:', path);
  
  // Definisikan rute yang dilindungi dan role yang diizinkan
  const protectedRoutes = [
    { path: '/employees', roles: ['admin','project_manager'] },
    { path: '/projects', roles: ['admin', 'project_manager'] },
    { path: '/template-maker', roles : ['admin', 'project_manager']},
    { path: '/template-maker', roles : ['admin', 'project_manager']},
  ];
  
  // Cek apakah path saat ini adalah rute yang dilindungi
  const matchedRoute = protectedRoutes.find(route => 
    path === route.path || path.startsWith(`${route.path}/`)
  );
  
  if (matchedRoute) {
    // console.log('[Middleware] Matched protected route:', matchedRoute.path);
    
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET
    });
    
    // console.log('[Middleware] Token exists:', !!token);
    
    // Jika tidak ada token, redirect ke login
    if (!token) {
      // console.log('[Middleware] No token - redirecting to login');
      const url = new URL('/authentication', request.url);
      url.searchParams.set('callbackUrl', encodeURI(path));
      return NextResponse.redirect(url);
    }
    
    // Cek apakah user memiliki role yang sesuai
    const userRole = token.role as string;
    // console.log('[Middleware] User role:', userRole);
    
    if (!matchedRoute.roles.includes(userRole)) {
      // console.log('[Middleware] Unauthorized role - redirecting');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // console.log('[Middleware] Access granted');
  }
  
  return NextResponse.next();
}

// Konfigurasi agar middleware hanya dijalankan pada rute tertentu
export const config = {
  matcher: ['/dashboard/:path*', '/employees/:path*', '/projects/:path*']
};