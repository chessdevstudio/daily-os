import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "daily_os_session";
const PROTECTED_PREFIXES = ["/dashboard", "/nutrition", "/focus", "/habits"];
const AUTH_PAGES = ["/login", "/register"];

async function isValidSession(token: string | undefined) {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const authed = await isValidSession(token);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !authed) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isAuthPage && authed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (pathname === "/") {
    return NextResponse.redirect(new URL(authed ? "/dashboard" : "/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/nutrition/:path*", "/focus/:path*", "/habits/:path*", "/login", "/register"],
};
