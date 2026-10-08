import AdminAuth from "@/views/auth/AdminAuth";

export const metadata = {
  title: "Daftar Lembaga Daycare Baru | MAJIKU",
  robots: { index: false, follow: false },
};

export default function AdminRegisterPage() {
  return <AdminAuth initialMode="register" />;
}
