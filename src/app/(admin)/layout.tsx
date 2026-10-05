"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute role="admin">
      <DashboardLayout>{children}</DashboardLayout>
    </RoleProtectedRoute>
  );
}
