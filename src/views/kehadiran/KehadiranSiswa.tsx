"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  StatusDot,
  type Column,
} from "@/components/bunayo";
import { useIstilah } from "@/hooks/useIstilah";
import { useToast } from "@/hooks/use-toast";
import { formatEyebrow, formatJam, formatTanggal } from "@/lib/format";
import { statusKehadiran } from "@/lib/status";
import {
  recordStudentCheckIn,
  recordStudentCheckOut,
} from "@/server/actions/attendance";
import {
  getKehadiranSiswa,
  type BarisKehadiranSiswa,
  type KehadiranSiswaData,
} from "@/server/actions/kehadiran";

/**
 * O5 Kehadiran siswa per kelas. Catat tiba/pulang memakai action lama (recordStudentCheckIn/Out), hanya untuk hari ini.
 * Disembunyikan (BARU, REDESIGN-BACKLOG): Mode scan QR, kolom Diantar (penjemput), sumber pencatatan (QR/aplikasi),
 * koreksi jam dengan alasan + audit log, catat Izin/Sakit/Alpa dari admin (belum ada action).
 */

const tibaStatus = (s: string | null) => s === "present" || s === "late";
const labelAlergi = (a: string) =>
  /^alergi/i.test(a) ? a : `Alergi ${a.charAt(0).toLowerCase()}${a.slice(1)}`;
const MAKS_BELUM_PULANG = 4;

