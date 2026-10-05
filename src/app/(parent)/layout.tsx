"use client";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute role="parent">
      {children}
    </RoleProtectedRoute>
  );
}
