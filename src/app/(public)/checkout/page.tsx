import { Suspense } from "react";
import CheckoutView from "@/views/Checkout";

export const metadata = {
  title: "Checkout Berlangganan | MAJIKU",
  description:
    "Aktifkan paket langganan MAJIKU untuk daycare, preschool, dan bimbel Anda dengan pembayaran aman PayCore.",
};

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <CheckoutView />
    </Suspense>
  );
}
