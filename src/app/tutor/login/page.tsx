import TutorAuth from "@/views/auth/TutorAuth";

export const metadata = {
  title: "Masuk Portal Pengajar / Tutor | MAJIKU",
  robots: { index: false, follow: false },
};

export default function TutorLoginPage() {
  return <TutorAuth />;
}
