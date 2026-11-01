import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const DEFAULT_SECRET = "c2FuZGVlcC1wYXJ0eS1tYW5hZ2VyLXN1cGVyLXNlY3JldC1rZXktMjAyNi0xMjM0NQ==";
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || DEFAULT_SECRET);
const COOKIE_NAME = process.env.COOKIE_NAME || "party_ledger_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin route directly at the edge
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.role !== "ADMIN" && payload.role !== "GLOBAL_ADMIN") {
        const homeUrl = new URL("/", request.url);
        return NextResponse.redirect(homeUrl);
      }
    } catch {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
