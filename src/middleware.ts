import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/constants";
import { verifySessionToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/api/health" ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname === "/login") {
    if (!session) return NextResponse.next();
    const target = session.firstLogin
      ? "/ganti-password"
      : session.role === "admin"
        ? "/admin"
        : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/ganti-password") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    !pathname.startsWith("/admin") &&
    session.role === "admin" &&
    pathname !== "/ganti-password"
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (session.firstLogin) {
    return NextResponse.redirect(new URL("/ganti-password", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)",
  ],
};
