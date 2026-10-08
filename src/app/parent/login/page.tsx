import ParentAuth from "@/views/auth/ParentAuth";

export const metadata = {
  title: "Masuk Portal Orang Tua | MAJIKU",
  robots: { index: false, follow: false },
};

export default function ParentLoginPage() {
  return <ParentAuth initialMode="login" />;
}
