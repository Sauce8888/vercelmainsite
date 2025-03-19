import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create a Supabase client specifically for middleware
  const supabase = createMiddlewareClient({ req, res });

  // Get the active session
  const { data: { session } } = await supabase.auth.getSession();

  // Get current URL path
  const path = req.nextUrl.pathname;

  // If no session and the path is protected, redirect to login
  if (!session && path.startsWith('/dashboard')) {
    const redirectUrl = new URL('/auth/signin', req.url);
    // Add return URL as a parameter to redirect back after login
    redirectUrl.searchParams.set('returnUrl', path);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If we have a session but the user is on the auth pages, redirect to dashboard
  if (session && 
      (path === '/auth/signin' || 
       path === '/auth/signup')) {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}; 