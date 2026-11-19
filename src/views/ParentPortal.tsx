"use client";

import Link from "next/link";
import { ChevronRight, Eye, MessageCircle, Megaphone, Moon, Puzzle, Smile, Sprout, StickyNote, Utensils, type LucideIcon } from "lucide-react";
import { TrialStatusList } from "@/components/parent/TrialStatusList";
import { NotificationBell } from "@/components/bunayo/NotificationBell";
import type { AnnouncementItem } from "@/components/parent/AnnouncementsCard";
import { todayInWib } from "@/lib/datetime";
import { formatJam, formatRelatif, formatTanggal } from "@/lib/format";
import { KELAS_KRAYON, krayonDari, type Krayon } from "@/lib/krayon";
import { cn } from "@/lib/utils";
import { BunayoMark, KidAvatar, KidSwitcher, MobileGroupTitle, RoundIconButton, useActiveKid } from "@/components/bunayo";
import type { TrialApplicationRow } from "@/server/actions/trial";
import type { ReportRow } from "@/server/actions/dailyReports";
import type { ParentChildData } from "@/server/actions/parentChildren";

const foto = (key: string) => (key.startsWith("/") || key.startsWith("http") ? key : `/api/photos/${key}`);
const panggilanDari = (c: ParentChildData) => (c.nickname || c.name).trim().split(/\s+/)[0];

function labelHari(tanggal: string): string {
  if (tanggal === todayInWib()) return "Hari ini";
  if (tanggal === todayInWib(new Date(Date.now() - 86_400_000))) return "Kemarin";
  return formatTanggal(tanggal, { tanpaTahun: true });
}

