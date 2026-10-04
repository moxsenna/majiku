import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "@/hooks/useAuth";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: AppRole;
}

export function RoleProtectedRoute({ children, requiredRole }: RoleProtectedRouteProps) {
  const { session, loading, hasRole, roleHome } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasRole(requiredRole)) {
    // Send the user to the dashboard they actually have access to.
    return <Navigate to={roleHome} replace />;
  }

  return <>{children}</>;
}
