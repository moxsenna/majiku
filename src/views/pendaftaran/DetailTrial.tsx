"use client";

import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { InfoBox, StatusDot } from "@/components/bunayo";
import { formatJam, formatTanggal, formatUmur } from "@/lib/format";
import { waLink } from "@/lib/keuangan";
import { statusTrial } from "@/lib/status";
import type { TrialItem } from "@/server/actions/pendaftaran";

const REKOMENDASI: Record<string, string> = {
  suitable: "Cocok",
  repeat_trial: "Trial ulang disarankan",
  not_suitable: "Belum cocok",
};

function Bagian({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-border px-6 py-4 first:border-t-foreground">
      <h4 className="font-display text-[17px] font-bold tracking-tight">{judul}</h4>
      {children}
    </section>
  );
}

/** A5 laci detail trial. Tombol mengikuti action yang ada; "Tidak lanjut…" + alasan disembunyikan (BARU). */
export function DetailTrial({
  trial,
  open,
  onOpenChange,
  bisaUbah,
  onJadwalkan,
  onDaftarkan,
  mendaftarkan,
}: {
  trial: TrialItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bisaUbah: boolean;
  onJadwalkan: (t: TrialItem) => void;
  onDaftarkan: (t: TrialItem) => void;
  mendaftarkan: boolean;
}) {
  const t = trial;
  const wa = t ? waLink(t.parentPhone) : null;
  const bisaDaftar = t?.status === "recommended" && t.recommendation === "suitable" && !!t.classId;
  const riwayat = t
    ? ([
        t.createdAt && [t.createdAt, "Diajukan"],
        t.trialScheduledAt && [t.trialScheduledAt, `Trial ${formatTanggal(t.trialScheduledAt, { hari: true, tanpaTahun: true })} ${formatJam(t.trialScheduledAt)}${t.tutorName ? ` · ${t.tutorName}` : ""}`],
        t.reviewedAt && [t.reviewedAt, `Observasi dicatat${t.tutorName ? ` ${t.tutorName}` : ""}`],
        t.admittedAt && [t.admittedAt, "Didaftarkan sebagai siswa"],
      ].filter(Boolean) as [string, string][])
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full max-w-[460px] flex-col gap-0 p-0 max-[560px]:max-w-full">
        {t && (
          <>
            <div className="flex flex-col gap-1.5 px-6 pb-4 pt-5">
              <StatusDot info={statusTrial(t.status)} size="sm" />
              <SheetTitle className="text-[30px] leading-tight">{t.childName}</SheetTitle>
              <SheetDescription>
                {[t.childBirthDate ? formatUmur(t.childBirthDate) : null, t.childGender, t.className ? `trial ${t.className}` : null].filter(Boolean).join(" · ") || "—"}
              </SheetDescription>
              {(wa || t.parentPhone) && (
                <span className="mt-1 flex flex-wrap gap-2">
                  {wa && (
                    <Button asChild variant="sec" size="sm">
                      <a href={wa} target="_blank" rel="noreferrer">
                        <MessageCircle aria-hidden />
                        WA {t.parentName?.split(" ").slice(0, 2).join(" ") ?? "wali"}
                      </a>
                    </Button>
                  )}
                  {t.parentPhone && (
                    <Button asChild variant="sec" size="sm">
                      <a href={`tel:${t.parentPhone.replace(/[^\d+]/g, "")}`}>
                        <Phone aria-hidden />
                        Telepon
                      </a>
                    </Button>
                  )}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <Bagian judul={`Catatan observasi${t.tutorName ? ` · ${t.tutorName}` : ""}`}>
                {t.observationNotes ? (
                  <>
                    {t.trialScheduledAt && (
                      <span className="tabular text-[13px] text-muted-foreground">
                        Trial {formatTanggal(t.trialScheduledAt)} {formatJam(t.trialScheduledAt)}
                      </span>
                    )}
                    <p className="text-[15px] leading-relaxed text-foreground-2">{t.observationNotes}</p>
                    {t.recommendation && (
                      <InfoBox>
                        <b>Rekomendasi:</b> {REKOMENDASI[t.recommendation] ?? t.recommendation}
                        {t.className && t.recommendation === "suitable" ? ` untuk ${t.className}` : ""}
                      </InfoBox>
                    )}
                  </>
                ) : (
                  <p className="text-[15px] text-muted-foreground">
                    {t.tahap === "diajukan"
                      ? "Belum dijadwalkan."
                      : t.tahap === "terjadwal"
                        ? "Guru menulis catatan dari aplikasinya setelah trial."
                        : "Menunggu catatan guru."}
                  </p>
                )}
              </Bagian>
              <Bagian judul="Data dari formulir">
                <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 text-[15px]">
                  <dt className="text-muted-foreground">Wali</dt>
                  <dd>
                    {t.parentName ?? "—"}
                    {t.parentPhone && <span className="tabular"> · {t.parentPhone}</span>}
                  </dd>
                  {t.parentEmail && (
                    <>
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="break-all">{t.parentEmail}</dd>
                    </>
                  )}
                  <dt className="text-muted-foreground">Alergi</dt>
                  <dd className={t.allergies ? "font-semibold text-destructive" : "text-muted-foreground"}>{t.allergies ?? "Tidak ada"}</dd>
                  {t.medicalNotes && (
                    <>
                      <dt className="text-muted-foreground">Kesehatan</dt>
                      <dd>{t.medicalNotes}</dd>
                    </>
                  )}
                  <dt className="text-muted-foreground">Ingin mulai</dt>
                  <dd className="tabular">{t.requestedStartDate ? formatTanggal(t.requestedStartDate) : "—"}</dd>
                  {t.address && (
                    <>
                      <dt className="text-muted-foreground">Alamat</dt>
                      <dd>{t.address}</dd>
                    </>
                  )}
                  {t.parentNotes && (
                    <>
                      <dt className="text-muted-foreground">Catatan wali</dt>
                      <dd>{t.parentNotes}</dd>
                    </>
                  )}
                </dl>
              </Bagian>
              {riwayat.length > 0 && (
                <Bagian judul="Riwayat">
                  <ul className="flex flex-col gap-1.5 text-[13px]">
                    {riwayat.map(([w, teks]) => (
                      <li key={teks}>
                        <span className="tabular text-muted-foreground">{formatTanggal(w, { tanpaTahun: true })}</span> · {teks}
                      </li>
                    ))}
                  </ul>
                </Bagian>
              )}
            </div>
            {bisaUbah && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background px-6 py-3.5">
                {(t.tahap === "diajukan" || t.tahap === "terjadwal") && (
                  <Button variant={t.tahap === "diajukan" ? "pri" : "sec"} onClick={() => onJadwalkan(t)}>
                    {t.tahap === "diajukan" ? "Jadwalkan trial" : "Ubah jadwal"}
                  </Button>
                )}
                {bisaDaftar && (
                  <Button onClick={() => onDaftarkan(t)} disabled={mendaftarkan}>
                    {mendaftarkan ? "Mendaftarkan…" : `Daftarkan ${t.childName.split(" ")[0]}`}
                  </Button>
                )}
                {t.admittedStudentId && (
                  <Button asChild variant="sec">
                    <Link href={`/students/${t.admittedStudentId}`}>Buka profil siswa</Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
