"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Cake,
  Send,
  Gift,
  Calendar,
  PartyPopper,
} from "lucide-react";
import type { BirthdayEntry } from "@/server/actions/birthdays";
import { getTenantProfile } from "@/server/actions/adminDashboard";

interface BirthdaysProps {
  entries: BirthdayEntry[];
}

function normalizePhoneForWa(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) {
    return "62" + digits.slice(1);
  }
  if (digits.startsWith("62")) {
    return digits;
  }
  return digits;
}

function formatBirthdayDate(birthDateStr: string, turningAge: number): string {
  const [bYear, bMonth, bDay] = birthDateStr.split("-").map(Number);
  const targetYear = bYear + turningAge;
  const isLeap =
    (targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0;

  let targetMonth = bMonth;
  let targetDay = bDay;
  if (bMonth === 2 && bDay === 29 && !isLeap) {
    targetMonth = 3;
    targetDay = 1;
  }

  const d = new Date(targetYear, targetMonth - 1, targetDay, 12, 0, 0);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function getCountdownBadge(daysUntil: number): {
  label: string;
  variant: "highlight" | "warning" | "info" | "muted";
} {
  if (daysUntil === 0) {
    return { label: "Hari ini! 🎉", variant: "highlight" };
  }
  if (daysUntil === 1) {
    return { label: "H-1 (Besok)", variant: "warning" };
  }
  if (daysUntil <= 7) {
    return { label: `H-${daysUntil}`, variant: "info" };
  }
  return { label: `H-${daysUntil}`, variant: "muted" };
}

export default function Birthdays({ entries }: BirthdaysProps) {
  const { data: tenantProfile } = useQuery({
    queryKey: ["tenant-profile"],
    queryFn: () => getTenantProfile(),
  });
  const daycareName = tenantProfile?.name || "Lembaga Daycare";

  const todayBirthdays = entries.filter((b) => b.daysUntil === 0);
  const weekBirthdays = entries.filter((b) => b.daysUntil <= 7);

  return (
    <DashboardLayout
      title="Ulang Tahun"
      subtitle="Kelola ucapan dan reminder ulang tahun siswa"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card
          variant="flat"
          className={
            todayBirthdays.length > 0
              ? "bg-highlight/10 border-highlight/30"
              : "bg-muted/20"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-highlight/15 flex items-center justify-center">
                <PartyPopper className="h-5 w-5 text-highlight" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {todayBirthdays.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ulang Tahun Hari Ini
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {weekBirthdays.length}
                </p>
                <p className="text-xs text-muted-foreground">7 Hari ke Depan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="flat">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Cake className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {entries.length}
                </p>
                <p className="text-xs text-muted-foreground">30 Hari ke Depan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Birthdays Highlight */}
      {todayBirthdays.length > 0 && (
        <Card className="mb-6 border-highlight/30 bg-highlight/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-highlight" />
              <CardTitle>Hari Ini 🎂</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayBirthdays.map((student) => {
                const waPhone = normalizePhoneForWa(student.parentPhone);
                return (
                  <div
                    key={student.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-background border border-highlight/30 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar size="xl">
                          <AvatarFallback className="bg-highlight/20 text-highlight font-bold">
                            {student.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-highlight flex items-center justify-center">
                          <Gift className="h-4 w-4 text-highlight-foreground" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">
                          {student.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {student.className ?? "Belum terdaftar kelas"}
                        </p>
                        <p className="text-sm font-semibold text-highlight">
                          Genap {student.turningAge} tahun hari ini! 🎂
                        </p>
                        {student.parentName && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Ortu: {student.parentName}
                          </p>
                        )}
                      </div>
                    </div>

                    {waPhone ? (
                      <Button
                        asChild
                        variant="hero"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <a
                          href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                            `Halo Ayah/Bunda ${student.parentName || ""}, segenap keluarga besar ${daycareName} mengucapkan Selamat Ulang Tahun yang ke-${student.turningAge} untuk ananda ${student.name}! Semoga sehat, ceria, dan tumbuh optimal selalu! 🎂🎉`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Kirim Ucapan
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="w-full sm:w-auto opacity-50 cursor-not-allowed"
                        title="Nomor telepon orang tua belum tersedia"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Kirim Ucapan
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 30 Days Ahead List or Empty State */}
      {entries.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Cake className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Tidak Ada Ulang Tahun Mendatang
            </h3>
            <p className="text-sm text-muted-foreground">
              Tidak ada siswa aktif yang berulang tahun dalam 30 hari ke depan.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>30 Hari ke Depan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entries.map((student) => {
                const { label, variant } = getCountdownBadge(student.daysUntil);
                const waPhone = normalizePhoneForWa(student.parentPhone);
                const formattedDate = formatBirthdayDate(
                  student.birthDate,
                  student.turningAge
                );

                return (
                  <div
                    key={student.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/40"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar size="lg">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {student.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {student.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {student.className ?? "Belum terdaftar kelas"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formattedDate} • Menjadi {student.turningAge} tahun
                        </p>
                        {student.parentName && (
                          <p className="text-xs text-muted-foreground/80 mt-0.5">
                            Ortu: {student.parentName}
                            {student.parentPhone ? ` (${student.parentPhone})` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:ml-auto">
                      <Badge variant={variant}>{label}</Badge>
                      {waPhone ? (
                        <Button asChild variant="soft" size="sm">
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                              `Halo Ayah/Bunda ${student.parentName || ""}, segenap keluarga besar ${daycareName} mengucapkan Selamat Menyambut Ulang Tahun yang ke-${student.turningAge} untuk ananda ${student.name}! Semoga senantiasa sehat dan ceria selalu! 🎂🎉`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Kirim Ucapan</span>
                            <span className="sm:hidden">Kirim</span>
                          </a>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="opacity-50 cursor-not-allowed text-xs"
                          title="Nomor telepon orang tua belum tersedia"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Kirim Ucapan</span>
                          <span className="sm:hidden">Kirim</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
