"use client";

import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { TutorLayout } from "@/components/layout/TutorLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute role="tutor">
      <TutorLayout>{children}</TutorLayout>
    </RoleProtectedRoute>
  );
}
