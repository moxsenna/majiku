import type { Metadata } from "next";
import TutorSaya from "@/views/TutorSaya";

export const metadata: Metadata = { title: "Saya" };

export default function Page() {
  return <TutorSaya />;
}
