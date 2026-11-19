"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, ErrorBanner, FilterChip, InfoBox, PageBody, PageHeader, Panel, PanelRow, StatusDot, Stepper } from "@/components/bunayo";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatPeriode, formatRupiah, formatTanggal, formatUmur } from "@/lib/format";
import { todayInWib } from "@/lib/datetime";
import { createStudent } from "@/server/actions/studentsCrud";
import { createInvoice, markInvoicePaid } from "@/server/actions/billing";
import type { KelasUntukDaftar, SiswaRow } from "@/server/actions/siswa";

const LANGKAH = ["Data anak", "Keluarga", "Kelas", "Tagihan pertama"];

interface Keluarga {
  key: string;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  tertaut: boolean;
  anak: string[];
}

function kelompokkanKeluarga(siswa: SiswaRow[]): Keluarga[] {
  const map = new Map<string, Keluarga>();
  for (const s of siswa) {
    const key = (s.wali.email?.toLowerCase() || s.wali.phone || "").trim();
    if (!key) continue;
    const k = map.get(key) ?? { key, parentName: s.wali.name, parentPhone: s.wali.phone, parentEmail: s.wali.email, tertaut: s.wali.tertaut, anak: [] };
    k.anak.push(s.kelas[0] ? `${s.name.split(" ")[0]} (${s.kelas[0].name})` : s.name.split(" ")[0]);
    k.tertaut ||= s.wali.tertaut;
    map.set(key, k);
  }
  return [...map.values()].sort((a, b) => (a.parentName ?? "").localeCompare(b.parentName ?? "", "id"));
}

