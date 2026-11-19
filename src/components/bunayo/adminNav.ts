import {
  CalendarDays,
  ClipboardCheck,
  House,
  Menu,
  MessageCircle,
  NotebookPen,
  Settings,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { Istilah } from "@/lib/istilah";
import type { AdminShellProps, NavEntry, NavItem } from "./AdminShell";

/**
 * IA admin Bunayo (kit.js · UIUX-REVIEW §8).
 * Sub-menu hanya memuat layar yang sudah ada; layar BARU yang belum dibangun
 * (Perkembangan, Kotak Masuk, Impor Data, Paket & Biaya, Laporan, dll.) tidak ditampilkan —
 * lihat docs/REDESIGN-BACKLOG.md.
 */
export function adminNav(istilah: Istilah): NavEntry[] {
  return [
    { key: "hari", label: "Hari Ini", href: "/dashboard", icon: House },
    { group: "Harian" },
    {
      key: "hadir",
      label: "Kehadiran",
      short: "Hadir",
      href: "/attendance",
      icon: ClipboardCheck,
      sub: [
        { label: "Siswa", href: "/attendance", exact: true },
        { label: istilah.guru, href: "/attendance/guru" },
      ],
    },
    {
      key: "belajar",
      label: "Pembelajaran",
      short: "Belajar",
      href: "/daily-reports",
      icon: NotebookPen,
      match: ["/lesson-plans"],
      sub: [
        { label: "Laporan Harian", href: "/daily-reports" },
        { label: "RPP", href: "/lesson-plans" },
      ],
    },
    {
      key: "pesan",
      label: "Pesan",
      href: "/messages",
      icon: MessageCircle,
      sub: [
        { label: "Pengumuman", href: "/messages", exact: true },
        { label: "Kotak Masuk", href: "/messages/kotak-masuk" },
      ],
    },
    { group: "Kelola" },
    { key: "siswa", label: "Siswa & Keluarga", short: "Siswa", href: "/students", icon: UsersRound },
    { key: "trial", label: "Pendaftaran & Trial", href: "/crm", indent: true },
    {
      key: "kelas",
      label: "Kelas & Jadwal",
      short: "Kelas",
      href: "/classes",
      icon: CalendarDays,
      match: ["/schedule"],
      sub: [
        { label: "Kelas & Program", href: "/classes" },
        { label: "Kalender Sesi", href: "/schedule" },
      ],
    },
    {
      key: "uang",
      label: "Keuangan",
      short: "Uang",
      href: "/billing",
      icon: Wallet,
      sub: [
        { label: "Ringkasan", href: "/billing/ringkasan" },
        { label: "Tagihan", href: "/billing", exact: true },
        { label: "Pembayaran Masuk", href: "/billing/masuk" },
        { label: istilah.honor, href: "/billing/honor" },
      ],
    },
  ];
}

export const adminSettingsNav: NavItem = {
  key: "atur",
  label: "Pengaturan",
  short: "Atur",
  href: "/settings",
  icon: Settings,
  sub: [
    { label: "Lembaga & Cabang", href: "/settings", exact: true },
    { label: "Staf & Peran", href: "/settings/staff" },
  ],
};

export const adminMobileTabs: AdminShellProps["mobileTabs"] = [
  { key: "hari", label: "Hari Ini", icon: House, href: "/dashboard" },
  { key: "hadir", label: "Kehadiran", icon: ClipboardCheck, href: "/attendance" },
  { key: "pesan", label: "Pesan", icon: MessageCircle, href: "/messages" },
  { key: "uang", label: "Keuangan", icon: Wallet, href: "/billing" },
  { key: "lainnya", label: "Lainnya", icon: Menu },
];
