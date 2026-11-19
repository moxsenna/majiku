"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ClassChip,
  DataTable,
  DataTableSkeleton,
  EmptyState,
  ErrorBanner,
  InfoBox,
  KidAvatar,
  PageBody,
  PageHeader,
  Panel,
  PanelHeader,
  Stale,
  StatusDot,
  type Column,
} from "@/components/bunayo";
import { formatJam } from "@/lib/format";
import { istilahLembaga } from "@/lib/istilah";
import type { StatusInfo } from "@/lib/status";
import { getPengaturan, type PengaturanData, type StafItem } from "@/server/actions/pengaturan";
import { StafDialog } from "./StafDialog";

/**
 * O13 Staf & peran — daftar staf lembaga dari tabel tutors + pemilik, akun tertaut, kelas yang diampu.
 * Disembunyikan (BARU, REDESIGN-BACKLOG O13): peran per lembaga (Admin/Keuangan), undangan WA/email dengan status Diundang,
 * akses web/aplikasi, matriks izin per peran.
 */

function statusStaf(s: StafItem): StatusInfo {
  if (!s.isActive) return { label: "Nonaktif", varian: "off" };
  if (!s.akun) return { label: "Belum punya akun", varian: "wait" };
  return { label: "Aktif", varian: "ok" };
}

export default function Staf({ initialData }: { initialData?: PengaturanData }) {
  const query = useQuery({ queryKey: ["pengaturan"], queryFn: getPengaturan, initialData });
  const { data, isError, refetch } = query;
  const [dialog, setDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="PENGATURAN" title="Staf & peran" />
        <PageBody>
          {isError ? (
            <ErrorBanner title="Daftar staf gagal dimuat" description="Tidak ada data yang berubah. Aman untuk mencoba lagi." onRetry={() => refetch()} />
          ) : (
            <DataTableSkeleton rows={5} cols={4} />
          )}
        </PageBody>
      </>
    );
  }

  const istilah = istilahLembaga(data.lembaga.type);
  const bisaUbah = !data.isDemo;
  const staf = data.staf.find((s) => s.id === dialog.id) ?? null;

  const kolom: Column<StafItem>[] = [
    {
      id: "nama",
      header: "Nama",
      sortValue: (s) => s.name,
      cell: (s) => (
        <span className="flex items-center gap-3">
          <KidAvatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="sm" />
          <span className="min-w-0">
            <b className="block truncate">{s.name}</b>
            <small className="block truncate text-[13px] text-muted-foreground">{s.phone ?? s.email ?? "—"}</small>
          </span>
        </span>
      ),
    },
    { id: "peran", header: "Peran", cell: () => istilah.guru },
    {
      id: "kelas",
      header: "Kelas",
      cell: (s) =>
        s.kelas.length ? (
          <span className="flex flex-wrap gap-1.5">
            {s.kelas.map((k) => (
              <ClassChip key={k.assignmentId} name={k.name} id={k.classId} />
            ))}
          </span>
        ) : (
          <span className="text-[13px] text-muted-foreground">—</span>
        ),
    },
    {
      id: "akun",
      header: "Akun",
      hideOnMobile: true,
      cell: (s) => <span className="block max-w-[220px] truncate text-[13px]">{s.akun?.email ?? <span className="text-muted-foreground">—</span>}</span>,
    },
    { id: "status", header: "Status", sortValue: (s) => statusStaf(s).label, cell: (s) => <StatusDot info={statusStaf(s)} size="sm" /> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="PENGATURAN"
        title="Staf & peran"
        actions={
          bisaUbah && (
            <Button onClick={() => setDialog({ open: true, id: null })}>
              <UserPlus aria-hidden />
              Tambah {istilah.guruKecil}
            </Button>
          )
        }
      />
      <PageBody>
        {data.isDemo && (
          <InfoBox>
            <b>Mode demo.</b> Nama staf di layar ini adalah contoh dari desain, bukan data lembaga mana pun. Perubahan dinonaktifkan.
          </InfoBox>
        )}
        {isError && (
          <ErrorBanner title="Daftar staf gagal diperbarui" description={`Yang tampil adalah data terakhir pukul ${formatJam(data.diambilPada)}.`} onRetry={() => refetch()} />
        )}
        <Stale stale={isError}>
          <div className="flex flex-col gap-5">
            {data.pemilik && (
              <Panel>
                <PanelHeader title="Pemilik" meta="akses penuh" />
                <div className="flex items-center gap-3 px-[18px] py-3">
                  <KidAvatar name={data.pemilik.name} id={data.pemilik.email} size="sm" />
                  <span className="min-w-0 flex-1">
                    <b className="block truncate">{data.pemilik.name}</b>
                    <small className="block truncate text-[13px] text-muted-foreground">{data.pemilik.email}</small>
                  </span>
                  <StatusDot varian="ok" size="sm">
                    Aktif
                  </StatusDot>
                </div>
              </Panel>
            )}
            {data.staf.length === 0 ? (
              <EmptyState
                title={`Belum ada ${istilah.guruKecil}`}
                description={`Tambahkan ${istilah.guruKecil} agar bisa ditugaskan ke kelas, mengabsen anak, dan menulis laporan harian dari aplikasinya.`}
                action={bisaUbah ? <Button onClick={() => setDialog({ open: true, id: null })}>Tambah {istilah.guruKecil}</Button> : undefined}
              />
            ) : (
              <DataTable
                rows={data.staf}
                columns={kolom}
                getRowId={(s) => s.id}
                searchPlaceholder="Cari nama, email, atau nomor"
                searchText={(s) => [s.name, s.email, s.phone, s.akun?.email].filter(Boolean).join(" ")}
                filters={[
                  { id: "aktif", label: "Aktif", predicate: (s) => s.isActive },
                  { id: "tanpa-akun", label: "Belum punya akun", predicate: (s) => s.isActive && !s.akun },
                  { id: "nonaktif", label: "Nonaktif", predicate: (s) => !s.isActive },
                ]}
                onRowClick={bisaUbah ? (s) => setDialog({ open: true, id: s.id }) : undefined}
                renderCard={(s) => (
                  <span className="flex flex-col gap-2">
                    <span className="flex items-center gap-3">
                      <KidAvatar name={s.name} id={s.id} photoUrl={s.photoUrl} size="sm" />
                      <b className="flex-1 truncate">{s.name}</b>
                      <StatusDot info={statusStaf(s)} size="sm" />
                    </span>
                    {s.kelas.length > 0 && (
                      <span className="flex flex-wrap gap-1.5">
                        {s.kelas.map((k) => (
                          <ClassChip key={k.assignmentId} name={k.name} id={k.classId} />
                        ))}
                      </span>
                    )}
                  </span>
                )}
              />
            )}
            <p className="text-[13px] text-muted-foreground">
              Semua staf saat ini berperan {istilah.guru}: mengabsen dan menulis laporan untuk kelas yang diampu. Peran Admin dan Keuangan per lembaga,
              undangan lewat WhatsApp, dan pengaturan izin per peran belum tersedia.
            </p>
          </div>
        </Stale>
      </PageBody>
      {bisaUbah && (
        <StafDialog
          staf={staf}
          kelas={data.kelas}
          akunBisaDitaut={data.akunBisaDitaut}
          guru={istilah.guru}
          open={dialog.open}
          onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        />
      )}
    </>
  );
}
