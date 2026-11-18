"use client";

import { useState } from "react";
import { Bell, Camera, ClipboardCheck, House, MessageCircle, Receipt, Send, Sun, UsersRound, CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BunayoLogo,
  BunayoMark,
  StatusDot,
  ClassChip,
  FilterChip,
  KidAvatar,
  AvatarStack,
  StatRow,
  StatCard,
  StatRowSkeleton,
  Panel,
  PanelHeader,
  PanelRow,
  RowText,
  PanelRowsSkeleton,
  EmptyState,
  ErrorBanner,
  Stepper,
  ProgressBar,
  FeedItem,
  BriefingItem,
  RosterFace,
  KidSwitcher,
  MobileHeader,
  MobileCard,
  RoundIconButton,
  DataTable,
  DataTableSkeleton,
  ThemeToggle,
  type Column,
} from "@/components/bunayo";
import { statusTagihan, statusKehadiran, STATUS_AKUN_WALI } from "@/lib/status";
import { formatRupiah, formatRupiahSingkat, formatTanggal, formatJam, formatPeriode } from "@/lib/format";
import { KRAYON, KELAS_KRAYON } from "@/lib/krayon";
import { cn } from "@/lib/utils";

/* Contoh katalog — sama dengan contoh di design/00-design-system.html, hanya untuk perbandingan visual. */
const CONTOH_TAGIHAN = [
  { id: "1", keluarga: "Keluarga Wibowo", anak: "Bima · Toddler A", jatuhTempo: "2026-10-05", nominal: 650000, status: "overdue", hari: 43 },
  { id: "2", keluarga: "Keluarga Putri", anak: "Aisyah · TK A", jatuhTempo: "2026-09-15", nominal: 1250000, status: "overdue", hari: 63 },
  { id: "3", keluarga: "Keluarga Siregar", anak: "Kayla, Raka", jatuhTempo: "2026-11-20", nominal: 2450000, status: "unpaid", hari: 0 },
  { id: "4", keluarga: "Keluarga Kinanti", anak: "Aira", jatuhTempo: "2026-11-08", nominal: 1100000, status: "paid", hari: 0 },
];
type Baris = (typeof CONTOH_TAGIHAN)[number];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t-2 border-foreground pt-4">
      <h2 className="mb-4 font-display text-[28px] font-extrabold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="h-14 w-full rounded border border-border" style={{ background: `hsl(var(--${varName}))` }} />
      <b className="text-[13px]">{name}</b>
      <span className="tabular text-xs text-muted-foreground">--{varName}</span>
    </div>
  );
}

