"use client";

import { redirect, usePathname } from "next/navigation";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { roleSubdomainHome } from "@/lib/roleRedirect";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  role?: AppRole;
  requiredRole?: AppRole;
  /** Tampilan saat sesi/peran masih dimuat. Bawaan: kerangka halaman (N31: tanpa spinner layar penuh). */
  fallback?: React.ReactNode;
}

function DefaultFallback() {
  return (
    <div className="flex flex-col gap-4 p-6" aria-busy="true" aria-label="Memuat">
      <span className="sk h-8 w-56 rounded" />
      <span className="sk h-24 w-full rounded" />
      <span className="sk h-48 w-full rounded" />
    </div>
  );
}

function getLoginRouteForRole(role?: AppRole): string {
  if (role === "superadmin") return "/vendor/login";
  if (role === "admin") return "/admin/login";
  if (role === "tutor") return "/tutor/login";
  if (role === "parent") return "/parent/login";
  return "/admin/login";
}

export function RoleProtectedRoute({ children, role, requiredRole, fallback }: RoleProtectedRouteProps) {
  const targetRole = role ?? requiredRole;
  const { session, loading, hasRole, roleHome, roles } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <>{fallback ?? <DefaultFallback />}</>;
  }

  if (!session) {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      if (
        host.startsWith("admin.") ||
        host.startsWith("parent.") ||
        host.startsWith("tutor.") ||
        host.startsWith("vendor.")
      ) {
        window.location.href = `/login?next=${encodeURIComponent(pathname || "")}`;
        return null;
      }
    }
    const loginPath = getLoginRouteForRole(targetRole);
    redirect(`${loginPath}?next=${encodeURIComponent(pathname || "")}`);
  }

  if (targetRole && !hasRole(targetRole)) {
    // Pengguna terautentikasi tapi peran tidak sesuai:
    // Lempar pengguna ke subdomain/portal yang sesuai dengan peran aslinya!
    if (typeof window !== "undefined") {
      const targetSubdomainUrl = roleSubdomainHome(roles, window.location.host);
      window.location.href = targetSubdomainUrl;
      return null;
    }
    redirect(roleHome);
  }

  return <>{children}</>;
}
