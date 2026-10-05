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
];

export function middleware(req: NextRequest) {
  const hasSession =
    req.cookies.has("better-auth.session_token") ||
    req.cookies.has("__Secure-better-auth.session_token");
  const isProtected = PROTECTED.some((re) => re.test(req.nextUrl.pathname));
  if (isProtected && !hasSession) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
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
  ],
};
