import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

const adminOnlyRoutes = [
  '/dashboard',
  '/products',
  '/pizza-management',
  '/inventory',
  '/reports',
  '/employees',
  '/settings',
  '/audit-logs',
];

const protectedRoutes = [
  '/pos',
  '/orders',
  '/kitchen',
  '/customers',
  ...adminOnlyRoutes,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const isAdminRoute = adminOnlyRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isAdminRoute && payload.role !== 'ADMIN' && payload.role !== 'MANAGER') {
      return NextResponse.redirect(new URL('/pos', request.url));
    }
  }

  if (pathname === '/login' && token) {
    const payload = await verifyJWT(token);
    if (payload) {
      if (payload.role === 'ADMIN' || payload.role === 'MANAGER') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/pos', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
