import VendorAuth from "@/views/auth/VendorAuth";

export const metadata = {
  title: "Masuk Super Admin Platform | MAJIKU",
  robots: { index: false, follow: false },
};

export default function VendorLoginPage() {
  return <VendorAuth />;
}
