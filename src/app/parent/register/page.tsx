import ParentAuth from "@/views/auth/ParentAuth";

export const metadata = {
  title: "Daftar Akun Orang Tua | Bunayo",
  robots: { index: false, follow: false },
};

export default function ParentRegisterPage() {
  return <ParentAuth initialMode="register" />;
}
