import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, PlusCircle, Users, GraduationCap, ArrowRight } from "lucide-react";

export function AdminOnboardingCard() {
  const steps = [
    {
      step: "1",
      title: "Buat Kelas Pertama",
      description: "Tentukan nama rombel/kelas, kapasitas siswa, dan jadwal belajar.",
      href: "/classes",
      cta: "Tambah Kelas",
      icon: GraduationCap,
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      step: "2",
      title: "Daftarkan Siswa Baru",
      description: "Masukkan data anak dan hubungkan dengan kontak orang tua.",
      href: "/students",
      cta: "Tambah Siswa",
      icon: Users,
      color: "bg-info/10 text-info border-info/20",
    },
    {
      step: "3",
      title: "Tugaskan Tutor / Pengajar",
      description: "Kelola profil guru dan hubungkan mereka ke kelas yang aktif.",
      href: "/tutors",
      cta: "Kelola Tutor",
      icon: PlusCircle,
      color: "bg-success/10 text-success border-success/20",
    },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-highlight/5 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Mulai Operasional Daycare Anda</CardTitle>
            <CardDescription>
              Selamat datang di portal admin MAJIKU! Ikuti 3 langkah awal berikut untuk mulai mengelola daycare secara digital.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {steps.map((item) => (
            <div
              key={item.step}
              className={`p-4 rounded-xl border ${item.color} bg-background/60 backdrop-blur-sm flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted">
                    Langkah {item.step}
                  </span>
                  <item.icon className="h-5 w-5 opacity-80" />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.description}</p>
              </div>
              <Link href={item.href}>
                <Button size="sm" variant="outline" className="w-full justify-between text-xs">
                  <span>{item.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
