"use client";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute role="tutor">
      {children}
    </RoleProtectedRoute>
  );
}
