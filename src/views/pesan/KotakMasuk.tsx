"use client";

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, InfoBox, PageBody, PageHeader } from "@/components/bunayo";
import { useIstilah } from "@/hooks/useIstilah";

/**
 * O10 Kotak masuk. Admin belum punya percakapan dengan orang tua: tabel `conversations` hanya menyimpan
 * pasangan wali ↔ guru (N29). Layar ini jujur menyatakannya dan mengarahkan ke kanal yang ada.
 * BARU (REDESIGN-BACKLOG O10/P6): percakapan per anak (tenant, student) dengan peserta admin + guru kelas,
 * penanda belum dibalas 4/24 jam, saran balasan.
 */
export default function KotakMasuk() {
  const istilah = useIstilah();
  return (
    <>
      <PageHeader
        eyebrow="PESAN"
        title="Kotak masuk"
        actions={
          <Button asChild variant="sec">
            <Link href="/messages">
              <Megaphone aria-hidden />
              Pengumuman
            </Link>
          </Button>
        }
      />
      <PageBody>
        <EmptyState
          title="Kotak masuk lembaga belum tersedia"
          description={`Saat ini orang tua mengirim pesan langsung ke ${istilah.guruKecil} kelas lewat aplikasi, dan ${istilah.guruKecil} membalas dari portalnya. Admin belum bisa ikut membaca atau membalas percakapan itu.`}
          action={
            <Button asChild>
              <Link href="/messages">Tulis pengumuman</Link>
            </Button>
          }
        />
        <InfoBox>
          Untuk kabar ke semua keluarga, pakai <b>Pengumuman</b>. Untuk satu keluarga, buka profil anak di{" "}
          <Link href="/students" className="font-semibold text-primary hover:underline">
            Siswa
          </Link>{" "}
          lalu hubungi wali lewat WhatsApp.
        </InfoBox>
      </PageBody>
    </>
  );
}
