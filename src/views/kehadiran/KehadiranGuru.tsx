"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DataTable,
  DataTableSkeleton,
  EmptyState,
  ErrorBanner,
  InfoBox,
  KidAvatar,
  PageBody,
  PageHeader,
  Stale,
  StatCard,
  StatRow,
  StatRowSkeleton,
  StatusDot,
  type Column,
} from "@/components/bunayo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useIstilah } from "@/hooks/useIstilah";
import { formatJam, formatTanggal } from "@/lib/format";
import type { StatusInfo } from "@/lib/status";
import {
  getKehadiranGuru,
  type BarisKehadiranGuru,
  type KehadiranGuruData,
} from "@/server/actions/kehadiran";

/**
 * O6 Kehadiran guru (hari ini). Check-in dilakukan guru dari portal guru (action lama recordTutorAttendance).
 * Disembunyikan (BARU, REDESIGN-BACKLOG): lokasi GPS & "di luar lokasi", penilaian tepat waktu (aturan toleransi),
 * Setujui/Tolak izin (belum ada action), panel Aturan, tampilan Bulan ini per hari.
 */

const LABEL_IZIN: Record<string, string> = {
  sick: "Izin sakit",
  personal: "Izin pribadi",
  annual: "Cuti",
  emergency: "Izin darurat",
};

function statusGuru(b: BarisKehadiranGuru, jamSekarang: string): StatusInfo {
  if (b.izin) {
    const jenis = LABEL_IZIN[b.izin.jenis] ?? "Izin";
    return b.izin.status === "pending"
      ? { label: `${jenis} · menunggu persetujuan`, varian: "alert" }
      : { label: jenis, varian: "info" };
  }
  if (b.masuk)
    return b.pulang
      ? { label: "Sudah pulang", varian: "off" }
      : { label: "Hadir", varian: "ok" };
  if (b.jadwal && b.jadwal.slice(0, 5) > jamSekarang.slice(0, 5))
    return { label: "Belum waktunya", varian: "off" };
  return { label: "Belum check-in", varian: b.jadwal ? "wait" : "off" };
}

