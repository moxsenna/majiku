/**
 * Utilitas deteksi akun demo vs akun produksi Bunayo.
 *
 * Akun demo (*@bunayo.test, *@majiku.test, demo@bunayo.id, demo+*, dan *.test@gmail.com)
 * diarahkan ke tenant demo (tnt_demo) yang tersinkronisasi penuh dan terkunci secara aman
 * dari modifikasi mutasi langsung agar data percontohan tetap bersih bagi seluruh visitor.
 *
 * Semua akun riil (termasuk owner moxsenna@gmail.com dan pendaftar baru)
 * mendapatkan data aktual dari Neon database.
 */
export const DEMO_TENANT_ID = "tnt_demo";

export function isDemoEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized.endsWith("@bunayo.test") ||
    normalized.endsWith("@majiku.test") ||
    normalized === "admin.test@gmail.com" ||
    normalized === "tutor.test@gmail.com" ||
    normalized === "parent.test@gmail.com" ||
    normalized === "demo@bunayo.id" ||
    normalized === "demo@majiku.id" ||
    normalized.startsWith("demo+")
  );
}

export function isDemoTenant(tenantId?: string | null): boolean {
  return tenantId === DEMO_TENANT_ID;
}
