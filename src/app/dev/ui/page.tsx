import { notFound } from "next/navigation";
import { DevUiGallery } from "./DevUiGallery";

export const metadata = { title: "Komponen UI (dev)", robots: { index: false } };

// Halaman internal: hanya di development. Contoh teks di sini adalah label katalog komponen, bukan data akun.
export default function DevUiPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DevUiGallery />;
}