export function DevUiGallery() {
  const [kid, setKid] = useState("k1");
  const [step] = useState(1);
  const columns: Column<Baris>[] = [
    {
      id: "keluarga",
      header: "Keluarga",
      sticky: true,
      sortValue: (r) => r.keluarga,
      cell: (r) => (
        <span className="flex items-center gap-2.5">
          <KidAvatar name={r.keluarga.replace("Keluarga ", "")} size="sm" />
          <span>
            <b className="block font-semibold">{r.keluarga}</b>
            <small className="text-xs text-muted-foreground">{r.anak}</small>
          </span>
        </span>
      ),
    },
    { id: "jt", header: "Jatuh tempo", hideOnMobile: true, sortValue: (r) => r.jatuhTempo, cell: (r) => <span className="tabular">{formatTanggal(r.jatuhTempo)}</span> },
    { id: "nominal", header: "Nominal", numeric: true, sortValue: (r) => r.nominal, cell: (r) => formatRupiah(r.nominal) },
    { id: "status", header: "Status", cell: (r) => <StatusDot info={statusTagihan(r.status, r.hari)} size="sm" /> },
  ];

  return (
    <div className="min-h-screen bg-kanvas">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-4 border-b border-border bg-kanvas/95 px-8 py-3 backdrop-blur">
        <BunayoLogo height={30} />
        <span className="tabular text-[13px] text-muted-foreground">/dev/ui · bandingkan dengan design/00-design-system.html</span>
        <span className="flex-1" />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-14 px-8 py-10">
        <Section id="logo" title="00 Logo & brand">
          <div className="flex flex-wrap items-end gap-8 rounded bg-background p-6">
            <BunayoLogo height={48} />
            <BunayoLogo height={36} />
            <BunayoLogo height={30} />
            <BunayoMark height={40} />
            <BunayoMark height={24} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Swatch name="Biru Bunayo" varName="brand-blue" />
            <Swatch name="Kuning" varName="brand-yellow" />
            <Swatch name="Daun tua" varName="brand-green" />
            <Swatch name="Daun muda" varName="brand-leaf" />
          </div>
        </Section>

        <Section id="warna" title="01 Warna">
          <div className="grid grid-cols-6 gap-4">
            {["background", "surface", "foreground", "foreground-2", "muted", "muted-foreground", "border", "input", "primary", "primary-soft", "highlight", "destructive", "success", "success-ring", "warning", "info", "nav-active"].map((v) => (
              <Swatch key={v} name={v} varName={v} />
            ))}
          </div>
          <div className="grid grid-cols-6 gap-4">
            {KRAYON.map((k) => (
              <div key={k} className="flex flex-col gap-1.5">
                <span className={cn("h-10 rounded", KELAS_KRAYON[k].bg)} />
                <span className={cn("flex h-10 items-center rounded px-3 text-sm font-semibold", KELAS_KRAYON[k].soft, KELAS_KRAYON[k].ink)}>{k}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-6 rounded bg-card p-5">
            <b className="w-full text-sm">Tagihan</b>
            {(["paid", "unpaid", "partial"] as const).map((s) => (
              <StatusDot key={s} info={statusTagihan(s)} />
            ))}
            <StatusDot info={statusTagihan("overdue", 33)} />
            <b className="w-full text-sm">Kehadiran</b>
            <StatusDot info={statusKehadiran("present")} />
            <StatusDot info={statusKehadiran("late")} />
            <StatusDot info={statusKehadiran("permit")} />
            <StatusDot info={statusKehadiran("permit", "sick")} />
            <StatusDot info={statusKehadiran(null)} />
            <StatusDot info={statusKehadiran("absent")} />
            <b className="w-full text-sm">Akun wali</b>
            {Object.values(STATUS_AKUN_WALI).map((s) => (
              <StatusDot key={s.label} info={s} />
            ))}
          </div>
        </Section>

        <Section id="tipografi" title="02 Tipografi & format">
          <div className="flex flex-col gap-3 rounded bg-card p-6">
            <span className="font-display text-5xl font-extrabold tracking-tight">Kayla sudah tiba</span>
            <span className="font-display text-[40px] font-bold">Penagihan November 2026</span>
            <span className="font-display text-2xl font-bold">Baby Bee</span>
            <span className="text-xl font-semibold">Tagihan November belum terbit untuk 8 keluarga</span>
            <span className="text-base">Kayla hari ini berani menyapa teman baru duluan.</span>
            <span className="text-[13px] text-muted-foreground">Diunggah Bu Sari · 2 menit lalu</span>
            <span className="tabular text-base">
              {formatRupiah(1250000)} · {formatRupiahSingkat(12100000)} · {formatJam("07:42")} · {formatTanggal("2026-11-17")} · {formatPeriode("2026-11-17")} · 31/38
            </span>
            <p className="text-base">
              Ada <span className="hl">4 hal mendesak</span> pagi ini.
            </p>
          </div>
        </Section>

        <Section id="tombol" title="04 Tombol & isian">
          <div className="flex flex-wrap items-center gap-3 rounded bg-card p-6">
            <Button>Bayar</Button>
            <Button disabled>Nonaktif</Button>
            <Button variant="sec">Kirim pengingat</Button>
            <Button variant="txt">Tunda</Button>
            <Button variant="link">Lihat semua</Button>
            <Button variant="dng">Batalkan tagihan</Button>
            <Button variant="dark">Buka kelas</Button>
            <Button variant="soft" pill>
              Check-out
            </Button>
            <Button size="sm" variant="sec">
              Baris 36
            </Button>
            <Button size="lg">Mobile 52</Button>
            <Button size="icon" variant="sec" aria-label="Kirim">
              <Send />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-5 rounded bg-card p-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="d-nama">Nama anak</Label>
              <Input id="d-nama" placeholder="mis. Keisha Anindya" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="d-wa">WA wali</Label>
              <Input id="d-wa" defaultValue="0812-34" aria-invalid />
              <span className="text-[13px] text-destructive">Nomor terlalu pendek. Contoh: 0812-3456-7890</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Kelas</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">Toddler A</SelectItem>
                  <SelectItem value="b">Baby Bee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="d-cat">
                Catatan <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <Textarea id="d-cat" placeholder="Tulis catatan untuk guru…" />
            </div>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 text-sm">
                <Checkbox defaultChecked /> Dipilih
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Switch defaultChecked /> Kirim pengingat otomatis
              </label>
              <RadioGroup defaultValue="a" className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="a" /> Satu pilihan
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="b" /> Lainnya
                </label>
              </RadioGroup>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded bg-card p-6">
            <ClassChip name="Baby Bee" krayon="matahari" />
            <ClassChip name="Toddler A" krayon="langit" />
            <ClassChip name="Playgroup B" krayon="daun" />
            <ClassChip name="TK A" krayon="anggur" />
            <ClassChip name="TK B" krayon="permen" />
            <FilterChip active count={38}>
              Semua
            </FilterChip>
            <FilterChip count={6}>Baby Bee</FilterChip>
            <FilterChip count={5}>Ada alergi</FilterChip>
            <KidAvatar name="Kayla Putri" krayon="tomat" tiba />
            <KidAvatar name="Bima Arya" krayon="daun" size="lg" />
            <AvatarStack people={[{ name: "Kayla" }, { name: "Bima" }, { name: "Naila" }, { name: "Shaka" }, { name: "Arka" }]} />
          </div>
          <Tabs defaultValue="m">
            <TabsList>
              <TabsTrigger value="m">Menunggu 7</TabsTrigger>
              <TabsTrigger value="t">Terlambat 2</TabsTrigger>
              <TabsTrigger value="l">Lunas 14</TabsTrigger>
            </TabsList>
            <TabsContent value="m" className="text-sm text-muted-foreground">
              Isi tab
            </TabsContent>
          </Tabs>
          <div className="flex flex-wrap items-center gap-4 rounded bg-card p-6">
            <Stepper steps={["Anak", "Keluarga", "Kelas", "Tagihan"]} current={step} className="flex-1" />
            <span className="flex w-60 items-center gap-2 text-sm">
              Kuota sesi <ProgressBar value={6} max={8} /> <span className="tabular">6/8</span>
            </span>
          </div>
        </Section>

        <Section id="angka" title="Angka ringkasan & panel">
          <StatRow>
            <StatCard label="Tiba" periode="hari ini" value="31" suffix="/38" linkLabel="7 belum tiba" href="#" />
            <StatCard label="Diterima" periode="Nov 2026" value="Rp 12,1 jt" suffix=" dari Rp 18,4 jt terbit" linkLabel="14 keluarga lunas" href="#" stabilo />
            <StatCard label="Terlambat" periode="semua periode" value="Rp 1,9 jt" tone="red" linkLabel="2 keluarga" href="#" />
          </StatRow>
          <StatRowSkeleton count={3} />
          <div className="grid grid-cols-2 gap-5">
            <Panel>
              <PanelHeader title="Mendesak" meta={<span className="tabular text-destructive">2</span>} />
              <BriefingItem
                title="Tagihan November belum terbit · 8 keluarga"
                sub={<>Jadwal tanggal 15 terlewat 2 hari · <span className="tabular">Rp 8.200.000</span></>}
                actions={
                  <>
                    <Button size="sm">Tinjau &amp; terbitkan</Button>
                    <Button size="sm" variant="txt">
                      Tunda
                    </Button>
                  </>
                }
              />
              <PanelRow>
                <RowText title="Baris isi" sub="Keterangan baris" />
                <Button size="sm" variant="sec">
                  Aksi
                </Button>
              </PanelRow>
            </Panel>
            <Panel>
              <PanelHeader title="Memuat" meta="skeleton" />
              <PanelRowsSkeleton rows={3} avatar />
            </Panel>
          </div>
          <div className="flex flex-col gap-3">
            <FeedItem jenis="makan" waktu="08:30" detail="½ porsi bubur ayam wortel" />
            <FeedItem jenis="bermain" waktu="08:55" detail="Pasir kinetik bersama Naila · 3 foto" />
            <FeedItem jenis="tidur" waktu="12:30" detail="12.30–14.05 · nyenyak" />
            <FeedItem jenis="momen" waktu="14:20" detail="Pertama kali menyusun 5 balok sendiri" />
          </div>
        </Section>

        <Section id="state" title="Kosong, memuat, galat">
          <EmptyState title="Belum ada kelas" description="Buat kelas pertama dulu (nama, usia, kapasitas, jadwal). Setelah itu Anda bisa memasukkan siswa." action={<Button>Buat kelas</Button>} />
          <ErrorBanner title="Daftar tagihan gagal dimuat" description="Tidak ada yang terkirim atau berubah." onRetry={() => toast("Memuat ulang…")} />
        </Section>

        <Section id="tabel" title="09 Tabel data">
          <DataTable
            rows={CONTOH_TAGIHAN}
            columns={columns}
            getRowId={(r) => r.id}
            searchText={(r) => `${r.keluarga} ${r.anak}`}
            searchPlaceholder="Cari keluarga atau anak"
            filters={[
              { id: "all", label: "Semua", predicate: () => true },
              { id: "late", label: "Terlambat", predicate: (r) => r.status === "overdue" },
            ]}
            selectable
            bulkActions={(sel) => (
              <>
                <span className="tabular">{formatRupiah(sel.reduce((a, r) => a + r.nominal, 0))}</span>
                <Button size="sm" variant="sec" className="bulk-sec">
                  Kirim pengingat via WA
                </Button>
              </>
            )}
            renderCard={(r) => (
              <div className="flex items-start justify-between gap-2">
                <span>
                  <b className="block">{r.keluarga}</b>
                  <small className="text-muted-foreground">{r.anak}</small>
                </span>
                <span className="text-right">
                  <span className="tabular block">{formatRupiah(r.nominal)}</span>
                  <StatusDot info={statusTagihan(r.status, r.hari)} size="sm" />
                </span>
              </div>
            )}
          />
          <DataTableSkeleton rows={3} />
          <div className="flex gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="sec">Buka lembar bawah</Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <span aria-hidden className="mx-auto block h-[5px] w-10 rounded-full bg-border" />
                <SheetTitle>Ajukan izin untuk Kayla</SheetTitle>
                <p className="text-sm text-foreground-2">Kuota sesi tidak terpakai. Sisa izin gratis bulan ini: 1.</p>
                <Button size="lg" full>
                  Kirim ke Bu Sari
                </Button>
              </SheetContent>
            </Sheet>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="sec">Buka modal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Catat pembayaran</DialogTitle>
                <p className="text-sm">Modal desktop, radius sheet.</p>
              </DialogContent>
            </Dialog>
            <Button variant="sec" onClick={() => toast("Pengingat terkirim ke 3 keluarga", { action: { label: "Urungkan", onClick: () => undefined } })}>
              Tampilkan toast
            </Button>
          </div>
        </Section>

        <Section id="mobile" title="10 Pola mobile">
          <div className="flex flex-wrap gap-8">
            <div className="relative h-[760px] w-[390px] overflow-hidden rounded-sheet bg-surface">
              <MobileHeader eyebrow={formatTanggal("2026-11-17", { hari: true, panjang: true, tanpaTahun: true })} title="Pagi, Bu Sari" right={<RoundIconButton icon={Bell} label="Notifikasi" dot />} />
              <div className="flex flex-col gap-3 px-4">
                <MobileCard className="bg-matahari">
                  <span className="text-[13px] font-semibold tracking-[0.02em] text-foreground-2">BERIKUTNYA · 19 MENIT LAGI</span>
                  <span className="font-display text-[46px] font-extrabold leading-none tracking-[-0.03em]">Baby Bee</span>
                  <Button variant="dark" size="lg" pill full>
                    Buka kelas
                  </Button>
                </MobileCard>
                <div className="grid grid-cols-3 gap-2">
                  <RosterFace name="Kayla Putri" krayon="tomat" state="tiba" jamTiba="07:42" />
                  <RosterFace name="Bima Arya" krayon="daun" state="tiba" jamTiba="07:55" alergi />
                  <RosterFace name="Shaka R" krayon="langit" state="belum" alergi />
                </div>
              </div>
              <DemoTabBar items={[["Hari Ini", Sun], ["Kelas", UsersRound], ["Pesan", MessageCircle], ["Saya", CircleUser]]} />
            </div>
            <div className="relative h-[760px] w-[390px] overflow-hidden rounded-sheet bg-surface">
              <div className="flex items-center justify-between px-4 pt-3">
                <KidSwitcher
                  kids={[
                    { id: "k1", name: "Kayla Putri" },
                    { id: "k2", name: "Raka Siregar" },
                  ]}
                  activeId={kid}
                  onChange={setKid}
                />
                <RoundIconButton icon={Bell} label="Notifikasi" />
              </div>
              <MobileHeader title={kid === "k1" ? "Kayla sudah tiba" : "Raka belum tiba"} sub="07.42 · diantar Ayah" />
              <div className="px-4">
                <MobileCard>
                  <FeedItem jenis="foto" waktu="09:10" detail="Melukis jari" />
                  <FeedItem jenis="makan" waktu="10:00" detail="Snack buah habis" />
                </MobileCard>
              </div>
              <DemoTabBar items={[["Beranda", House], ["Tagihan", Receipt], ["Pesan", MessageCircle], ["Profil", CircleUser]]} />
            </div>
          </div>
          <div className="flex gap-2 text-muted-foreground">
            <ClipboardCheck className="h-5 w-5" /> <Camera className="h-5 w-5" /> ikon lucide garis 2 px
          </div>
        </Section>
      </main>
    </div>
  );
}

/** Tiruan statis FloatingTabBar di dalam bingkai (komponen aslinya `position: fixed`). */
function DemoTabBar({ items }: { items: [string, typeof Sun][] }) {
  return (
    <nav className="absolute inset-x-4 bottom-6 grid h-[68px] grid-cols-4 rounded-full bg-card/90 p-1.5 shadow-float backdrop-blur-xl">
      {items.map(([label, Icon], i) => (
        <span
          key={label}
          className={cn(
            "flex flex-col items-center justify-center gap-[3px] rounded-sheet text-[11px] font-semibold",
            i === 0 ? "bg-nav-active text-nav-active-foreground" : "text-muted-foreground",
          )}
        >
          <Icon className="h-6 w-6" />
          {label}
        </span>
      ))}
    </nav>
  );
}
