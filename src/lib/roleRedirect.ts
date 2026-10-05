import { getMyRoles, type AppRole } from "@/server/actions/roles";

/**
 * Maps roles to landing route.
 * Admin -> /dashboard, Tutor -> /tutor, Parent -> /parent, fallback -> /.
 */
export function roleHome(roles: (AppRole | string)[]): string {
  if (roles.includes("admin")) return "/dashboard";
  if (roles.includes("tutor")) return "/tutor";
  if (roles.includes("parent")) return "/parent";
  return "/";
}

export const homeForRoles = roleHome;

/**
 * Resolves the correct landing route for the signed-in user based on their role.
 * Admin -> /dashboard, Tutor -> /tutor, Parent -> /parent.
 */
export async function getRoleHome(_userId?: string): Promise<string> {
  try {
    const roles = await getMyRoles();
    return roleHome(roles);
  } catch {
    return "/";
  }
}
