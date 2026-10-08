import { getMyRoles, type AppRole } from "@/server/actions/roles";

/**
 * Maps roles to landing route within local path routing.
 * Superadmin -> /vendor, Admin -> /dashboard, Tutor -> /tutor, Parent -> /parent, fallback -> /.
 */
export function roleHome(roles: (AppRole | string)[]): string {
  if (roles.includes("superadmin")) return "/vendor";
  if (roles.includes("admin")) return "/dashboard";
  if (roles.includes("tutor")) return "/tutor";
  if (roles.includes("parent")) return "/parent";
  return "/";
}

export const homeForRoles = roleHome;

/**
 * Maps role to its designated subdomain URL in production.
 */
export function getSubdomainForRole(
  role: AppRole | string,
  host?: string
): string {
  // If in localhost / development
  if (host && (host.includes("localhost") || host.includes("127.0.0.1"))) {
    const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
    if (role === "superadmin") return `http://vendor.localhost${port}/`;
    if (role === "admin") return `http://admin.localhost${port}/`;
    if (role === "tutor") return `http://tutor.localhost${port}/`;
    if (role === "parent") return `http://parent.localhost${port}/`;
    return `http://localhost${port}/`;
  }

  // Production subdomain on majiku.web.id
  if (role === "superadmin") return "https://vendor.majiku.web.id/";
  if (role === "admin") return "https://admin.majiku.web.id/";
  if (role === "tutor") return "https://tutor.majiku.web.id/";
  if (role === "parent") return "https://parent.majiku.web.id/";
  return "https://majiku.web.id/";
}

export function roleSubdomainHome(
  roles: (AppRole | string)[],
  host?: string
): string {
  if (roles.includes("superadmin")) return getSubdomainForRole("superadmin", host);
  if (roles.includes("admin")) return getSubdomainForRole("admin", host);
  if (roles.includes("tutor")) return getSubdomainForRole("tutor", host);
  if (roles.includes("parent")) return getSubdomainForRole("parent", host);
  return getSubdomainForRole("user", host);
}

/**
 * Resolves the correct landing route for the signed-in user based on their role.
 */
export async function getRoleHome(_userId?: string): Promise<string> {
  try {
    const roles = await getMyRoles();
    return roleHome(roles);
  } catch {
    return "/";
  }
}
