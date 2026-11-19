// Definisi paket berlangganan SaaS MAJIKU.
// Modul murni (bukan "use server") — aman diimpor dari client & server component.

export interface SubscriptionPlan {
  id: "basic" | "pro" | "enterprise";
  name: string;
  badge?: string;
  popular?: boolean;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: "basic",
    name: "Paket Basic",
    description: "Untuk daycare atau bimbel kecil yang baru merintis",
    priceMonthly: 299000,
    priceYearly: 2990000, // Hemat 2 bulan
    features: [
      "Hingga 50 siswa aktif",
      "2 kelas / rombel belajar",
      "Absensi digital",
      "Laporan harian & dokumentasi kegiatan",
      "Chat langsung dengan orang tua",
      "Support via email & komunitas",
    ],
  },
  pro: {
    id: "pro",
    name: "Paket Pro",
    badge: "Paling Populer",
    popular: true,
    description: "Untuk lembaga yang siap bertumbuh cepat & profesional",
    priceMonthly: 599000,
    priceYearly: 5990000, // Hemat 2 bulan
    features: [
      "Hingga 200 siswa aktif",
      "10 kelas / rombel belajar",
      "Monitoring kehadiran harian",
      "Billing SPP otomatis & pembayaran PayCore",
      "Manajemen tutor & kalkulasi honor",
      "Cloud R2 galeri foto tanpa batas",
      "Broadcast pengumuman wali murid",
      "Priority support via WhatsApp",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Paket Enterprise",
    badge: "Skala Besar",
    description: "Untuk lembaga besar dengan kebutuhan khusus",
    priceMonthly: 1500000,
    priceYearly: 15000000, // Hemat 2 bulan
    features: [
      "Unlimited siswa & kelas",
      "Integrasi payment gateway Duitku/PayCore",
      "Dedicated Account Manager",
      "Pelatihan & onboarding staf khusus",
    ],
  },
};

export type PlanId = "basic" | "pro" | "enterprise";

export function getPlanPrice(plan: SubscriptionPlan, billingCycle: "monthly" | "yearly"): number {
  return billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
}
