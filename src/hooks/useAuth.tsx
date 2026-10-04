import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "admin" | "moderator" | "user" | "parent" | "tutor";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  /** true while session or roles are still being resolved */
  loading: boolean;
  isAdmin: boolean;
  hasRole: (role: AppRole) => boolean;
  /** Landing route matching the highest-priority role of the user */
  roleHome: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function homeForRoles(roles: AppRole[]): string {
  if (roles.includes("admin")) return "/dashboard";
  if (roles.includes("tutor")) return "/tutor";
  if (roles.includes("parent")) return "/parent";
  return "/";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setSessionLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setRoles([]);
      setRolesLoading(false);
      return;
    }

    let cancelled = false;
    setRolesLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (cancelled) return;
        setRoles(error || !data ? [] : (data.map((r) => r.role) as AppRole[]));
        setRolesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const hasRole = useCallback(
    (role: AppRole) => roles.includes(role) || roles.includes("admin"),
    [roles]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRoles([]);
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    roles,
    loading: sessionLoading || rolesLoading,
    isAdmin: roles.includes("admin"),
    hasRole,
    roleHome: homeForRoles(roles),
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
