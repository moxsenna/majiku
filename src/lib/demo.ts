/**
 * Utilitas deteksi akun demo vs akun produksi MAJIKU.
 *
 * Akun demo (*@majiku.test, demo@majiku.id, demo+*) menyajikan mock data
 * untuk kebutuhan presentasi, showcase, dan sales tanpa mengotori DB riil.
 *
 * Semua akun riil (termasuk owner moxsenna@gmail.com dan pendaftar baru)
 * mendapatkan data aktual dari Neon database.
 */
export function isDemoEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized.endsWith("@majiku.test") ||
    normalized === "demo@majiku.id" ||
    normalized.startsWith("demo+")
  );
}
