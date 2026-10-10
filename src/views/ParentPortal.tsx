"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Bell,
  MessageCircle,
  User,
  Heart,
  MessageSquare,
  Search,
  Plus,
  Image as ImageIcon,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Moon,
  Clock,
  CreditCard,
  GraduationCap,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { PromoBanner } from "@/components/promo/PromoBanner";
import { ParentActivityWidget } from "@/components/dashboard/ParentActivityWidget";
import { ProgramInfoBanner } from "@/components/parent/ProgramInfoBanner";
import { TrialStatusList } from "@/components/parent/TrialStatusList";
import { AnnouncementsCard } from "@/components/parent/AnnouncementsCard";
import type { AnnouncementItem } from "@/components/parent/AnnouncementsCard";
import { todayInWib } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { TrialApplicationRow } from "@/server/actions/trial";
import type { ReportRow } from "@/server/actions/dailyReports";
import type { ParentChildData } from "@/server/actions/parentChildren";

function formatReportDate(dateStr: string): string {
  if (!dateStr) return "";
  const today = todayInWib();
  const yesterday = todayInWib(new Date(Date.now() - 86400000));
  if (dateStr === today) return "Hari ini";
  if (dateStr === yesterday) return "Kemarin";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return format(d, "d MMMM yyyy", { locale: idLocale });
  } catch {
    return dateStr;
  }
}

function formatReportTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return format(d, "HH:mm");
  } catch {
    return "";
  }
}

function formatMood(mood?: string | null): string {
  if (!mood) return "";
  const trimmed = mood.trim();
  const lower = trimmed.toLowerCase();
  if (
    trimmed.startsWith("😊") ||
    trimmed.startsWith("😐") ||
    trimmed.startsWith("😢") ||
    trimmed.startsWith("😴") ||
    trimmed.startsWith("🤒")
  ) {
    return trimmed;
  }
  if (lower === "senang" || lower.includes("ceria") || lower.includes("happy")) {
    return `😊 ${trimmed}`;
  }
  if (lower === "biasa" || lower.includes("normal") || lower.includes("calm")) {
    return `😐 ${trimmed}`;
  }
  if (lower === "sedih" || lower.includes("sad")) {
    return `😢 ${trimmed}`;
  }
  if (lower === "lelah" || lower.includes("capek") || lower.includes("tired")) {
    return `😴 ${trimmed}`;
  }
  if (lower.includes("sehat") || lower.includes("sakit") || lower.includes("sick")) {
    return `🤒 ${trimmed}`;
  }
  return trimmed;
}

interface ParentPortalProps {
  childrenList?: ParentChildData[];
  trialStatus?: TrialApplicationRow[];
  reports?: ReportRow[];
  announcements?: AnnouncementItem[];
}

