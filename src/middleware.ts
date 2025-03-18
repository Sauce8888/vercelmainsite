import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    }
  });
  
  // Get the token from the request cookies
  const supabaseToken = req.cookies.get('sb-access-token')?.value;
  
  // If no token and the path is protected, redirect to login
  if (!supabaseToken && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/auth/signin', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If we have a token but the user is on the auth pages, redirect to dashboard
  if (supabaseToken && 
      (req.nextUrl.pathname === '/auth/signin' || 
       req.nextUrl.pathname === '/auth/signup')) {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}; 