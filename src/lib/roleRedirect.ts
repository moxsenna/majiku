import { homeForRoles } from "@/hooks/useAuth";
import { getMyRoles } from "@/server/actions/roles";

/**
 * Resolves the correct landing route for the signed-in user based on their role.
 * Admin -> /dashboard, Tutor -> /tutor, Parent -> /parent.
 */
export async function getRoleHome(_userId?: string): Promise<string> {
  try {
    const roles = await getMyRoles();
    return homeForRoles(roles);
  } catch {
    return "/";
  }
}
