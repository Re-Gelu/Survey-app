import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import requestIp from 'request-ip';

export async function middleware(request: NextRequest, _next: NextFetchEvent) {
  // Getting ip for next use
  const response = NextResponse.next();
  const ip = requestIp.getClientIp(request as any);
  const nextIp = request.ip;

  const userIp = nextIp ? nextIp : ip ? ip : '';
  request.cookies.set('user-ip', userIp);
  response.cookies.set('user-ip', userIp, { httpOnly: false });

  return response;
}