export default function KehadiranSiswa({
  initialData,
  tanggal,
}: {
  initialData?: KehadiranSiswaData;
  tanggal?: string;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const istilah = useIstilah();
  const query = useQuery({
    queryKey: ["kehadiran-siswa", tanggal ?? "hari-ini"],
    queryFn: () => getKehadiranSiswa(tanggal),
    initialData,
  });
  const { data, isError, refetch } = query;
  const [tab, setTab] = useState<string | null>(null);
  const tanggalRef = useRef<HTMLInputElement>(null);

  const selesai = (judul: string) => ({
    onSuccess: (res: { time: string }) => {
      qc.invalidateQueries({ queryKey: ["kehadiran-siswa"] });
      qc.invalidateQueries({ queryKey: ["hari-ini"] });
      toast({ title: `${judul} ${formatJam(res.time)}` });
    },
    onError: (err: Error) =>
      toast({
        title: `${judul} gagal dicatat`,
        description: err.message,
        variant: "destructive",
      }),
  });
  const catatTiba = useMutation({
    mutationFn: (r: BarisKehadiranSiswa) =>
      recordStudentCheckIn({
        attendanceId: r.attendanceId ?? undefined,
        studentId: r.studentId,
        classId: r.classId,
      }),
    ...selesai("Tiba"),
  });
  const catatPulang = useMutation({
    mutationFn: (r: BarisKehadiranSiswa) =>
      recordStudentCheckOut({ attendanceId: r.attendanceId! }),
    ...selesai("Pulang"),
  });

  const judul = "Kehadiran";
  if (!data) {
    return (
      <>
        <PageHeader title={judul} />
        <PageBody>
          {isError ? (
            <ErrorBanner
              title="Daftar kehadiran gagal dimuat"
              description="Tidak ada data yang berubah. Aman untuk mencoba lagi."
              onRetry={() => refetch()}
            />
          ) : (
            <DataTableSkeleton rows={6} cols={5} />
          )}
        </PageBody>
      </>
    );
  }

  const aktif = tab ?? data.kelas.find((k) => k.terdaftar > 0)?.id ?? "semua";
  const rows =
    aktif === "semua"
      ? data.baris
      : data.baris.filter((r) => r.classId === aktif);
  const totalTiba = data.baris.filter((r) => tibaStatus(r.status)).length;
  const bisaCatat = data.bisaCatat && !data.isDemo;
  const sibuk = catatTiba.isPending || catatPulang.isPending;
  const namaKelas = (id: string) =>
    data.kelas.find((k) => k.id === id)?.name ?? "";

  const pilihTanggal = (v: string) => {
    if (!v) return;
    router.push(
      v === data.hariIni ? "/attendance" : `/attendance?tanggal=${v}`,
    );
  };

  const kolom: Column<BarisKehadiranSiswa>[] = [
    {
      id: "anak",
      header: "Anak",
      sticky: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <Link
          href={`/students/${r.studentId}`}
          className="flex items-center gap-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          <KidAvatar name={r.name} id={r.studentId} size="sm" />
          <span className="flex min-w-0 flex-col">
            <b className="truncate">{r.name}</b>
            {r.alergi && (
              <small className="truncate text-xs font-semibold text-destructive">
                {labelAlergi(r.alergi)}
              </small>
            )}
            {aktif === "semua" && (
              <small className="truncate text-xs text-muted-foreground">
                {namaKelas(r.classId)}
              </small>
            )}
          </span>
        </Link>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (r) => statusKehadiran(r.status, r.permitType).label,
      cell: (r) => (
        <StatusDot info={statusKehadiran(r.status, r.permitType)} size="sm" />
      ),
    },
    {
      id: "tiba",
      header: "Tiba",
      sortValue: (r) => r.tiba ?? "",
      cell: (r) =>
        r.status === "permit" ? (
          <span className="text-[13px] text-muted-foreground">
            {r.permitReason || "—"}
          </span>
        ) : (
          <span
            className={r.tiba ? "tabular" : "tabular text-muted-foreground"}
          >
            {r.tiba ? formatJam(r.tiba) : "—"}
          </span>
        ),
    },
    {
      id: "pulang",
      header: "Pulang",
      cell: (r) => (
        <span
          className={r.pulang ? "tabular" : "tabular text-muted-foreground"}
        >
          {r.pulang ? formatJam(r.pulang) : "—"}
        </span>
      ),
    },
    {
      id: "sesi",
      header: "Sesi terpakai",
      hideOnMobile: true,
      cell: (r) => (
        <span className="tabular">
          {r.sesi.kuota
            ? `${r.sesi.terpakai}/${r.sesi.kuota}`
            : r.sesi.terpakai}
        </span>
      ),
    },
    {
      id: "dicatat",
      header: "Dicatat",
      hideOnMobile: true,
      cell: (r) => (
        <span className="whitespace-nowrap text-[13px] text-muted-foreground">
          {r.dicatatOleh ?? ""}
        </span>
      ),
    },
    {
      id: "aksi",
      header: "",
      cell: (r) => aksi(r),
    },
  ];

  function aksi(r: BarisKehadiranSiswa) {
    if (!bisaCatat) return null;
    if (!r.status)
      return (
        <Button
          variant="sec"
          size="sm"
          disabled={sibuk}
          onClick={() => catatTiba.mutate(r)}
        >
          Tiba
        </Button>
      );
    if (tibaStatus(r.status) && r.attendanceId && !r.pulang)
      return (
        <Button
          variant="txt"
          size="sm"
          disabled={sibuk}
          onClick={() => catatPulang.mutate(r)}
        >
          Pulang
        </Button>
      );
    return null;
  }

  const kosong = data.baris.length === 0;

  return (
    <>
      <PageHeader
        eyebrow={
          data.bisaCatat
            ? formatEyebrow(new Date())
            : formatTanggal(data.tanggal, { hari: true }).toUpperCase()
        }
        title={judul}
        actions={
          <>
            {/* Rail 834 & bottom nav 390 tidak menampilkan sub-menu Kehadiran → tautan langsung ke halaman guru. */}
            <Button asChild variant="txt" className="min-[1001px]:hidden">
              <Link href="/attendance/guru">{istilah.kehadiran}</Link>
            </Button>
            <span className="relative">
              <Button
                variant="sec"
                onClick={() => tanggalRef.current?.showPicker?.()}
                aria-label="Pilih tanggal"
              >
                {data.bisaCatat
                  ? `Hari ini · ${formatTanggal(data.tanggal, { tanpaTahun: true })}`
                  : formatTanggal(data.tanggal)}
                <ChevronDown aria-hidden />
              </Button>
              {/* Input asli tetap dipakai untuk pemilih tanggal bawaan perangkat; tampilannya mengikuti format "19 Nov". */}
              <Input
                ref={tanggalRef}
                type="date"
                tabIndex={-1}
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full opacity-0"
                value={data.tanggal}
                max={data.hariIni}
                onChange={(e) => pilihTanggal(e.target.value)}
              />
            </span>
          </>
        }
      />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Nama dan jam di layar ini adalah contoh, bukan
            data lembaga mana pun. Pencatatan dinonaktifkan.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner
            title="Daftar kehadiran gagal diperbarui"
            description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`}
            onRetry={() => refetch()}
          />
        )}
        {!data.bisaCatat && !data.isDemo && (
          <InfoBox>
            Melihat <b>{formatTanggal(data.tanggal, { hari: true })}</b>. Jam
            tiba dan pulang hanya bisa dicatat untuk hari ini.{" "}
            <Link
              href="/attendance"
              className="font-semibold text-primary hover:underline"
            >
              Kembali ke hari ini
            </Link>
          </InfoBox>
        )}

        {kosong ? (
          <EmptyState
            title="Belum ada anak di kelas"
            description="Anak muncul di sini setelah didaftarkan ke kelas."
            action={
              <Button asChild>
                <Link href="/students/baru">Daftarkan anak</Link>
              </Button>
            }
          />
        ) : (
          <Stale stale={isError}>
            <div className="flex flex-col gap-5">
              <Tabs value={aktif} onValueChange={setTab}>
                <TabsList className="gap-5 overflow-x-auto">
                  {data.kelas
                    .filter((k) => k.terdaftar > 0)
                    .map((k) => (
                      <TabsTrigger
                        key={k.id}
                        value={k.id}
                        className="whitespace-nowrap"
                      >
                        {k.name}{" "}
                        <span className="tabular text-muted-foreground">
                          {k.tiba}/{k.terdaftar}
                        </span>
                      </TabsTrigger>
                    ))}
                  <TabsTrigger value="semua" className="whitespace-nowrap">
                    Semua{" "}
                    <span className="tabular text-muted-foreground">
                      {totalTiba}/{data.baris.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <DataTable
                key={aktif}
                rows={rows}
                columns={kolom}
                getRowId={(r) => `${r.studentId}-${r.classId}`}
                pageSize={50}
                searchPlaceholder="Cari anak"
                searchText={(r) => r.name}
                filters={[
                  { id: "semua", label: "Semua", predicate: () => true },
                  {
                    id: "belum",
                    label: "Belum tiba",
                    predicate: (r) => !r.status,
                  },
                  {
                    id: "tiba",
                    label: "Tiba",
                    predicate: (r) => tibaStatus(r.status),
                  },
                  {
                    id: "izin",
                    label: "Izin / Sakit / Alpa",
                    predicate: (r) =>
                      r.status === "permit" || r.status === "absent",
                  },
                ]}
                renderCard={(r) => (
                  <span className="flex items-center gap-3">
                    <KidAvatar
                      name={r.name}
                      id={r.studentId}
                      size="sm"
                      tiba={tibaStatus(r.status)}
                    />
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-[15px]">{r.name}</b>
                      <span className="block truncate text-[13px] text-muted-foreground">
                        {r.alergi ? (
                          <span className="font-semibold text-destructive">
                            {labelAlergi(r.alergi)} ·{" "}
                          </span>
                        ) : null}
                        {r.tiba
                          ? `tiba ${formatJam(r.tiba)}`
                          : statusKehadiran(r.status, r.permitType).label}
                        {r.pulang ? ` · pulang ${formatJam(r.pulang)}` : ""}
                      </span>
                    </span>
                    {aksi(r)}
                  </span>
                )}
              />

              {data.belumPulang.length > 0 && (
                <InfoBox icon={<History aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />}>
                  Belum check-out:{" "}
                  {data.belumPulang.slice(0, MAKS_BELUM_PULANG).map((b, i) => (
                    <span key={`${b.name}-${b.tanggal}`}>
                      {i > 0 && ", "}
                      <b>{b.name}</b>
                      {b.kelas && ` (${b.kelas})`}{" "}
                      {formatTanggal(b.tanggal, { tanpaTahun: true })}
                    </span>
                  ))}
                  {data.belumPulang.length > MAKS_BELUM_PULANG &&
                    `, dan ${data.belumPulang.length - MAKS_BELUM_PULANG} lainnya`}{" "}
                  dalam 7 hari terakhir. Koreksi jam pulang dengan alasan belum
                  tersedia di aplikasi.
                </InfoBox>
              )}
            </div>
          </Stale>
        )}
      </PageBody>
    </>
  );
}
