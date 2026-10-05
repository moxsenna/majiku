"use client";

import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import VendorDashboard from "@/views/VendorDashboard";

export default function Page() {
  return (
    <RoleProtectedRoute role="admin">
      <VendorDashboard />
    </RoleProtectedRoute>
  );
}
