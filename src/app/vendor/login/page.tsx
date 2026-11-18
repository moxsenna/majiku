import VendorAuth from "@/views/auth/VendorAuth";

export const metadata = {
  title: "Masuk Super Admin Platform | Bunayo",
  robots: { index: false, follow: false },
};

export default function VendorLoginPage() {
  return <VendorAuth />;
}
