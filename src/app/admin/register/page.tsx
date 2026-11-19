import AdminAuth from "@/views/auth/AdminAuth";

export const metadata = {
  // Tanpa akhiran brand: layout root sudah menambahkan template "%s | Bunayo".
  title: "Daftar Lembaga Baru",
  robots: { index: false, follow: false },
};

export default function AdminRegisterPage() {
  return <AdminAuth initialMode="register" />;
}
