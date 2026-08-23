import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === '/login' || pathname.startsWith('/api/auth');
  const isPublicRoute = pathname === '/' || pathname.match(/^\/equipment\/.*\/qr$/);
  
  if (isAuthRoute || isPublicRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
