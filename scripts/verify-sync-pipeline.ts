import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../src/db";
import { user, students, invoices, studentEnrollments, classes } from "../src/db/schema";
import { eq, or, and } from "drizzle-orm";

async function main() {
  console.log("=== Verifikasi Sinkronisasi Lembaga <-> Orang Tua ===");
  
  // 1. Cek akun parent demo
  const [parent] = await db.select().from(user).where(eq(user.email, "parent@majiku.test")).limit(1);
  if (!parent) {
    throw new Error("User parent@majiku.test tidak ditemukan");
  }
  console.log("✓ Akun parent ditemukan:", parent.name, `(${parent.email})`, "ID:", parent.id);

  // 2. Cek siswa yang terhubung ke parent ini
  const myStudents = await db
    .select({
      id: students.id,
      name: students.name,
      parentUserId: students.parentUserId,
      parentEmail: students.parentEmail,
      className: classes.name,
    })
    .from(students)
    .leftJoin(studentEnrollments, and(eq(studentEnrollments.studentId, students.id), eq(studentEnrollments.isActive, true)))
    .leftJoin(classes, eq(studentEnrollments.classId, classes.id))
    .where(
      and(
        or(
          eq(students.parentUserId, parent.id),
          eq(students.parentEmail, parent.email)
        ),
        eq(students.isActive, true)
      )
    );

  console.log(`✓ Siswa terdaftar untuk ${parent.email} (${myStudents.length} anak):`);
  for (const s of myStudents) {
    console.log(`  - [${s.id}] ${s.name} (Kelas: ${s.className || "Tanpa Kelas"}) | parentUserId: ${s.parentUserId}`);
  }

  if (myStudents.length < 2) {
    throw new Error("Jumlah siswa tidak sesuai seed data (harus minimal 2 anak)");
  }

  // 3. Cek tagihan SPP untuk parent ini
  const parentInvoices = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      studentName: students.name,
      total: invoices.total,
      status: invoices.status,
    })
    .from(invoices)
    .innerJoin(students, eq(invoices.studentId, students.id))
    .where(or(eq(students.parentUserId, parent.id), eq(students.parentEmail, parent.email)));

  console.log(`✓ Tagihan SPP ditemukan (${parentInvoices.length} invoice):`);
  for (const inv of parentInvoices) {
    console.log(`  - ${inv.invoiceNumber}: Siswa ${inv.studentName} | Total Rp ${Number(inv.total).toLocaleString()} | Status: ${inv.status}`);
  }

  // 4. Verifikasi nama anak di daftar siswa SINKRON dengan nama anak di tagihan
  const studentNames = new Set(myStudents.map(s => s.name));
  for (const inv of parentInvoices) {
    if (!studentNames.has(inv.studentName)) {
      throw new Error(`Tagihan untuk ${inv.studentName} tidak ditemukan di daftar anak!`);
    }
  }

  console.log("✓ SEMUA NAMA ANAK DI BILLING 100% SINKRON DENGAN DAFTAR ANAK!");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
