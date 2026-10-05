"use client";

import { redirect, usePathname } from "next/navigation";
import { useAuth, type AppRole } from "@/hooks/useAuth";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  role?: AppRole;
  requiredRole?: AppRole;
}

export function RoleProtectedRoute({ children, role, requiredRole }: RoleProtectedRouteProps) {
  const targetRole = role ?? requiredRole;
  const { session, loading, hasRole, roleHome } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    redirect(`/auth/login?next=${encodeURIComponent(pathname || "")}`);
  }

  if (targetRole && !hasRole(targetRole)) {
    // Send the user to the dashboard they actually have access to.
    redirect(roleHome);
  }

  return <>{children}</>;
}