export default function KehadiranGuru({
  initialData,
}: {
  initialData?: KehadiranGuruData;
}) {
  const istilah = useIstilah();
  const query = useQuery({
    queryKey: ["kehadiran-guru"],
    queryFn: getKehadiranGuru,
    initialData,
  });
  const { data, isError, refetch } = query;
  const judul = istilah.kehadiran;

  if (!data) {
    return (
      <>
        <PageHeader
          title={judul}
          crumbs={[{ label: "Kehadiran", href: "/attendance" }]}
        />
        <PageBody>
          {isError ? (
            <ErrorBanner
              title={`${judul} gagal dimuat`}
              description="Tidak ada data yang berubah. Aman untuk mencoba lagi."
              onRetry={() => refetch()}
            />
          ) : (
            <>
              <StatRowSkeleton count={3} />
              <DataTableSkeleton rows={4} cols={5} />
            </>
          )}
        </PageBody>
      </>
    );
  }

  const tiba = data.baris.filter((b) => b.masuk).length;
  const terjadwal = data.baris.filter((b) => !b.izin).length;
  const totalHadir = data.baris.reduce((s, b) => s + b.hariHadirBulanIni, 0);
  const hariGuru = data.baris.length * data.hariKerjaBulanIni;
  const persenHadir =
    hariGuru > 0 ? Math.round((totalHadir / hariGuru) * 100) : 0;

  const kolom: Column<BarisKehadiranGuru>[] = [
    {
      id: "guru",
      header: istilah.guru,
      sticky: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="flex items-center gap-2.5">
          <KidAvatar
            name={r.name}
            id={r.id}
            photoUrl={r.photoUrl}
            size="sm"
            tiba={!!r.masuk && !r.pulang}
          />
          <b className="truncate">{r.name}</b>
        </span>
      ),
    },
    {
      id: "jadwal",
      header: "Jadwal",
      sortValue: (r) => r.jadwal ?? "99",
      cell: (r) => (
        <span
          className={r.jadwal ? "tabular" : "text-[13px] text-muted-foreground"}
        >
          {r.jadwal ? formatJam(r.jadwal) : "Tidak ada sesi"}
        </span>
      ),
    },
    {
      id: "masuk",
      header: "Check-in",
      sortValue: (r) => r.masuk ?? "",
      cell: (r) =>
        r.izin ? (
          <span className="text-[13px] text-muted-foreground">
            {r.izin.alasan || "—"}
          </span>
        ) : (
          <span
            className={r.masuk ? "tabular" : "tabular text-muted-foreground"}
          >
            {r.masuk ? formatJam(r.masuk) : "—"}
          </span>
        ),
    },
    {
      id: "pulang",
      header: "Check-out",
      cell: (r) => (
        <span
          className={r.pulang ? "tabular" : "tabular text-muted-foreground"}
        >
          {r.pulang ? formatJam(r.pulang) : "—"}
        </span>
      ),
    },
    {
      id: "bulan",
      header: `Hadir · ${data.periode}`,
      numeric: true,
      hideOnMobile: true,
      sortValue: (r) => r.hariHadirBulanIni,
      cell: (r) => `${r.hariHadirBulanIni}/${data.hariKerjaBulanIni} hari`,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => (
        <StatusDot info={statusGuru(r, data.jamSekarang)} size="sm" />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={formatTanggal(data.tanggal, { hari: true }).toUpperCase()}
        title={judul}
        crumbs={[{ label: "Kehadiran", href: "/attendance" }]}
      />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Nama dan jam di layar ini adalah contoh, bukan
            data lembaga mana pun.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner
            title={`${judul} gagal diperbarui`}
            description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`}
            onRetry={() => refetch()}
          />
        )}

        {data.baris.length === 0 ? (
          <EmptyState
            title={`Belum ada ${istilah.guruKecil} aktif`}
            description={`Kehadiran muncul setelah ${istilah.guruKecil} ditambahkan dan check-in dari portal ${istilah.guruKecil}.`}
            action={
              <Button asChild variant="sec">
                <Link href="/settings/staff">Staf & Peran</Link>
              </Button>
            }
          />
        ) : (
          <Stale stale={isError}>
            <div className="flex flex-col gap-5">
              <StatRow>
                <StatCard
                  label="Tiba"
                  periode="hari ini"
                  value={tiba}
                  suffix={`/${terjadwal}`}
                  stabilo
                />
                <StatCard
                  label="Kehadiran"
                  periode={`${data.periode} s.d. hari ini`}
                  value={`${persenHadir}%`}
                  linkLabel={`${totalHadir} dari ${hariGuru} hari kerja ${istilah.guruKecil} (Senin–Sabtu)`}
                />
                <StatCard
                  label="Izin menunggu"
                  periode="hari ini"
                  value={data.izinMenunggu}
                  tone={data.izinMenunggu > 0 ? "red" : undefined}
                  linkLabel="persetujuan belum tersedia di aplikasi"
                />
              </StatRow>

              <DataTable
                rows={data.baris}
                columns={kolom}
                getRowId={(r) => r.id}
                pageSize={50}
                renderCard={(r) => (
                  <span className="flex items-center gap-3">
                    <KidAvatar
                      name={r.name}
                      id={r.id}
                      photoUrl={r.photoUrl}
                      size="sm"
                      tiba={!!r.masuk && !r.pulang}
                    />
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-[15px]">{r.name}</b>
                      <span className="block truncate text-[13px] text-muted-foreground">
                        {r.jadwal
                          ? `jadwal ${formatJam(r.jadwal)}`
                          : "tidak ada sesi"}
                        {r.masuk ? ` · masuk ${formatJam(r.masuk)}` : ""}
                        {r.pulang ? ` · pulang ${formatJam(r.pulang)}` : ""}
                      </span>
                    </span>
                    <StatusDot
                      info={statusGuru(r, data.jamSekarang)}
                      size="sm"
                    />
                  </span>
                )}
              />
              <p className="text-[13px] text-muted-foreground">
                Check-in dicatat {istilah.guruKecil} dari portalnya. Lokasi GPS,
                penilaian tepat waktu, dan persetujuan izin belum tersedia, jadi
                belum ditampilkan.
              </p>
            </div>
          </Stale>
        )}
      </PageBody>
    </>
  );
}
