/**
 * Enum schema → label Bahasa Indonesia + varian tampilan (kamus Design System).
 * Status biasa = titik + teks. Varian "alert" (pil merah muda) hanya untuk yang menuntut tindakan sekarang.
 */

export type VarianStatus = "ok" | "wait" | "info" | "ang" | "off" | "alert";

export interface StatusInfo {
  label: string;
  varian: VarianStatus;
}

/* ---------- Tagihan (invoice_status) ---------- */
export type InvoiceStatus = "unpaid" | "paid" | "overdue" | "partial";

export const STATUS_TAGIHAN: Record<InvoiceStatus, StatusInfo> = {
  paid: { label: "Lunas", varian: "ok" },
  unpaid: { label: "Menunggu Pembayaran", varian: "wait" },
  partial: { label: "Dibayar Sebagian", varian: "info" },
  overdue: { label: "Terlambat", varian: "alert" },
};

/** "Perlu Ditagih" bukan status invoice: anak aktif tanpa tagihan periode berjalan. */
export const STATUS_PERLU_DITAGIH: StatusInfo = { label: "Perlu Ditagih", varian: "off" };

export function statusTagihan(status: string | null | undefined, hariTerlambat?: number): StatusInfo {
  const s = STATUS_TAGIHAN[(status ?? "unpaid") as InvoiceStatus] ?? STATUS_TAGIHAN.unpaid;
  if (s === STATUS_TAGIHAN.overdue && hariTerlambat && hariTerlambat > 0) {
    return { ...s, label: `Terlambat ${hariTerlambat} hari` };
  }
  return s;
}

/* ---------- Kehadiran siswa (attendance_status + permit_type) ---------- */
export type AttendanceStatus = "present" | "absent" | "late" | "permit";
export type PermitType = "sick" | "family" | "other";

export const STATUS_KEHADIRAN: Record<AttendanceStatus | "pending", StatusInfo> = {
  present: { label: "Hadir", varian: "ok" },
  late: { label: "Terlambat Datang", varian: "wait" },
  permit: { label: "Izin", varian: "info" },
  absent: { label: "Alpa", varian: "alert" },
  pending: { label: "Belum tiba", varian: "off" },
};

export function statusKehadiran(status: string | null | undefined, permitType?: string | null): StatusInfo {
  if (!status) return STATUS_KEHADIRAN.pending;
  if (status === "permit" && permitType === "sick") return { label: "Sakit", varian: "info" };
  return STATUS_KEHADIRAN[status as AttendanceStatus] ?? STATUS_KEHADIRAN.pending;
}

/* ---------- Kehadiran guru (tutor_attendance.status, teks bebas) ---------- */
export function statusKehadiranGuru(status: string | null | undefined): StatusInfo {
  switch ((status ?? "").toLowerCase()) {
    case "hadir":
    case "present":
      return { label: "Hadir", varian: "ok" };
    case "terlambat":
    case "late":
      return { label: "Terlambat Datang", varian: "wait" };
    case "izin":
    case "cuti":
    case "permit":
      return { label: "Izin", varian: "info" };
    case "sakit":
    case "sick":
      return { label: "Sakit", varian: "info" };
    case "alpa":
    case "absent":
      return { label: "Alpa", varian: "alert" };
    default:
      return { label: "Belum check-in", varian: "off" };
  }
}

/* ---------- Trial (trial_status) ---------- */
export type TrialStatus =
  | "submitted" | "scheduled" | "awaiting_review" | "recommended" | "repeat_trial" | "not_suitable" | "admitted";

export const STATUS_TRIAL: Record<TrialStatus, StatusInfo> = {
  submitted: { label: "Pengajuan baru", varian: "wait" },
  scheduled: { label: "Terjadwal", varian: "info" },
  awaiting_review: { label: "Perlu observasi", varian: "ang" },
  recommended: { label: "Direkomendasikan", varian: "ok" },
  repeat_trial: { label: "Trial ulang", varian: "wait" },
  not_suitable: { label: "Tidak lanjut", varian: "off" },
  admitted: { label: "Diterima", varian: "ok" },
};

export function statusTrial(status: string | null | undefined): StatusInfo {
  return STATUS_TRIAL[(status ?? "submitted") as TrialStatus] ?? STATUS_TRIAL.submitted;
}

/* ---------- Daftar tunggu (waiting_list_status) ---------- */
export const STATUS_DAFTAR_TUNGGU: Record<string, StatusInfo> = {
  waiting: { label: "Menunggu kursi", varian: "wait" },
  notified: { label: "Sudah dikabari", varian: "info" },
  confirmed: { label: "Dikonfirmasi", varian: "ok" },
  expired: { label: "Kedaluwarsa", varian: "off" },
  cancelled: { label: "Dibatalkan", varian: "off" },
};

/* ---------- Laporan harian (report_status) & RPP (plan_status) ---------- */
export const STATUS_LAPORAN: Record<string, StatusInfo> = {
  draft: { label: "Draf", varian: "off" },
  submitted: { label: "Terkirim", varian: "ok" },
};

export const STATUS_RPP: Record<string, StatusInfo> = {
  draft: { label: "Draf", varian: "off" },
  upcoming: { label: "Akan datang", varian: "info" },
  in_progress: { label: "Berjalan", varian: "wait" },
  completed: { label: "Selesai", varian: "ok" },
};

/* ---------- Akun wali ---------- */
export const STATUS_AKUN_WALI = {
  aktif: { label: "Aktif", varian: "ok" },
  diundang: { label: "Diundang", varian: "wait" },
  belum: { label: "Belum diundang", varian: "off" },
} satisfies Record<string, StatusInfo>;

/* ---------- Cuti guru (tutor_leave_requests.status) ---------- */
export const STATUS_CUTI: Record<string, StatusInfo> = {
  pending: { label: "Menunggu persetujuan", varian: "wait" },
  approved: { label: "Disetujui", varian: "ok" },
  rejected: { label: "Ditolak", varian: "off" },
};

/* ---------- Pembayaran PayCore (payment_orders.payment_status) ---------- */
export function statusPembayaran(status: string | null | undefined): StatusInfo {
  switch ((status ?? "").toLowerCase()) {
    case "paid":
    case "settled":
    case "success":
      return { label: "Berhasil", varian: "ok" };
    case "pending":
      return { label: "Menunggu", varian: "wait" };
    case "expired":
      return { label: "Kedaluwarsa", varian: "off" };
    case "failed":
    case "cancelled":
      return { label: "Gagal", varian: "off" };
    default:
      return { label: status || "—", varian: "off" };
  }
}
