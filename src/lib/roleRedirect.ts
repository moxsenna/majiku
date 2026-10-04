import { supabase } from "@/integrations/supabase/client";
import { homeForRoles, type AppRole } from "@/hooks/useAuth";

/**
 * Resolves the correct landing route for the signed-in user based on their role.
 * Admin -> /dashboard, Tutor -> /tutor, Parent -> /parent.
 */
export async function getRoleHome(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error || !data || data.length === 0) return "/";

  return homeForRoles(data.map((r) => r.role) as AppRole[]);
}
