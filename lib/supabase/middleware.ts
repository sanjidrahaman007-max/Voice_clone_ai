import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Simple middleware that doesn't require database connection
  // Auth state will be managed client-side

  let response = NextResponse.next({
    request,
  });

  // For dashboard routes, allow access - client will handle auth redirect
  // This prevents server crashes when Supabase isn't configured

  return response;
}
