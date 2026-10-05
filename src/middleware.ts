import { NextRequest, NextResponse } from "next/server";

const PROTECTED = [
  /^\/dashboard/,
  /^\/students/,
  /^\/attendance/,
  /^\/daily-reports/,
  /^\/gallery/,
  /^\/messages/,
  /^\/billing/,
  /^\/tutor-payout/,
  /^\/classes/,
  /^\/tutors/,
  /^\/schedule/,
  /^\/birthdays/,
  /^\/lesson-plans/,
  /^\/crm/,
  /^\/settings/,
  /^\/vendor/,
  /^\/tutor/,
  /^\/parent/,
  /^\/api\/photos/,
];

export function middleware(req: NextRequest) {
  const hasSession =
    req.cookies.has("better-auth.session_token") ||
    req.cookies.has("__Secure-better-auth.session_token");
  const isProtected = PROTECTED.some((re) => re.test(req.nextUrl.pathname));
  if (isProtected && !hasSession) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL("/auth/login", req.url);
    const target = req.nextUrl.pathname + req.nextUrl.search;
    url.searchParams.set("next", target);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/students/:path*",
    "/attendance/:path*",
    "/daily-reports/:path*",
    "/gallery/:path*",
    "/messages/:path*",
    "/billing/:path*",
    "/tutor-payout/:path*",
    "/classes/:path*",
    "/tutors/:path*",
    "/schedule/:path*",
    "/birthdays/:path*",
    "/lesson-plans/:path*",
    "/crm/:path*",
    "/settings/:path*",
    "/vendor/:path*",
    "/tutor/:path*",
    "/parent/:path*",
    "/api/photos/:path*",
  ],
};
