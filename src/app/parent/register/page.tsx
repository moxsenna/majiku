import ParentAuth from "@/views/auth/ParentAuth";

export const metadata = {
  title: "Daftar Akun Orang Tua | MAJIKU",
  robots: { index: false, follow: false },
};

export default function ParentRegisterPage() {
  return <ParentAuth initialMode="register" />;
}
