"use server";

import { headers } from "next/headers";
import { sql, eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { tenants, user, userRoles, paymentOrders } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles } from "@/server/authz";
import type { AppRole } from "@/server/actions/roles";
import { isDemoEmail } from "@/lib/demo";

export interface DaycareItem {
  id: string | number;
  name: string;
  type: string;
  plan: string;
  students: number;
  staff: number;
  revenue: number;
  status: "active" | "trial" | "inactive";
  joinDate: string;
}

export interface VendorUserItem {
  id: string | number;
  name: string;
  email: string;
  role: "super_admin" | "admin_daycare" | "staff" | "parent";
  status: "active" | "inactive";
  daycare: string;
  lastLogin: string;
}

export interface VendorPlatformData {
  isDemo: boolean;
  totalUsers: number;
  totalDaycares: number;
  activeDaycaresCount: number;
  totalRevenue: number;
  daycares: DaycareItem[];
  users: VendorUserItem[];
  roleDistribution: {
    superAdmin: number;
    adminDaycare: number;
    staff: number;
    parent: number;
  };
  typeDistribution: Array<{ name: string; value: number }>;
}

export async function getVendorPlatformOverview(): Promise<VendorPlatformData> {
  let session = null;
  try {
    const h = await headers();
    session = await auth.api.getSession({ headers: h });
  } catch {
    // fallback
  }

  // Otorisasi: overview platform hanya untuk superadmin (atau akun demo vendor)
  if (!session) {
    throw new Error("Unauthorized");
  }
  const roles: AppRole[] = await getMyRoles(session.user.id).catch(() => []);
  const isDemo = isDemoEmail(session.user?.email);
  if (!roles.includes("superadmin") && !isDemo) {
    throw new Error("Forbidden: halaman ini hanya untuk admin platform");
  }

  const userEmail = session?.user?.email;

  if (isDemo) {
    return {
      isDemo: true,
      totalUsers: 1247,
      totalDaycares: 583,
      activeDaycaresCount: 548,
      totalRevenue: 365505000,
      daycares: [
        { id: 1, name: "TK Ceria Mandiri", type: "TK/PAUD", plan: "Pro", students: 120, staff: 12, revenue: 8500000, status: "active", joinDate: "Jan 2024" },
        { id: 2, name: "Bimbel Prestasi Gemilang", type: "Bimbel", plan: "Pro", students: 85, staff: 8, revenue: 6200000, status: "active", joinDate: "Mar 2024" },
        { id: 3, name: "Daycare Happy Kids", type: "Daycare", plan: "Enterprise", students: 200, staff: 25, revenue: 15000000, status: "active", joinDate: "Nov 2023" },
        { id: 4, name: "PAUD Tunas Harapan", type: "TK/PAUD", plan: "Basic", students: 35, staff: 4, revenue: 2100000, status: "trial", joinDate: "Des 2024" },
      ],
      users: [
        { id: 1, name: "Budi Santoso", email: "budi@daycare-a.com", role: "super_admin", status: "active", daycare: "Platform MAJIKU", lastLogin: "2 jam lalu" },
        { id: 2, name: "Siti Nurhaliza", email: "siti@tkceria.com", role: "admin_daycare", status: "active", daycare: "TK Ceria Mandiri", lastLogin: "5 jam lalu" },
      ],
      roleDistribution: {
        superAdmin: 3,
        adminDaycare: 583,
        staff: 150,
        parent: 511,
      },
      typeDistribution: [
        { name: "Daycare", value: 245 },
        { name: "TK/PAUD", value: 180 },
        { name: "Bimbel", value: 120 },
      ],
    };
  }

  // --- QUERY REAL DATABASE ---
  const allTenants = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      type: tenants.type,
      city: tenants.city,
      isActive: tenants.isActive,
      isVerified: tenants.isVerified,
      createdAt: tenants.createdAt,
    })
    .from(tenants)
    .orderBy(desc(tenants.createdAt));

  const allUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRoles.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .leftJoin(userRoles, eq(userRoles.userId, user.id))
    .orderBy(desc(user.createdAt));

  const [paymentSummary] = await db
    .select({
      totalPaid: sql<number>`coalesce(sum(case when ${paymentOrders.paymentStatus} = 'paid' then ${paymentOrders.amount}::numeric else 0 end), 0)::int`,
    })
    .from(paymentOrders);

  const totalRevenue = paymentSummary?.totalPaid || 0;

  const mappedDaycares: DaycareItem[] = allTenants.map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type === "daycare" ? "Daycare" : t.type === "preschool" ? "TK/PAUD" : "Bimbel",
    plan: "Pro",
    students: 0,
    staff: 0,
    revenue: 0,
    status: t.isActive ? "active" : "inactive",
    joinDate: t.createdAt ? new Date(t.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" }) : "2024",
  }));

  const mappedUsers: VendorUserItem[] = allUsers.map((u) => {
    let mappedRole: "super_admin" | "admin_daycare" | "staff" | "parent" = "parent";
    if (u.role === "superadmin") mappedRole = "super_admin";
    else if (u.role === "admin" || u.role === "moderator") mappedRole = "admin_daycare";
    else if (u.role === "tutor") mappedRole = "staff";

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: mappedRole,
      status: "active",
      daycare: "MAJIKU Platform",
      lastLogin: "Aktif",
    };
  });

  const superAdminCount = mappedUsers.filter((u) => u.role === "super_admin").length;
  const adminDaycareCount = mappedUsers.filter((u) => u.role === "admin_daycare").length;
  const staffCount = mappedUsers.filter((u) => u.role === "staff").length;
  const parentCount = mappedUsers.filter((u) => u.role === "parent").length;

  const daycareTypesCount = {
    Daycare: mappedDaycares.filter((d) => d.type === "Daycare").length,
    "TK/PAUD": mappedDaycares.filter((d) => d.type === "TK/PAUD").length,
    Bimbel: mappedDaycares.filter((d) => d.type === "Bimbel").length,
  };

  const typeDistribution = [
    { name: "Daycare", value: daycareTypesCount.Daycare },
    { name: "TK/PAUD", value: daycareTypesCount["TK/PAUD"] },
    { name: "Bimbel", value: daycareTypesCount.Bimbel },
  ];

  return {
    isDemo: false,
    totalUsers: allUsers.length,
    totalDaycares: allTenants.length,
    activeDaycaresCount: allTenants.filter((t) => t.isActive).length,
    totalRevenue,
    daycares: mappedDaycares,
    users: mappedUsers,
    roleDistribution: {
      superAdmin: superAdminCount,
      adminDaycare: adminDaycareCount,
      staff: staffCount,
      parent: parentCount,
    },
    typeDistribution,
  };
}
