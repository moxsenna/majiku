"use client";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { ParentShell } from "@/components/bunayo/ParentShell";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ParentShell>
      <RoleProtectedRoute role="parent">{children}</RoleProtectedRoute>
    </ParentShell>
  );
}
