import AdminAuth from "@/views/auth/AdminAuth";

export const metadata = {
  title: "Masuk Admin Daycare | Bunayo",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminAuth initialMode="login" />;
}