export default function ParentPortal({
  childrenList = [],
  trialStatus = [],
  reports = [],
  announcements = [],
}: ParentPortalProps) {
  const [activeTab, setActiveTab] = useState<"feed" | "progress" | "gallery">("feed");
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  const hasChildren = childrenList.length > 0;
  const activeChild = hasChildren
    ? childrenList[selectedChildIndex] || childrenList[0]
    : null;

  // Filter laporan harian sesuai anak yang sedang aktif dipilih
  const displayedReports = activeChild
    ? reports.filter((r) => r.studentId === activeChild.id)
    : reports;

  // Kumpulkan foto aktual anak aktif
  const childPhotos = activeChild?.recentPhotos || [];
  const reportPhotos = displayedReports.flatMap((r) => r.photos || []);
  const galleryPhotos = Array.from(new Set([...childPhotos, ...reportPhotos]));

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">MAJIKU</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/parent/chat">
              <Button variant="ghost" size="icon-sm">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Child Profile Bar / Empty State Header */}
        {hasChildren && activeChild ? (
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar size="lg" className="ring-2 ring-primary ring-offset-2">
                  <AvatarImage src={activeChild.avatar || undefined} />
                  <AvatarFallback>{activeChild.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {activeChild.attendanceToday && (
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center border-2 border-background">
                    <span className="text-[10px] text-white">✓</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-foreground truncate">{activeChild.name}</h2>
                  {childrenList.length > 1 && (
                    <select
                      className="text-xs bg-muted border border-border rounded px-1 py-0.5"
                      value={selectedChildIndex}
                      onChange={(e) => setSelectedChildIndex(Number(e.target.value))}
                    >
                      {childrenList.map((c, i) => (
                        <option key={c.id} value={i}>
                          {c.nickname}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{activeChild.className}</p>
              </div>
              <div className="text-right shrink-0">
                <Badge
                  variant={activeChild.attendanceToday ? "success" : "secondary"}
                  className="text-xs"
                >
                  {activeChild.attendanceToday ? "Hadir" : "Belum Hadir"}
                </Badge>
                {activeChild.checkInTime && (
                  <p className="text-xs text-muted-foreground mt-1">Check-in: {activeChild.checkInTime}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-foreground text-sm">Selamat Datang di MAJIKU</h2>
                <p className="text-xs text-muted-foreground">Akun Anda belum memiliki anak yang terdaftar di kelas.</p>
              </div>
              <Link href="/parent/registration" className="shrink-0">
                <Button size="sm" variant="default" className="text-xs">
                  Daftar Trial
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto">
          <Link href="/parent/registration">
            <Button variant="default" size="sm" className="flex-shrink-0 gap-2">
              <Plus className="h-4 w-4" />
              Daftar Program / Trial
            </Button>
          </Link>
          <Link href="/parent/billing">
            <Button variant="outline" size="sm" className="flex-shrink-0 gap-2">
              <CreditCard className="h-4 w-4" />
              Tagihan & SPP
            </Button>
          </Link>
          <Link href="/parent/chat">
            <Button variant="outline" size="sm" className="flex-shrink-0 gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat Tutor
            </Button>
          </Link>
          <Link href="/parent/marketplace">
            <Button variant="outline" size="sm" className="flex-shrink-0 gap-2">
              <Search className="h-4 w-4" />
              Eksplorasi Cabang
            </Button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          {[
            { id: "feed", label: "Feed", icon: Home },
            { id: "progress", label: "Progress", icon: TrendingUp },
            { id: "gallery", label: "Galeri", icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {activeTab === "feed" && (
          <div className="max-w-lg mx-auto">
            {/* Quick Stats jika punya anak */}
            {hasChildren && activeChild && (
              <div className="flex gap-4 p-4 overflow-x-auto">
                <div className="flex-shrink-0 w-24 h-20 rounded-xl bg-primary/10 flex flex-col items-center justify-center p-2 border border-border/50">
                  <span className="text-[11px] text-muted-foreground">Status</span>
                  <span className="text-xs font-bold text-foreground mt-1">
                    {activeChild.attendanceToday ? "Hadir ✓" : "Belum Masuk"}
                  </span>
                </div>
                <div className="flex-shrink-0 w-24 h-20 rounded-xl bg-info/10 flex flex-col items-center justify-center p-2 border border-border/50">
                  <span className="text-[11px] text-muted-foreground">Kelas</span>
                  <span className="text-xs font-bold text-foreground mt-1 truncate max-w-[80px]">
                    {activeChild.className}
                  </span>
                </div>
                <div className="flex-shrink-0 w-24 h-20 rounded-xl bg-highlight/10 flex flex-col items-center justify-center p-2 border border-border/50">
                  <span className="text-[11px] text-muted-foreground">Laporan</span>
                  <span className="text-xs font-bold text-foreground mt-1">
                    {reports.length} Catatan
                  </span>
                </div>
                <div className="flex-shrink-0 w-24 h-20 rounded-xl bg-success/10 flex flex-col items-center justify-center p-2 border border-border/50">
                  <span className="text-[11px] text-muted-foreground">Usia</span>
                  <span className="text-xs font-bold text-foreground mt-1">{activeChild.age} Tahun</span>
                </div>
              </div>
            )}

            {/* Jika belum ada anak dan belum ada trial */}
            {!hasChildren && trialStatus.length === 0 && (
              <div className="p-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-highlight/5">
                  <CardContent className="p-6 text-center">
                    <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h3 className="font-bold text-base text-foreground mb-1">Mulai Petualangan Anak Anda</h3>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Daftarkan anak Anda untuk mengikuti trial session di daycare MAJIKU. Tutor profesional kami siap membimbing tumbuh kembang buah hati.
                    </p>
                    <Link href="/parent/registration">
                      <Button className="w-full text-xs">Daftar Trial Sekarang</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Trial Status Card */}
            {trialStatus.length > 0 && (
              <div className="p-4 pt-2">
                <TrialStatusList applications={trialStatus} />
              </div>
            )}

            {/* Program Info */}
            <div className="px-4 pb-4">
              <ProgramInfoBanner />
            </div>

            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="px-4 pb-4">
                <AnnouncementsCard announcements={announcements} />
              </div>
            )}

            {/* Daily Reports Feed */}
            <div className="p-4 space-y-4">
              <h3 className="font-bold text-base text-foreground">
                Laporan Aktivitas Harian {activeChild ? `— ${activeChild.name}` : ""}
              </h3>

              {displayedReports.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Belum ada laporan aktivitas</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Laporan harian yang dibuat oleh tutor akan otomatis tampil di sini.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                displayedReports.map((report) => {
                  const dateStr = formatReportDate(report.reportDate);
                  const timeStr = formatReportTime(report.createdAt);
                  const moodDisplay = formatMood(report.mood);

                  return (
                    <Card key={report.id} className="overflow-hidden border-border/80">
                      <CardContent className="p-4">
                        {/* Report Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">
                              {report.studentName || (activeChild?.name ?? "Siswa")}
                            </span>
                            {report.className && (
                              <Badge variant="outline" className="text-xs font-normal">
                                {report.className}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground" suppressHydrationWarning>{dateStr}</span>
                        </div>

                        {/* Badges / Mood / Nap / Meal */}
                        {(moodDisplay || report.meals || report.nap) && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {moodDisplay && (
                              <Badge variant="secondary" className="text-xs font-normal">
                                {moodDisplay}
                              </Badge>
                            )}
                            {report.meals && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-normal flex items-center gap-1"
                              >
                                <Utensils className="h-3 w-3" />
                                <span>Makan: {report.meals}</span>
                              </Badge>
                            )}
                            {report.nap && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 font-normal flex items-center gap-1"
                              >
                                <Moon className="h-3 w-3" />
                                <span>Tidur: {report.nap}</span>
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Activities */}
                        {report.activities && (
                          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                            {report.activities}
                          </p>
                        )}

                        {/* Notes */}
                        {report.notes && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground block mb-0.5">
                              Catatan Tutor:
                            </span>
                            <p className="whitespace-pre-line leading-relaxed">{report.notes}</p>
                          </div>
                        )}

                        {/* Photos */}
                        {report.photos && report.photos.length > 0 && (
                          <div
                            className={cn(
                              "mt-3 grid gap-2",
                              report.photos.length === 1
                                ? "grid-cols-1"
                                : report.photos.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-2 sm:grid-cols-3"
                            )}
                          >
                            {report.photos.map((photoKey) => (
                              <div
                                key={photoKey}
                                className="relative aspect-video sm:aspect-square rounded-lg overflow-hidden bg-muted border border-border/60"
                              >
                                <img
                                  src={`/api/photos/${photoKey}`}
                                  alt="Foto laporan"
                                  className="w-full h-full object-cover transition-transform hover:scale-105"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground" suppressHydrationWarning>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Ditulis oleh tutor{timeStr ? ` • ${timeStr}` : ""}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="max-w-lg mx-auto p-4 space-y-4">
            {displayedReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-40 text-primary" />
                  <h3 className="font-bold text-foreground text-sm mb-1">Belum Ada Catatan Progres</h3>
                  <p className="text-xs leading-relaxed">
                    Ringkasan perkembangan anak, rekap makan, tidur, dan aktivitas akan dikompilasi secara otomatis setelah tutor mengisi laporan harian.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-bold text-base">Rekap Aktivitas Terkini</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/40 border">
                      <span className="text-xs text-muted-foreground">Total Laporan</span>
                      <p className="text-xl font-bold text-foreground mt-1">{displayedReports.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border">
                      <span className="text-xs text-muted-foreground">Dokumentasi Foto</span>
                      <p className="text-xl font-bold text-foreground mt-1">{galleryPhotos.length}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-muted-foreground">Aktivitas Terakhir:</span>
                    {displayedReports.slice(0, 3).map((r) => (
                      <div key={r.id} className="p-3 rounded-lg bg-muted/20 border text-xs">
                        <div className="flex justify-between font-medium text-foreground mb-1">
                          <span>{r.studentName}</span>
                          <span className="text-muted-foreground">{formatReportDate(r.reportDate)}</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{r.activities || "Aktivitas belajar dan bermain."}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="p-4 max-w-lg mx-auto">
            {galleryPhotos.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-40 text-primary" />
                  <h3 className="font-bold text-foreground text-sm mb-1">Belum Ada Foto Kegiatan</h3>
                  <p className="text-xs leading-relaxed">
                    Foto kegiatan buah hati selama di sekolah akan tampil di galeri ini segera setelah diunggah oleh tutor.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {galleryPhotos.map((photoKey, index) => (
                  <div key={index} className="aspect-square relative rounded-lg overflow-hidden border bg-muted group">
                    <img
                      src={`/api/photos/${photoKey}`}
                      alt="Foto kegiatan siswa"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === "feed" ? "text-primary" : "text-muted-foreground"}`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs">Beranda</span>
          </button>
          <Link href="/parent/marketplace" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs">Marketplace</span>
          </Link>
          <Link href="/parent/billing" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <CreditCard className="h-6 w-6" />
            <span className="text-xs">Tagihan</span>
          </Link>
          <Link href="/parent/chat" className="flex flex-col items-center gap-1 p-2 text-muted-foreground relative">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs">Chat</span>
          </Link>
          <Link href="/parent/profile" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <User className="h-6 w-6" />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