/** "Kabar hari ini", "Kabar kemarin", "Kabar 17 Nov". */
const judulKabar = (tanggal: string) => {
  const l = labelHari(tanggal);
  return `Kabar ${/^\d/.test(l) ? l : l.toLowerCase()}`;
};

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
  const { activeKidId, setActiveKidId } = useActiveKid();
  const anak = childrenList.find((c) => c.id === activeKidId) ?? childrenList[0] ?? null;

  const laporan = anak ? reports.filter((r) => r.studentId === anak.id) : reports;
  const terbaru = laporan[0] ?? null;
  const sebelumnya = laporan.slice(1, 6);
  const fotoLaporan = laporan.flatMap((r) => r.photos ?? []);
  const galeri = Array.from(new Set([...fotoLaporan, ...(anak?.recentPhotos ?? [])]));
  const fotoUtama = terbaru?.photos?.[0] ?? galeri[0] ?? null;
  const galeriLain = galeri.filter((k) => k !== fotoUtama);
  const trialBerjalan = trialStatus.filter((t) => t.status !== "admitted" && t.status !== "not_suitable");

  return (
    <div className="flex flex-col gap-5 px-4 pb-4">
      <header className="flex min-h-16 items-center justify-between gap-3 pt-2">
        {childrenList.length > 1 ? (
          <KidSwitcher
            kids={childrenList.map((c) => ({ id: c.id, name: c.nickname || c.name, photoUrl: c.avatar }))}
            activeId={anak?.id ?? null}
            onChange={setActiveKidId}
          />
        ) : (
          <BunayoMark height={36} />
        )}
        {anak && (
          <span className="flex items-center gap-2">
            <NotificationBell />
            <RoundIconButton icon={MessageCircle} label="Pesan guru" href="/parent/chat" />
          </span>
        )}
      </header>

      {anak?.id?.includes("demo") && (
        <div className="flex items-center justify-between rounded-sheet bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-xs text-amber-700 dark:text-amber-400">
          <span className="flex items-center gap-2 font-medium">
            <Eye className="h-4 w-4" aria-hidden />
            <span>Mode Demo Orang Tua: Aisyah Putri</span>
          </span>
          <span className="text-[11px] opacity-80">Simulasi Aman</span>
        </div>
      )}

      {anak ? (
        <>
          <Sorotan anak={anak} laporan={terbaru} fotoUtama={fotoUtama} />

          <section className="rise rise-2 flex flex-col gap-2.5" aria-labelledby="kabar-judul">
            <h2 id="kabar-judul" className="px-1 font-display text-lg font-bold tracking-tight">
              {terbaru ? judulKabar(terbaru.reportDate) : "Kabar hari ini"}
            </h2>
            {terbaru ? (
              <LaporanHari laporan={terbaru} kecuali={fotoUtama} />
            ) : (
              <div className="rounded-sheet bg-card p-5">
                <p className="text-[15px] font-semibold">Belum ada kabar dari guru</p>
                <p className="mt-1 text-sm text-foreground-2">
                  Begitu guru mencatat makan, tidur, dan kegiatan {panggilanDari(anak)}, kabarnya muncul di sini.
                </p>
              </div>
            )}
          </section>

          {galeriLain.length > 0 && (
            <section className="flex flex-col gap-2.5" aria-labelledby="foto-judul">
              <h2 id="foto-judul" className="px-1 font-display text-lg font-bold tracking-tight">
                Foto {panggilanDari(anak)}
              </h2>
              <div className="-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
                {galeriLain.slice(0, 12).map((key) => (
                  <a
                    key={key}
                    href={foto(key)}
                    target="_blank"
                    rel="noreferrer"
                    className="press relative aspect-[4/5] w-[42%] shrink-0 snap-start overflow-hidden rounded-sheet bg-muted"
                  >
                    <img src={foto(key)} alt={`Foto kegiatan ${panggilanDari(anak)}`} loading="lazy" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {announcements.length > 0 && <Pengumuman items={announcements} />}

          {sebelumnya.length > 0 && (
            <section className="flex flex-col gap-2" aria-labelledby="lalu-judul">
              <MobileGroupTitle>
                <span id="lalu-judul">Kabar sebelumnya</span>
              </MobileGroupTitle>
              <ul className="overflow-hidden rounded-sheet bg-card">
                {sebelumnya.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0">
                    <span className="w-16 shrink-0 text-[13px] font-semibold text-muted-foreground" suppressHydrationWarning>
                      {labelHari(r.reportDate)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[15px]">
                      {r.activities || r.notes || [r.meals && `Makan ${r.meals}`, r.nap && `Tidur ${r.nap}`].filter(Boolean).join(" · ") || "Laporan harian"}
                    </span>
                    {(r.photos?.length ?? 0) > 0 && (
                      <span className="tabular shrink-0 text-[13px] text-muted-foreground">{r.photos!.length} foto</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link href="/parent/registration" className="press flex items-center gap-3 rounded-sheet bg-card px-4 py-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-daun-soft text-daun-ink">
              <Sprout className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">Daftar program lain</span>
              <span className="block text-[13px] text-muted-foreground">Kelas tambahan atau adik {panggilanDari(anak)}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden />
          </Link>

          {trialBerjalan.length > 0 && (
            <section className="flex flex-col gap-2">
              <MobileGroupTitle>Pendaftaran</MobileGroupTitle>
              <TrialStatusList applications={trialBerjalan} />
            </section>
          )}
        </>
      ) : (
        <>
          <section className="rise field-ink flex flex-col gap-3 rounded-[28px] bg-matahari p-6">
            <span aria-hidden className="flex gap-1.5">
              {(["tomat", "langit", "daun"] as const).map((k) => (
                <i key={k} className={cn("block h-3.5 w-3.5 rounded-full", KELAS_KRAYON[k].bg)} />
              ))}
            </span>
            <h1 className="font-display text-[26px] font-bold leading-[1.1] tracking-[-0.025em]">
              {trialStatus.length > 0 ? "Pendaftaran sedang diproses" : "Selamat datang di Bunayo"}
            </h1>
            <p className="field-sub text-[15px] leading-relaxed">
              {trialStatus.length > 0
                ? "Status trial anak Anda ada di bawah. Kabar harian muncul di sini setelah anak terdaftar di kelas."
                : "Akun Anda belum terhubung dengan anak di kelas. Daftarkan trial, atau minta lembaga menautkan akun ini ke data anak Anda."}
            </p>
            {trialStatus.length === 0 && (
              <Link
                href="/parent/registration"
                className="press mt-1 grid h-btn-lg place-items-center rounded-full bg-foreground text-base font-semibold text-background dark:bg-[hsl(249_26%_14%)] dark:text-[hsl(40_60%_96%)]"
              >
                Daftar trial
              </Link>
            )}
          </section>
          {trialStatus.length > 0 && <TrialStatusList applications={trialStatus} />}
          {announcements.length > 0 && <Pengumuman items={announcements} />}
        </>
      )}
    </div>
  );
}

/* ---------------- Sorotan: foto terbaru dari guru + status tiba ---------------- */

function Sorotan({ anak, laporan, fotoUtama }: { anak: ParentChildData; laporan: ReportRow | null; fotoUtama: string | null }) {
  const k = KELAS_KRAYON[krayonDari(anak.id)];
  const panggilan = panggilanDari(anak);

  const status = (
    <span className="inline-flex h-8 items-center gap-2 self-start rounded-full bg-card px-3 text-[13px] font-semibold text-foreground shadow-soft">
      <span className={cn("h-2 w-2 rounded-full", anak.attendanceToday ? "tiba-dot bg-success-ring text-success-ring" : "bg-input")} />
      {anak.attendanceToday ? (
        <span>
          Sudah tiba{anak.checkInTime && <span className="tabular"> · {formatJam(anak.checkInTime)}</span>}
        </span>
      ) : (
        "Belum tiba hari ini"
      )}
    </span>
  );

  if (fotoUtama) {
    return (
      <section className="rise relative isolate flex aspect-[4/5] max-h-[460px] w-full flex-col justify-between overflow-hidden rounded-[28px] bg-muted p-4">
        <img src={foto(fotoUtama)} alt={`Foto terbaru ${panggilan} dari guru`} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-gradient-to-t from-[hsl(249_26%_10%/.82)] to-transparent" />
        {status}
        <div className="flex flex-col gap-1 text-[hsl(40_60%_96%)]">
          <span className="text-[13px] font-medium opacity-85" suppressHydrationWarning>
            {anak.className}
            {laporan?.createdAt && ` · ${formatRelatif(laporan.createdAt)}`}
          </span>
          <h1 className="font-display text-[30px] font-extrabold leading-none tracking-[-0.03em]">{panggilan}</h1>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("rise field-ink relative flex flex-col gap-3 overflow-hidden rounded-[28px] p-5", k.bg)}>
      {status}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="field-sub block text-sm font-semibold">{anak.className}</span>
          <h1 className="font-display text-[30px] font-extrabold leading-none tracking-[-0.03em]">{panggilan}</h1>
        </div>
        <KidAvatar id={anak.id} name={anak.nickname || anak.name} photoUrl={anak.avatar} size="xl" className="shrink-0 bg-[hsl(0_0%_100%/.5)] ring-4 ring-[hsl(0_0%_100%/.55)]" />
      </div>
    </section>
  );
}

/* ---------------- Laporan harian sebagai linimasa krayon ---------------- */

function LaporanHari({ laporan: r, kecuali }: { laporan: ReportRow; kecuali?: string | null }) {
  const fotoLain = (r.photos ?? []).filter((k) => k !== kecuali);
  const baris: { key: string; icon: LucideIcon; krayon: Krayon; title: string; detail: string }[] = [];
  if (r.activities) baris.push({ key: "main", icon: Puzzle, krayon: "daun", title: "Kegiatan", detail: r.activities });
  if (r.meals) baris.push({ key: "makan", icon: Utensils, krayon: "tomat", title: "Makan", detail: r.meals });
  if (r.nap) baris.push({ key: "tidur", icon: Moon, krayon: "anggur", title: "Tidur", detail: r.nap });
  if (r.mood) baris.push({ key: "mood", icon: Smile, krayon: "matahari", title: "Suasana hati", detail: r.mood });
  if (r.notes) baris.push({ key: "catatan", icon: StickyNote, krayon: "langit", title: "Catatan guru", detail: r.notes });

  return (
    <div className="flex flex-col gap-4 rounded-sheet bg-card p-4">
      {baris.length > 0 ? (
        <ul className="flex flex-col gap-3.5">
          {baris.map(({ key, icon: Icon, krayon, title, detail }) => (
            <li key={key} className="flex gap-3">
              <Icon className={cn("mt-0.5 h-6 w-6 shrink-0", KELAS_KRAYON[krayon].ink)} aria-hidden />
              <span className="min-w-0">
                <b className="block text-[15px]">{title}</b>
                <span className="block whitespace-pre-line text-[15px] text-foreground-2">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[15px] text-foreground-2">Guru mengirim laporan tanpa catatan.</p>
      )}
      {fotoLain.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {fotoLain.slice(0, 6).map((key) => (
            <a key={key} href={foto(key)} target="_blank" rel="noreferrer" className="press aspect-square overflow-hidden rounded-[12px] bg-muted">
              <img src={foto(key)} alt="Foto laporan" loading="lazy" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )}
      {r.createdAt && (
        <span className="tabular text-[13px] text-muted-foreground" suppressHydrationWarning>
          Dikirim guru pukul {formatJam(r.createdAt)}
        </span>
      )}
    </div>
  );
}

/* ---------------- Pengumuman ---------------- */

function Pengumuman({ items }: { items: AnnouncementItem[] }) {
  return (
    <section className="flex flex-col gap-2" aria-labelledby="umum-judul">
      <MobileGroupTitle>
        <span id="umum-judul">Dari lembaga</span>
      </MobileGroupTitle>
      <ul className="overflow-hidden rounded-sheet bg-card">
        {items.slice(0, 3).map((a) => (
          <li key={a.id} className="flex gap-3 border-b border-border-subtle px-4 py-3.5 last:border-b-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-matahari-soft text-matahari-ink">
              <Megaphone className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">{a.title}</span>
              <span className="mt-0.5 line-clamp-2 block whitespace-pre-wrap text-sm text-foreground-2">{a.body}</span>
              {a.createdAt && (
                <span className="mt-1 block text-[13px] text-muted-foreground" suppressHydrationWarning>
                  {formatRelatif(a.createdAt)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
