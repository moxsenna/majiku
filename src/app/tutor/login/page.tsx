import TutorAuth from "@/views/auth/TutorAuth";

export const metadata = {
  title: "Masuk Portal Pengajar / Tutor | Bunayo",
  robots: { index: false, follow: false },
};

export default function TutorLoginPage() {
  return <TutorAuth />;
}
