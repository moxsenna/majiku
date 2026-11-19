"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ClassChip,
  DataTable,
  DataTableSkeleton,
  EmptyState,
  ErrorBanner,
  KidAvatar,
  PageBody,
  PageHeader,
  Panel,
  Stale,
  StatusDot,
  type Column,
  type FilterOption,
} from "@/components/bunayo";
import { formatUmur } from "@/lib/format";
import { STATUS_AKUN_WALI } from "@/lib/status";
import { listSiswa, type SiswaRow } from "@/server/actions/siswa";
import { TagihanSiswaDot, urutanTagihan } from "./shared";
import { PanelProfil } from "./PanelProfil";

/**
 * S1 Siswa (tabel + panel profil). Bagian BARU yang disembunyikan: Impor Excel (A3), filter "Wali diundang"
 * (status undangan belum tercatat), kolom Catatan kesehatan selain alergi dari formulir trial.
 */
export default function Siswa({
  initialData,
  kelas,
  akunWali,
}: {
  initialData?: SiswaRow[];
  kelas: { id: string; name: string }[];
  akunWali: { id: string; name: string; email: string }[];
}) {
  const params = useSearchParams();
  const [aktifId, setAktifId] = useState<string | null>(null);
  const query = useQuery({ queryKey: ["siswa"], queryFn: listSiswa, initialData });
  const { data, isError, refetch } = query;

  const aktif = (data ?? []).filter((s) => s.isActive);
  const kolom: Column<SiswaRow>[] = [
    {
      id: "anak",
      header: "Anak",
      sticky: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="flex items-center gap-3">
          <KidAvatar name={r.name} id={r.id} photoUrl={r.photoUrl} size="sm" />
          <span className="min-w-0">
            <b className="block truncate font-semibold">{r.name}</b>
            <span className="text-xs text-muted-foreground">
              {r.dateOfBirth ? formatUmur(r.dateOfBirth) : "Tanggal lahir belum diisi"}
              {!r.isActive && " · nonaktif"}
            </span>
          </span>
        </span>
      ),
    },
    {
      id: "kelas",
      header: "Kelas",
      sortValue: (r) => r.kelas[0]?.name ?? "",
      cell: (r) =>
        r.kelas.length ? (
          <span className="flex flex-wrap gap-1">
            {r.kelas.map((k) => (
              <ClassChip key={k.id} id={k.id} name={k.name} />
            ))}
          </span>
        ) : (
          <span className="text-[13px] text-muted-foreground">Belum masuk kelas</span>
        ),
    },
    {
      id: "wali",
      header: "Wali · akun",
      sortValue: (r) => r.wali.name ?? "",
      cell: (r) => (
        <span className="flex flex-col gap-0.5">
          <span>{r.wali.name || <span className="text-muted-foreground">Belum diisi</span>}</span>
          <StatusDot info={r.wali.tertaut ? STATUS_AKUN_WALI.aktif : { label: "Belum tertaut", varian: "off" }} size="sm" />
        </span>
      ),
    },
    {
      id: "tagihan",
      header: "Tagihan bulan ini",
      sortValue: (r) => urutanTagihan(r.tagihan),
      cell: (r) => <TagihanSiswaDot t={r.tagihan} />,
    },
    {
      id: "catatan",
      header: "Alergi",
      hideOnMobile: true,
      cell: (r) => (r.alergi ? <span className="text-[13px] font-semibold text-destructive">{r.alergi}</span> : null),
    },
  ];

  const filters: FilterOption<SiswaRow>[] = [
    { id: "aktif", label: "Aktif", predicate: (r) => r.isActive },
    ...kelas.map((k) => ({ id: `k-${k.id}`, label: k.name, predicate: (r: SiswaRow) => r.isActive && r.kelas.some((x) => x.id === k.id) })),
    { id: "wali", label: "Wali belum tertaut", predicate: (r) => r.isActive && !r.wali.tertaut },
    { id: "tagih", label: "Tagihan perlu tindakan", predicate: (r) => r.isActive && urutanTagihan(r.tagihan) <= 1 },
    { id: "nonaktif", label: "Nonaktif", predicate: (r) => !r.isActive },
  ];

  const aksi = (
    <Button asChild>
      <Link href="/students/baru">
        <Plus aria-hidden />
        Daftarkan anak
      </Link>
    </Button>
  );

  return (
    <>
      <PageHeader eyebrow={data ? `${aktif.length} AKTIF` : undefined} title="Siswa" actions={aksi} />
      <PageBody>
        {!data ? (
          isError ? (
            <ErrorBanner title="Daftar siswa gagal dimuat" description="Periksa koneksi lalu coba lagi. Tidak ada data yang berubah." onRetry={() => refetch()} />
          ) : (
            <DataTableSkeleton rows={6} cols={4} />
          )
        ) : (
          <>
            {isError && (
              <ErrorBanner title="Daftar siswa gagal diperbarui" description="Yang tampil adalah data terakhir yang berhasil dimuat." onRetry={() => refetch()} />
            )}
            <Stale stale={isError}>
              <div className="grid items-start gap-5 min-[1001px]:grid-cols-[minmax(0,1fr)_380px]">
                <DataTable
                  rows={data}
                  columns={kolom}
                  getRowId={(r) => r.id}
                  searchText={(r) => [r.name, r.wali.name, r.wali.phone, r.wali.email].filter(Boolean).join(" ")}
                  searchPlaceholder="Cari nama anak atau wali"
                  initialQuery={params.get("q") ?? ""}
                  filters={filters}
                  defaultFilter={kelas.some((k) => k.id === params.get("kelas")) ? `k-${params.get("kelas")}` : "aktif"}
                  activeRowId={aktifId}
                  onRowClick={(r) => setAktifId(r.id)}
                  renderCard={(r) => (
                    <span className="flex items-center gap-3">
                      <KidAvatar name={r.name} id={r.id} photoUrl={r.photoUrl} size="md" />
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-[15px]">{r.name}</b>
                        <span className="block truncate text-[13px] text-muted-foreground">
                          {r.kelas.map((k) => k.name).join(", ") || "Belum masuk kelas"}
                          {r.alergi && <span className="font-semibold text-destructive"> · {r.alergi}</span>}
                        </span>
                      </span>
                      <TagihanSiswaDot t={r.tagihan} />
                    </span>
                  )}
                  empty={
                    <EmptyState
                      title="Belum ada siswa"
                      description="Daftarkan anak pertama beserta wali dan kelasnya. Setelah itu kehadiran, laporan harian, dan tagihan bisa mulai dicatat."
                      action={aksi}
                    />
                  }
                />
                {data.length > 0 && (
                  <div className="sticky top-6 max-h-[calc(100vh-48px)] overflow-y-auto max-[1000px]:hidden">
                    {aktifId ? (
                      <PanelProfil id={aktifId} kelas={kelas} akunWali={akunWali} />
                    ) : (
                      <Panel className="p-5 text-sm text-muted-foreground">Klik baris untuk membuka ringkasan anak di sini.</Panel>
                    )}
                  </div>
                )}
              </div>
            </Stale>
          </>
        )}
      </PageBody>

      {/* ≤ 1000 px: panel profil sebagai lembar samping */}
      {aktifId && (
        <div className="fixed inset-0 z-40 hidden max-[1000px]:block" role="dialog" aria-modal="true" aria-label="Ringkasan anak">
          <button type="button" aria-label="Tutup" className="absolute inset-0 bg-scrim/45" onClick={() => setAktifId(null)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col overflow-y-auto bg-background p-4 shadow-sheet">
            <Button variant="txt" size="icon" className="self-end" onClick={() => setAktifId(null)} aria-label="Tutup">
              <X />
            </Button>
            <PanelProfil id={aktifId} kelas={kelas} akunWali={akunWali} />
          </div>
        </div>
      )}
    </>
  );
}
