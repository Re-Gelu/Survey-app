import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import requestIp from 'request-ip';

export async function middleware(request: NextRequest, _next: NextFetchEvent) {
  const res = NextResponse.next();
  const ip = requestIp.getClientIp(request as any);
  const nextIp = request.ip;

  res.cookies.set(
    "user-ip", 
    nextIp ? nextIp : ip ? ip : "", 
    { httpOnly: false }
  );
  
  return res;
};