function akhirBulan(tanggal: string) {
  const [y, m] = tanggal.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

function tambahHari(tanggal: string, n: number) {
  const [y, m, d] = tanggal.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function Field({ id, label, hint, children }: { id: string; label: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <span className="text-[13px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

/**
 * D1 Daftarkan anak (stepper 4 langkah). Memakai action yang sudah ada: createStudent, createInvoice, markInvoicePaid.
 * BARU yang disembunyikan: nama panggilan, jenis kelamin, alergi/kondisi medis, penjemput resmi, paket & diskon saudara,
 * prorata otomatis, kirim tagihan via WhatsApp, simpan draf (lihat REDESIGN-BACKLOG).
 */
export default function DaftarkanAnak({ kelas, siswa, galatMuat }: { kelas: KelasUntukDaftar[]; siswa: SiswaRow[]; galatMuat?: boolean }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const keluarga = useMemo(() => kelompokkanKeluarga(siswa), [siswa]);
  const hariIni = todayInWib();

  const [langkah, setLangkah] = useState(0);
  const [anak, setAnak] = useState({ name: "", dateOfBirth: "" });
  const [modeKeluarga, setModeKeluarga] = useState<"lama" | "baru">(keluarga.length ? "lama" : "baru");
  const [keluargaKey, setKeluargaKey] = useState<string | null>(null);
  const [wali, setWali] = useState({ parentName: "", parentPhone: "", parentEmail: "" });
  const [kelasId, setKelasId] = useState<string | null>(null);
  const [billingDay, setBillingDay] = useState(String(Math.min(28, Number(hariIni.slice(8, 10)))));
  const [sessionsQuota, setSessionsQuota] = useState("");
  const [tagih, setTagih] = useState<"terbit" | "tunai" | "nanti">("terbit");
  const [nominal, setNominal] = useState("");
  const [jatuhTempo, setJatuhTempo] = useState(tambahHari(hariIni, 7));
  const [galat, setGalat] = useState<string | null>(null);
  const [selesai, setSelesai] = useState<{ id: string; nama: string; kelas: string | null; tagihan: string | null } | null>(null);

  const kelasDipilih = kelas.find((k) => k.id === kelasId) ?? null;
  const waliAkhir = modeKeluarga === "lama" ? keluarga.find((k) => k.key === keluargaKey) : null;

  const pilihKelas = (k: KelasUntukDaftar) => {
    setKelasId(k.id);
    setSessionsQuota(k.sessionsPerMonth ? String(k.sessionsPerMonth) : "");
    setNominal(k.pricePerMonth ? String(k.pricePerMonth) : "");
  };

  const validasi = (): string | null => {
    if (langkah === 0 && !anak.name.trim()) return "Isi nama lengkap anak.";
    if (langkah === 1 && modeKeluarga === "lama" && !waliAkhir) return "Pilih keluarga, atau pilih Keluarga baru.";
    if (langkah === 1 && modeKeluarga === "baru" && !wali.parentName.trim()) return "Isi nama wali.";
    if (langkah === 1 && modeKeluarga === "baru" && !wali.parentPhone.trim() && !wali.parentEmail.trim()) return "Isi nomor WhatsApp atau email wali agar tagihan dan kabar bisa sampai.";
    if (langkah === 3 && tagih !== "nanti" && !(Number(nominal) > 0)) return "Isi nominal tagihan pertama.";
    if (langkah === 3 && tagih !== "nanti" && !jatuhTempo) return "Isi tanggal jatuh tempo.";
    return null;
  };

  const lanjut = () => {
    const g = validasi();
    setGalat(g);
    if (!g) setLangkah((l) => Math.min(3, l + 1));
  };

  const simpan = () => {
    const g = validasi();
    setGalat(g);
    if (g) return;
    startTransition(async () => {
      try {
        const sumberWali = waliAkhir ?? { parentName: wali.parentName, parentPhone: wali.parentPhone, parentEmail: wali.parentEmail };
        const { id } = await createStudent({
          name: anak.name.trim(),
          dateOfBirth: anak.dateOfBirth || null,
          parentName: sumberWali.parentName?.trim() || null,
          parentPhone: sumberWali.parentPhone?.trim() || null,
          parentEmail: sumberWali.parentEmail?.trim() || null,
          classId: kelasId ?? undefined,
          sessionsQuota: kelasId && sessionsQuota ? Number(sessionsQuota) : undefined,
          billingDay: kelasId && billingDay ? Number(billingDay) : undefined,
        });
        let ketTagihan: string | null = null;
        if (tagih !== "nanti") {
          const inv = await createInvoice({
            studentId: id,
            amount: Number(nominal),
            dueDate: jatuhTempo,
            billingPeriodStart: `${hariIni.slice(0, 7)}-01`,
            billingPeriodEnd: akhirBulan(hariIni),
            notes: kelasDipilih ? `Tagihan pertama · ${kelasDipilih.name}` : "Tagihan pertama",
          });
          if (tagih === "tunai") await markInvoicePaid(inv.id);
          ketTagihan = `${formatRupiah(Number(nominal))} · ${tagih === "tunai" ? "tercatat lunas" : `jatuh tempo ${formatTanggal(jatuhTempo)}`}`;
        }
        qc.invalidateQueries({ queryKey: ["siswa"] });
        qc.invalidateQueries({ queryKey: ["hari-ini"] });
        router.refresh();
        setSelesai({ id, nama: anak.name.trim(), kelas: kelasDipilih?.name ?? null, tagihan: ketTagihan });
      } catch (err) {
        const pesan = err instanceof Error ? err.message : "Coba lagi.";
        setGalat(pesan);
        toast({ title: "Pendaftaran gagal disimpan", description: pesan, variant: "destructive" });
      }
    });
  };

  if (selesai) {
    return (
      <>
        <PageHeader title="Daftarkan anak" crumbs={[{ label: "Siswa & Keluarga", href: "/students" }, { label: "Daftarkan" }]} />
        <PageBody className="max-w-[900px]">
          <EmptyState
            title={`${selesai.nama.split(" ")[0]} sudah terdaftar${selesai.kelas ? ` di ${selesai.kelas}` : ""}.`}
            description={
              <>
                <StatusDot varian="ok">Terdaftar</StatusDot>
                <span className="mt-2 block">
                  {selesai.tagihan ? `Tagihan pertama ${selesai.tagihan}.` : "Tagihan pertama belum dibuat; anak ini akan muncul di Perlu Ditagih saat tanggal tagihnya tiba."}{" "}
                  Guru kelas sudah bisa melihatnya di absen dan laporan harian.
                </span>
              </>
            }
            action={
              <>
                <Button variant="sec" onClick={() => window.location.reload()}>
                  Daftarkan anak lain
                </Button>
                <Button asChild variant="txt">
                  <Link href={`/students/${selesai.id}`}>Lihat profil</Link>
                </Button>
              </>
            }
          />
        </PageBody>
      </>
    );
  }

  const tombolKembali = langkah > 0 && (
    <Button variant="txt" className="text-primary" onClick={() => { setGalat(null); setLangkah((l) => l - 1); }} disabled={isPending}>
      ‹ Kembali
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Daftarkan anak"
        crumbs={[{ label: "Siswa & Keluarga", href: "/students" }, { label: "Daftarkan" }]}
        actions={
          <Button asChild variant="txt">
            <Link href="/students">Batal</Link>
          </Button>
        }
      />
      <PageBody className="max-w-[900px]">
        {galatMuat && (
          <ErrorBanner
            title="Daftar kelas atau keluarga gagal dimuat"
            description="Pilihan kelas dan keluarga terdaftar mungkin tidak lengkap. Muat ulang sebelum menyimpan."
            onRetry={() => router.refresh()}
            retryLabel="Muat ulang"
          />
        )}
        <Stepper steps={LANGKAH} current={langkah} srLabelsOnMobile />

        <Panel className="flex flex-col gap-4 p-5">
          {langkah === 0 && (
            <div className="grid gap-4 min-[561px]:grid-cols-2">
              <Field id="d-nama" label="Nama lengkap">
                <Input id="d-nama" value={anak.name} onChange={(e) => setAnak({ ...anak, name: e.target.value })} autoFocus aria-invalid={!!galat && !anak.name.trim()} />
              </Field>
              <Field id="d-lahir" label="Tanggal lahir" hint={anak.dateOfBirth ? `Umur ${formatUmur(anak.dateOfBirth)}` : "Dipakai untuk umur di daftar dan ulang tahun."}>
                <Input id="d-lahir" type="date" value={anak.dateOfBirth} max={hariIni} onChange={(e) => setAnak({ ...anak, dateOfBirth: e.target.value })} />
              </Field>
            </div>
          )}

          {langkah === 1 && (
            <>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={modeKeluarga === "lama"} onClick={() => setModeKeluarga("lama")} disabled={keluarga.length === 0}>
                  Keluarga yang sudah terdaftar
                </FilterChip>
                <FilterChip active={modeKeluarga === "baru"} onClick={() => setModeKeluarga("baru")}>
                  Keluarga baru
                </FilterChip>
              </div>
              {modeKeluarga === "lama" ? (
                <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
                  {keluarga.map((k) => (
                    <button
                      key={k.key}
                      type="button"
                      onClick={() => setKeluargaKey(k.key)}
                      className={cn(
                        "flex min-h-touch items-center gap-3 rounded border-[1.5px] px-4 py-3 text-left",
                        keluargaKey === k.key ? "border-foreground bg-muted" : "border-border hover:bg-background",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <b className="block">{k.parentName || "Tanpa nama wali"}</b>
                        <span className="block truncate text-[13px] text-muted-foreground">
                          {[k.parentPhone, k.parentEmail, k.tertaut ? "akun aktif" : null, `anak: ${k.anak.join(", ")}`].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      {keluargaKey === k.key && <StatusDot varian="ok" size="sm">Dipilih</StatusDot>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 min-[561px]:grid-cols-2">
                  <Field id="d-wali" label="Nama wali">
                    <Input id="d-wali" value={wali.parentName} onChange={(e) => setWali({ ...wali, parentName: e.target.value })} />
                  </Field>
                  <Field id="d-wa" label="Nomor WhatsApp">
                    <Input id="d-wa" inputMode="tel" placeholder="08…" value={wali.parentPhone} onChange={(e) => setWali({ ...wali, parentPhone: e.target.value })} />
                  </Field>
                  <Field id="d-email" label="Email" hint="Bila wali mendaftar di aplikasi dengan email ini, akunnya tertaut otomatis.">
                    <Input id="d-email" type="email" value={wali.parentEmail} onChange={(e) => setWali({ ...wali, parentEmail: e.target.value })} />
                  </Field>
                </div>
              )}
              {waliAkhir?.tertaut && (
                <InfoBox>Wali sudah punya akun. {anak.name.split(" ")[0] || "Anak ini"} akan muncul di aplikasinya setelah pendaftaran selesai.</InfoBox>
              )}
            </>
          )}

          {langkah === 2 && (
            <>
              {kelas.length === 0 ? (
                <InfoBox>
                  Belum ada kelas aktif. Anak tetap bisa didaftarkan tanpa kelas, atau <Link href="/classes" className="font-semibold text-primary underline">buat kelas dulu</Link>.
                </InfoBox>
              ) : (
                <div className="flex flex-col gap-2" role="radiogroup" aria-label="Kelas">
                  {kelas.map((k) => {
                    const sisa = k.capacity ? k.capacity - k.terisi : null;
                    const penuh = sisa !== null && sisa <= 0;
                    return (
                      <button
                        key={k.id}
                        type="button"
                        role="radio"
                        aria-checked={kelasId === k.id}
                        onClick={() => pilihKelas(k)}
                        className={cn(
                          "flex min-h-touch items-center gap-3 rounded border-[1.5px] px-4 py-3 text-left",
                          kelasId === k.id ? "border-foreground bg-muted" : "border-border hover:bg-background",
                        )}
                      >
                        <span className={cn("h-5 w-5 shrink-0 rounded-full border-[1.5px]", kelasId === k.id ? "border-[6px] border-foreground" : "border-input")} />
                        <span className="min-w-0 flex-1">
                          <b className="block">{k.name}</b>
                          <span className="block text-[13px] text-muted-foreground">
                            {[k.schedule, k.pricePerMonth !== null ? `${formatRupiah(k.pricePerMonth)}/bln` : null].filter(Boolean).join(" · ") || "Jadwal belum diisi"}
                          </span>
                        </span>
                        <span className={cn("text-[13px]", penuh && "font-semibold text-destructive")}>
                          {sisa === null ? "Kapasitas belum diatur" : penuh ? "Penuh" : <><b className="tabular">{sisa}</b> kursi tersisa dari {k.capacity}</>}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={kelasId === null}
                    onClick={() => setKelasId(null)}
                    className={cn("min-h-touch rounded px-4 py-2 text-left text-sm", kelasId === null ? "font-semibold" : "text-muted-foreground")}
                  >
                    {kelasId === null ? "● " : ""}Daftarkan tanpa kelas dulu
                  </button>
                </div>
              )}
              {kelasId && (
                <div className="grid gap-4 min-[561px]:grid-cols-2">
                  <Field id="d-tgl" label="Tanggal tagih tiap bulan" hint="Anak masuk Perlu Ditagih mulai tanggal ini.">
                    <Input id="d-tgl" type="number" min={1} max={28} value={billingDay} onChange={(e) => setBillingDay(e.target.value)} />
                  </Field>
                  <Field id="d-kuota" label="Kuota sesi per bulan" hint="Kosongkan bila tanpa batas sesi.">
                    <Input id="d-kuota" type="number" min={1} value={sessionsQuota} onChange={(e) => setSessionsQuota(e.target.value)} />
                  </Field>
                </div>
              )}
            </>
          )}

          {langkah === 3 && (
            <>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tagihan pertama">
                <FilterChip active={tagih === "terbit"} onClick={() => setTagih("terbit")}>Terbitkan sekarang</FilterChip>
                <FilterChip active={tagih === "tunai"} onClick={() => setTagih("tunai")}>Catat sudah dibayar tunai</FilterChip>
                <FilterChip active={tagih === "nanti"} onClick={() => setTagih("nanti")}>Tagih nanti</FilterChip>
              </div>
              {tagih === "nanti" ? (
                <p className="text-[15px] text-muted-foreground">
                  Tidak ada tagihan yang dibuat. {kelasId ? "Anak ini muncul di Perlu Ditagih saat tanggal tagihnya tiba." : "Buat tagihan kapan saja dari menu Tagihan."}
                </p>
              ) : (
                <>
                  <div className="grid gap-4 min-[561px]:grid-cols-2">
                    <Field id="d-nominal" label="Nominal" hint={kelasDipilih?.pricePerMonth ? `Harga ${kelasDipilih.name}: ${formatRupiah(kelasDipilih.pricePerMonth)}/bln. Ubah bila masuk di tengah bulan.` : undefined}>
                      <Input id="d-nominal" inputMode="numeric" value={nominal} onChange={(e) => setNominal(e.target.value.replace(/\D/g, ""))} aria-invalid={!!galat && !(Number(nominal) > 0)} />
                    </Field>
                    <Field id="d-tempo" label="Jatuh tempo">
                      <Input id="d-tempo" type="date" value={jatuhTempo} min={hariIni} onChange={(e) => setJatuhTempo(e.target.value)} />
                    </Field>
                  </div>
                  <Panel>
                    <PanelRow>
                      <span className="flex-1">{kelasDipilih ? `${kelasDipilih.name} · periode ${formatPeriode(hariIni)}` : `Periode ${formatPeriode(hariIni)}`}</span>
                      <span className="tabular">{formatRupiah(Number(nominal) || 0)}</span>
                    </PanelRow>
                    <PanelRow>
                      <b className="flex-1">Total</b>
                      <b className="tabular text-lg">
                        <span className="hl">{formatRupiah(Number(nominal) || 0)}</span>
                      </b>
                    </PanelRow>
                  </Panel>
                  <span className="text-[13px] text-muted-foreground">
                    {tagih === "tunai" ? "Tagihan langsung tercatat Lunas hari ini." : `Wali melihat tagihan ini di aplikasi dan bisa membayar online. Jatuh tempo ${formatTanggal(jatuhTempo)}.`}
                  </span>
                </>
              )}
            </>
          )}

          {galat && <p role="alert" className="text-sm font-semibold text-destructive">{galat}</p>}

          <div className={cn("flex items-center", langkah > 0 ? "justify-between" : "justify-end")}>
            {tombolKembali}
            {langkah < 3 ? (
              <Button onClick={lanjut}>Lanjut</Button>
            ) : (
              <Button onClick={simpan} disabled={isPending}>
                {isPending ? "Menyimpan…" : tagih === "nanti" ? "Simpan pendaftaran" : "Simpan & terbitkan tagihan"}
              </Button>
            )}
          </div>
        </Panel>
      </PageBody>
    </>
  );
}
