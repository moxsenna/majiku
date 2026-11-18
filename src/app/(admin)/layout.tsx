"use client";

import { useQuery } from "@tanstack/react-query";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { AdminShell } from "@/components/bunayo/AdminShell";
import { adminMobileTabs, adminNav, adminSettingsNav } from "@/components/bunayo/adminNav";
import { useAuth } from "@/hooks/useAuth";
import { getTenantProfile } from "@/server/actions/adminDashboard";
import { istilahLembaga, LABEL_JENIS_LEMBAGA, type JenisLembaga } from "@/lib/istilah";

/**
 * Shell admin dipasang sekali di sini; gerbang peran ada di dalam shell sehingga saat sesi
 * dimuat pengguna melihat kerangka halaman, bukan spinner layar penuh (N31).
 * Middleware tetap menolak tamu tanpa sesi sebelum halaman ini dirender.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const { data: tenant } = useQuery({
    queryKey: ["tenant-profile"],
    queryFn: getTenantProfile,
    staleTime: 5 * 60_000,
    enabled: isAdmin,
  });
  const jenis = (tenant?.type as JenisLembaga | undefined) ?? null;
  const orgSub = [jenis ? LABEL_JENIS_LEMBAGA[jenis] : null, tenant?.city].filter(Boolean).join(" · ");

  return (
    <AdminShell
      nav={adminNav(istilahLembaga(jenis))}
      settings={adminSettingsNav}
      mobileTabs={adminMobileTabs}
      org={tenant ? { name: tenant.name, sub: orgSub } : null}
      user={user ? { name: user.name || user.email, role: "Pemilik" } : null}
      onSignOut={async () => {
        await signOut();
        window.location.href = "/admin/login";
      }}
    >
      <RoleProtectedRoute role="admin">{children}</RoleProtectedRoute>
    </AdminShell>
  );
}
