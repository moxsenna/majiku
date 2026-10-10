import { NextRequest, NextResponse } from "next/server";

export function extractSubdomain(hostHeader: string | null): "admin" | "parent" | "tutor" | "vendor" | "public" {
  if (!hostHeader) return "public";
  const cleanHost = hostHeader.split(":")[0].toLowerCase();
  if (cleanHost.startsWith("admin.")) return "admin";
  if (cleanHost.startsWith("parent.")) return "parent";
  if (cleanHost.startsWith("tutor.")) return "tutor";
  if (cleanHost.startsWith("vendor.")) return "vendor";
  return "public";
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const host = req.headers.get("host");
  const subdomain = extractSubdomain(host);

  // Lewatkan aset internal Next.js dan file statis
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    (pathname.includes(".") && !pathname.startsWith("/api/photos"))
  ) {
    return NextResponse.next();
  }

  // Khusus foto di R2 tetap verifikasi keberadaan session cookie
  if (pathname.startsWith("/api/photos")) {
    const hasSession =
      req.cookies.has("better-auth.session_token") ||
      req.cookies.has("__Secure-better-auth.session_token");
    if (!hasSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Lewatkan webhook dan API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const hasSession =
    req.cookies.has("better-auth.session_token") ||
    req.cookies.has("__Secure-better-auth.session_token");

  // ==========================================
  // 1. SUBDOMAIN: ADMIN (admin.majiku.web.id)
  // ==========================================
  if (subdomain === "admin") {
    // Isolasi: dilarang akses rute role lain di subdomain admin
    if (
      pathname.startsWith("/parent") ||
      pathname.startsWith("/tutor") ||
      pathname.startsWith("/vendor")
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname === "/login") {
      return NextResponse.rewrite(new URL(`/admin/login${search}`, req.url));
    }
    if (pathname === "/register") {
      return NextResponse.rewrite(new URL(`/admin/register${search}`, req.url));
    }

    if (!hasSession) {
      const loginUrl = new URL("/login", req.url);
      if (pathname !== "/") {
        loginUrl.searchParams.set("next", pathname + search);
      }
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/") {
      return NextResponse.rewrite(new URL(`/dashboard${search}`, req.url));
    }

    return NextResponse.next();
  }

  // ==========================================
  // 2. SUBDOMAIN: PARENT (parent.majiku.web.id)
  // ==========================================
  if (subdomain === "parent") {
    // Isolasi: dilarang akses rute admin / tutor / vendor di subdomain parent
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/students") ||
      pathname.startsWith("/tutor") ||
      pathname.startsWith("/vendor") ||
      pathname.startsWith("/classes") ||
      pathname.startsWith("/attendance") ||
      pathname.startsWith("/daily-reports") ||
      pathname.startsWith("/lesson-plans") ||
      pathname.startsWith("/gallery") ||
      pathname.startsWith("/messages") ||
      pathname.startsWith("/schedule") ||
      pathname.startsWith("/birthdays") ||
      pathname.startsWith("/crm") ||
      pathname.startsWith("/settings")
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname === "/login") {
      return NextResponse.rewrite(new URL(`/parent/login${search}`, req.url));
    }
    if (pathname === "/register") {
      return NextResponse.rewrite(new URL(`/parent/register${search}`, req.url));
    }

    if (!hasSession) {
      const loginUrl = new URL("/login", req.url);
      if (pathname !== "/") {
        loginUrl.searchParams.set("next", pathname + search);
      }
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/" || pathname === "/parent") {
      return NextResponse.rewrite(new URL(`/parent${search}`, req.url));
    }

    if (!pathname.startsWith("/parent/")) {
      return NextResponse.rewrite(new URL(`/parent${pathname}${search}`, req.url));
    }

    return NextResponse.next();
  }

  // ==========================================
  // 3. SUBDOMAIN: TUTOR (tutor.majiku.web.id)
  // ==========================================
  if (subdomain === "tutor") {
    // Isolasi: dilarang akses rute admin / parent / vendor di subdomain tutor
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/students") ||
      pathname.startsWith("/parent") ||
      pathname.startsWith("/vendor") ||
      pathname.startsWith("/classes") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/crm")
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname === "/login") {
      return NextResponse.rewrite(new URL(`/tutor/login${search}`, req.url));
    }

    if (!hasSession) {
      const loginUrl = new URL("/login", req.url);
      if (pathname !== "/") {
        loginUrl.searchParams.set("next", pathname + search);
      }
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/" || pathname === "/tutor") {
      return NextResponse.rewrite(new URL(`/tutor${search}`, req.url));
    }

    if (!pathname.startsWith("/tutor/")) {
      return NextResponse.rewrite(new URL(`/tutor${pathname}${search}`, req.url));
    }

    return NextResponse.next();
  }

  // ==========================================
  // 4. SUBDOMAIN: VENDOR (vendor.majiku.web.id)
  // ==========================================
  if (subdomain === "vendor") {
    // Isolasi: dilarang akses rute daycare / parent / tutor di subdomain vendor
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/students") ||
      pathname.startsWith("/parent") ||
      pathname.startsWith("/tutor") ||
      pathname.startsWith("/classes") ||
      pathname.startsWith("/billing")
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname === "/login") {
      return NextResponse.rewrite(new URL(`/vendor/login${search}`, req.url));
    }

    if (!hasSession) {
      const loginUrl = new URL("/login", req.url);
      if (pathname !== "/") {
        loginUrl.searchParams.set("next", pathname + search);
      }
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/") {
      return NextResponse.rewrite(new URL(`/vendor${search}`, req.url));
    }

    return NextResponse.next();
  }

  // ==========================================
  // 5. APEX / DIRECT PATH (majiku.web.id / localhost)
  // ==========================================
  const ADMIN_PROTECTED = [
    /^\/dashboard/, /^\/students/, /^\/attendance/, /^\/daily-reports/,
    /^\/gallery/, /^\/messages/, /^\/billing/, /^\/tutor-payout/,
    /^\/classes/, /^\/tutors/, /^\/schedule/, /^\/birthdays/,
    /^\/lesson-plans/, /^\/crm/, /^\/settings/,
  ];
  const PARENT_PROTECTED = [/^\/parent\b(?!\/login|\/register)/];
  const TUTOR_PROTECTED = [/^\/tutor\b(?!\/login)/];
  const VENDOR_PROTECTED = [/^\/vendor\b(?!\/login)/];

  if (!hasSession) {
    if (ADMIN_PROTECTED.some((re) => re.test(pathname))) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    if (PARENT_PROTECTED.some((re) => re.test(pathname))) {
      const url = new URL("/parent/login", req.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    if (TUTOR_PROTECTED.some((re) => re.test(pathname))) {
      const url = new URL("/tutor/login", req.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    if (VENDOR_PROTECTED.some((re) => re.test(pathname))) {
      const url = new URL("/vendor/login", req.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
