"use client";

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { getMyRoles, type AppRole } from "@/server/actions/roles";
import { roleHome, homeForRoles } from "@/lib/roleRedirect";

export type { AppRole };
export { roleHome, homeForRoles };

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  [key: string]: unknown;
}

export interface AuthContextType {
  session: unknown | null;
  user: AuthUser | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  hasRole: (role: AppRole) => boolean;
  roleHome: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  roles: [],
  loading: true,
  isAdmin: false,
  hasRole: () => false,
  roleHome: "/",
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const rolesLoading = Boolean(data?.user && loadedUserId !== data.user.id);

  useEffect(() => {
    const userId = data?.user?.id;
    if (userId) {
      getMyRoles()
        .then((r) => {
          setRoles(r);
          setLoadedUserId(userId);
        })
        .catch(() => {
          setRoles([]);
          setLoadedUserId(userId);
        });
    } else {
      setRoles([]);
      setLoadedUserId(null);
    }
  }, [data?.user?.id]);

  const hasRole = (role: AppRole) =>
    roles.includes("admin") || roles.includes(role);

  const roleHome = useMemo(() => homeForRoles(roles), [roles]);
  const isAdmin = roles.includes("admin");

  return (
    <AuthContext.Provider
      value={{
        session: data?.session ?? null,
        user: (data?.user as AuthUser) ?? null,
        roles,
        loading: isPending || rolesLoading,
        isAdmin,
        hasRole,
        roleHome,
        signOut: async () => {
          await authClient.signOut();
          setRoles([]);
          setLoadedUserId(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
