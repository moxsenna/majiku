# Fase 1: Migrasi MAJIKU ke Next.js + Neon + BetterAuth + Cloudflare Workers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memindahkan MAJIKU (SPA Vite+React+Supabase) ke Next.js App Router dengan Neon Postgres + Drizzle + BetterAuth, terdeploy di Cloudflare Workers — perilaku identik, nol Supabase, nol Lovable.

**Architecture:** Semua 35 halaman dipindah sebagai client components (perilaku identik). Akses DB hanya lewat server actions (Drizzle + `@neondatabase/serverless`). Auth = BetterAuth (email+password) dengan tabel `user_roles` terpisah agar semantik `hasRole` tidak berubah. Deploy via `@opennextjs/cloudflare`.

**Tech Stack:** Next.js 15 (App Router), React 18, TypeScript, Tailwind v3, shadcn/ui, Drizzle ORM, `@neondatabase/serverless` (neon-http), BetterAuth, TanStack Query v5, `@opennextjs/cloudflare` + Wrangler.

**Spec:** `docs/superpowers/specs/2026-10-04-nextjs-neon-cloudflare-migration-design.md`

## Global Constraints (berlaku untuk SEMUA task)

1. **Port perilaku-identik** — tidak ada perbaikan produk, tidak ada fitur baru (spec §7).
2. **npm saja** — hapus `bun.lock`, `bun.lockb`; semua command pakai `npm`.
3. `images: { unoptimized: true }` di Fase 1 (spec §2.7).
4. Dua URL Neon: `NEON_DATABASE_URL` (pooled, runtime) dan `NEON_DATABASE_URL_DIRECT` (migrasi) (spec §2.3).
5. `hasRole(role)`: `admin` memenuhi semua role — perilaku `src/lib/roleRedirect.ts` lama dipertahankan (spec §2.4).
6. **Komponen orphan TIDAK dipindah** (spec §7): `CreateInvoiceDialog`, `LeaveManagementWidget`, `PushNotificationSetup`, `ActivityNotificationWidget`, `NavLink`, `AffiliateWidget`, `BrandPlacementWidget`, `ChurnManagementWidget`, `RewardWidget`.
7. Di akhir plan: `grep -ri "supabase\|lovable" src/ package.json` harus kosong.
8. Verifikasi runtime selalu via `opennextjs-cloudflare dev/preview` untuk parity Workers — `next dev` saja tidak dianggap cukup (spec §6).
9. Route groups: `(public)`, `(admin)`, `(tutor)`, `(parent)`; `/vendor/dashboard` → `/vendor`; `/demo` dihapus (spec §2.2).
10. `src/pages/` **wajib** rename ke `src/views/` — kalau tidak, Next menganggapnya Pages Router (konflik fatal).
11. Environment variables: `NEON_DATABASE_URL`, `NEON_DATABASE_URL_DIRECT`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. Simpan di `.env.local` (git-ignored) dan `.dev.vars` (untuk wrangler dev). NEMATKAN `.env` lama dari Supabase — buang isinya, jangan dipakai.

## Appendix A — Aturan Porting Router (dipakai Task 4 & 5)

Terapkan ke setiap file di `src/views/` dan komponen yang memakai react-router-dom. Jalankan sekali sebagai baseline, lalu periksa manual residual:

```bash
cd src
# 1) Link: named→default, prop to→href
grep -rl 'react-router-dom' --include='*.tsx' . | xargs sed -i \
  -e 's/import { Link } from "react-router-dom";/import Link from "next\/link";/' \
  -e 's/<Link to=/<Link href=/g' \
  -e 's/<NavLink to=/<Link href=/g'
# 2) useNavigate → useRouter
grep -rl 'useNavigate' --include='*.tsx' . | xargs sed -i \
  -e 's/import { useNavigate } from "react-router-dom";/import { useRouter } from "next\/navigation";/' \
  -e 's/useNavigate(/useRouter(/g' \
  -e 's/navigate(\(.*\))/router.push(\1)/g'
# 3) useLocation → usePathname
grep -rl 'useLocation' --include='*.tsx' . | xargs sed -i \
  -e 's/import { useLocation } from "react-router-dom";/import { usePathname } from "next\/navigation";/' \
  -e 's/useLocation()/usePathname()/g' \
  -e 's/location\.pathname/pathname/g'
```

Sisa mapping manual (sed tidak bisa — cek dengan `grep -rn "react-router-dom" src`):

| react-router | Next.js |
|---|---|
| `import { useParams } from "react-router-dom"` | `import { useParams } from "next/navigation"` (API identik) |
| `import { useSearchParams } from "react-router-dom"` | `import { useSearchParams } from "next/navigation"`; `const [params] = useSearchParams()` (tidak ada setter dari hook ini) |
| `<Navigate to="/x" replace />` (render-time) | `redirect("/x")` dari `next/navigation`, dipanggil saat render |
| `<Routes>/<Route path="x" element={<X/>}/>` | hapus — diganti file `src/app/**/page.tsx` |
| `useNavigate()` dengan `navigate(-1)` | `router.back()` |

**Contoh hasil porting lengkap** (`src/views/ParentInvoiceDetail.tsx` dipanggil dari `src/app/(parent)/parent/invoice/[id]/page.tsx`):

```tsx
// src/app/(parent)/parent/invoice/[id]/page.tsx
"use client";
import ParentInvoiceDetail from "@/views/ParentInvoiceDetail";
export default function Page() {
  return <ParentInvoiceDetail />;
}
```

```tsx
// src/views/ParentInvoiceDetail.tsx (bagian yang berubah saja)
"use client";
import { useParams } from "next/navigation";
// const { id } = useParams(); — identik dengan versi react-router
export default function ParentInvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  // ...sisa file tidak berubah
}
```

---

### Task 1: Scaffold Next.js in-place + Tailwind + shadcn + shell render

**Files:**
- Create: `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `.env.local` (lokal saja), `.gitignore` (tambah `.next/`, `.open-next/`, `.dev.vars`, `.env.local`, `.env*.local`)
- Modify: `package.json` (deps + scripts), `tsconfig.json`, `postcss.config.js`, `tailwind.config.ts` (konten sudah ada, tambah content path), `src/index.css` → `src/app/globals.css`
- Move: `src/pages/` → `src/views/`
- Delete: tidak ada di task ini

**Interfaces:**
- Produces: Next app yang `npm run dev` → 200 di `http://localhost:3000`; alias `@/*` tetap; semua komponen lama bisa di-import dari `@/components/...`.

- [ ] **Step 1: Install deps Next**

```bash
npm install next@15 react@18 react-dom@18 && npm install -D @types/node @types/react @types/react-dom
```

- [ ] **Step 2: Rename src/pages → src/views dan pindahkan CSS**

```bash
git mv src/pages src/views
git mv src/index.css src/app/globals.css 2>/dev/null || (mkdir -p src/app && git mv src/index.css src/app/globals.css)
```

- [ ] **Step 3: Buat `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
```

- [ ] **Step 4: Ganti `tsconfig.json`** (hapus `tsconfig.app.json`, `tsconfig.node.json`, `vite-env.d.ts` nanti di Task 8 — di task ini tambahkan path Next dulu di atas properti lama)

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "supabase"]
}
```

- [ ] **Step 5: Update `tailwind.config.ts`** — ganti array `content`:

```ts
content: ["./src/**/*.{ts,tsx}"],
```

- [ ] **Step 6: Buat `src/app/layout.tsx`** (provider lain menyusul di Task 5; sementara minimal agar dev server jalan)

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAJIKU — Manajemen Daycare, Preschool & Bimbel",
  description: "Platform manajemen daycare, preschool, dan bimbel multi-tenant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Buat `src/app/page.tsx`** sementara (diganti Task 4):

```tsx
export default function Home() {
  return <div className="p-8">MAJIKU — migrasi berjalan</div>;
}
```

- [ ] **Step 8: Update scripts di `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "lint": "eslint .",
  "start": "next start"
}
```

- [ ] **Step 9: Update `.gitignore`** — tambahkan:

```
.next/
.open-next/
.dev.vars
.env.local
.env*.local
next-env.d.ts
```

- [ ] **Step 10: Verifikasi dev server**

Run: `npm run dev` → buka `http://localhost:3000`
Expected: HTTP 200, teks "MAJIKU — migrasi berjalan", tanpa error Tailwind di terminal. Matikan server.

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "feat(next): scaffold Next.js in-place dengan Tailwind, rename src/pages ke src/views"
```

---

### Task 2: Skema Drizzle + migrasi Neon (11 tabel + 2 stored procedure + trigger)

**Files:**
- Create: `src/db/schema.ts`, `src/db/index.ts`, `drizzle.config.ts`, `drizzle/migrations/0001_init.sql`, `drizzle/migrations/0002_routines.sql`, `src/db/healthcheck.ts`
- Install: `drizzle-orm @neondatabase/serverless dotenv` + `drizzle-kit tsx` (dev)

**Interfaces:**
- Produces (dipakai Task 4/5/6):
  - `import { db } from "@/db"` — instance drizzle (driver neon-http, pooled URL).
  - Semua tabel di-export dari `@/db/schema` dengan nama camelCase tabel: `classes, tutors, tutorClassAssignments, tutorBonuses, students, studentEnrollments, attendance, invoices, waitingList, userRoles, trialApplications, user, session, account, verification`.
  - `ensureSchemaOk()` dari `@/db/healthcheck` → `Promise<{ tables: string[] }>`.

- [ ] **Step 1: Install**

```bash
npm install drizzle-orm @neondatabase/serverless dotenv
npm install -D drizzle-kit tsx
```

- [ ] **Step 2: Buat `src/db/index.ts`**

```ts
import { drizzle } from "drizzle-orm/neon-http";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";

if (!process.env.NEON_DATABASE_URL) {
  throw new Error("NEON_DATABASE_URL tidak diset");
}

export const db: NeonHttpDatabase<Record<string, never>> =
  drizzle(process.env.NEON_DATABASE_URL as string);
```

- [ ] **Step 3: Buat `src/db/schema.ts`** — port 1:1 dari `supabase/migrations/*.sql` (ganti tipe `uuid`→`text` untuk kolom yang menunjuk user BetterAuth; enum tetap `pgEnum`)

```ts
import {
  pgEnum, pgTable, text, integer, numeric, boolean, date, time, timestamp, unique,
} from "drizzle-orm/pg-core";

export const appRole = pgEnum("app_role", ["admin", "moderator", "user", "parent", "tutor"]);
export const attendanceStatus = pgEnum("attendance_status", ["present", "absent", "late", "permit"]);
export const permitType = pgEnum("permit_type", ["sick", "family", "other"]);
export const invoiceStatus = pgEnum("invoice_status", ["unpaid", "paid", "overdue", "partial"]);
export const waitingListStatus = pgEnum("waiting_list_status", ["waiting", "notified", "confirmed", "expired", "cancelled"]);
export const ticketPriority = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"]);
export const ticketStatus = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
export const trialStatus = pgEnum("trial_status", ["submitted", "scheduled", "awaiting_review", "recommended", "repeat_trial", "not_suitable", "admitted"]);
export const trialRecommendation = pgEnum("trial_recommendation", ["suitable", "repeat_trial", "not_suitable"]);

// BetterAuth (skema bawaan better-auth/adapters/drizzle)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Domain (port dari supabase/migrations; parent_user_id dsb. sekarang menunjuk user.id BetterAuth)
export const userRoles = pgTable("user_roles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: appRole("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique("user_roles_user_id_role_key").on(t.userId, t.role)]);

export const classes = pgTable("classes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  capacity: integer("capacity"),
  pricePerMonth: numeric("price_per_month"),
  sessionsPerMonth: integer("sessions_per_month"),
  schedule: text("schedule"),
  location: text("location"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const tutors = pgTable("tutors", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  photoUrl: text("photo_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const tutorClassAssignments = pgTable("tutor_class_assignments", {
  id: text("id").primaryKey(),
  tutorId: text("tutor_id").notNull().references(() => tutors.id, { onDelete: "cascade" }),
  classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  ratePerSession: numeric("rate_per_session"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => [unique("tutor_class_assignments_tutor_id_class_id_key").on(t.tutorId, t.classId)]);

export const tutorBonuses = pgTable("tutor_bonuses", {
  id: text("id").primaryKey(),
  tutorId: text("tutor_id").notNull().references(() => tutors.id, { onDelete: "cascade" }),
  amount: numeric("amount").notNull(),
  description: text("description"),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const students = pgTable("students", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  dateOfBirth: date("date_of_birth"),
  parentUserId: text("parent_user_id").references(() => user.id, { onDelete: "set null" }),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
  parentEmail: text("parent_email"),
  photoUrl: text("photo_url"),
  registrationDate: date("registration_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const studentEnrollments = pgTable("student_enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  sessionsQuota: integer("sessions_quota"),
  sessionsUsed: integer("sessions_used").default(0),
  freePermitsAllowed: integer("free_permits_allowed").default(0),
  freePermitsUsed: integer("free_permits_used").default(0),
  enrollmentDate: date("enrollment_date"),
  billingDay: integer("billing_day"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => [unique("student_enrollments_student_id_class_id_key").on(t.studentId, t.classId)]);

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  enrollmentId: text("enrollment_id").references(() => studentEnrollments.id, { onDelete: "set null" }),
  date: date("date").notNull(),
  status: attendanceStatus("status").notNull(),
  checkInTime: time("check_in_time"),
  checkOutTime: time("check_out_time"),
  permitType: permitType("permit_type"),
  permitReason: text("permit_reason"),
  isFreePermit: boolean("is_free_permit").default(false),
  checkedInBy: text("checked_in_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  enrollmentId: text("enrollment_id").references(() => studentEnrollments.id, { onDelete: "set null" }),
  amount: numeric("amount").notNull(),
  discount: numeric("discount").default("0"),
  total: numeric("total").notNull(),
  status: invoiceStatus("status").notNull().default("unpaid"),
  billingPeriodStart: date("billing_period_start"),
  billingPeriodEnd: date("billing_period_end"),
  dueDate: date("due_date"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const waitingList = pgTable("waiting_list", {
  id: text("id").primaryKey(),
  studentName: text("student_name").notNull(),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
  parentEmail: text("parent_email"),
  parentUserId: text("parent_user_id").references(() => user.id, { onDelete: "set null" }),
  classId: text("class_id").references(() => classes.id, { onDelete: "set null" }),
  status: waitingListStatus("status").notNull().default("waiting"),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  priority: integer("priority").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const trialApplications = pgTable("trial_applications", {
  id: text("id").primaryKey(),
  parentUserId: text("parent_user_id").references(() => user.id, { onDelete: "set null" }),
  programKey: text("program_key"),
  classId: text("class_id").references(() => classes.id, { onDelete: "set null" }),
  tutorId: text("tutor_id").references(() => tutors.id, { onDelete: "set null" }),
  childName: text("child_name").notNull(),
  childNickname: text("child_nickname"),
  childBirthDate: date("child_birth_date"),
  childGender: text("child_gender"),
  allergies: text("allergies"),
  medicalNotes: text("medical_notes"),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
  parentEmail: text("parent_email"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  requestedStartDate: date("requested_start_date"),
  parentNotes: text("parent_notes"),
  trialScheduledAt: timestamp("trial_scheduled_at", { withTimezone: true }),
  trialCompletedAt: timestamp("trial_completed_at", { withTimezone: true }),
  status: trialStatus("status").notNull().default("submitted"),
  recommendation: trialRecommendation("recommendation"),
  observationNotes: text("observation_notes"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  admittedAt: timestamp("admitted_at", { withTimezone: true }),
  admittedStudentId: text("admitted_student_id").references(() => students.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

- [ ] **Step 4: Buat `drizzle.config.ts`**

```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.NEON_DATABASE_URL_DIRECT! },
});
```

- [ ] **Step 5: Generate migrasi dari skema**

Run: `npx drizzle-kit generate --name init`
Expected: file `drizzle/migrations/0000_init.sql` (+ meta) berisi CREATE TYPE 9 enum + CREATE TABLE 15 tabel.

- [ ] **Step 6: Buat `drizzle/migrations/0002_routines.sql`** — trigger `updated_at` + 2 stored procedure. **Bodies kedua procedure disalin verbatim dari `supabase/migrations/20261004084402_b8608ddc-a914-4ac2-97c8-6c1c5245e7cc.sql`** dengan 4 substitusi: (a) `auth.uid()` → parameter `p_user_id text`, (b) referensi `auth.users` → `public.user`, (c) `security definer` boleh tetap, (d) tipe parameter `_trial_id uuid` → `text` (id domain di skema baru bertipe `text`, lihat `src/db/schema.ts`). Contoh bentuk akhir (verifikasi bagian yang menunjuk user):

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DO $$ DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public'
    AND tablename IN ('classes','tutors','tutor_class_assignments','tutor_bonuses','students','student_enrollments','attendance','invoices','waiting_list','trial_applications')
  LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
  END LOOP;
END $$;

-- submit_trial_review(p_trial_id uuid, p_reviewer_user_id uuid, p_recommendation trial_recommendation, p_observation_notes text)
-- admit_trial_candidate(p_trial_id uuid, p_admitting_user_id uuid)
-- ^ salin body verbatim dari file migration 20261004084402, terapkan substitusi (a)(b).
```

- [ ] **Step 7: Buat `src/db/healthcheck.ts`**

```ts
import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function ensureSchemaOk(): Promise<{ tables: string[] }> {
  const res = await db.execute<{ tablename: string }>(
    sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  return { tables: res.rows.map((r) => r.tablename) };
}
```

- [ ] **Step 8: Buat project Neon + jalankan migrasi**

```bash
# buat project di neon.tech (console) atau: npx neonctl projects create --name majiku
# simpan kedua connection string (pooled & direct) ke .env.local dan .dev.vars
npx drizzle-kit migrate
```

Expected: migrasi sukses tanpa error.

- [ ] **Step 9: Verifikasi skema**

Run: `npx tsx -e "import('dotenv/config').then(()=>import('./src/db/healthcheck').then(async m=>{const r=await m.ensureSchemaOk();console.log(r.tables.sort().join('\n'))}))"`
Expected: daftar 15 tabel termasuk `user`, `session`, `trial_applications`.

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat(db): skema Drizzle 15 tabel + migrasi Neon + trigger updated_at + port stored procedure"
```

---

### Task 3: Seed data demo

**Files:**
- Create: `scripts/seed.ts`

**Interfaces:**
- Consumes: `db` dari `@/db`, tabel dari `@/db/schema`.
- Produces: data demo untuk `classes` (4), `tutors` (3), `students` (8), `student_enrollments` (8), `attendance` (10, hari ini), `invoices` (6), `waiting_list` (3), `user_roles` untuk 1 user admin + 1 tutor + 1 parent (butuh 3 baris `user` BetterAuth — password di-set via BetterAuth nanti; seed hanya buat `user` + `user_roles` dengan id deterministik).

- [ ] **Step 1: Tulis `scripts/seed.ts`** — pola: id deterministik (`cls_1..cls_4`, `tut_1..tut_3`, `stu_1..stu_8`, `enr_1..enr_8`, `att_1..att_10`, `inv_1..inv_6`, `wl_1..wl_3`, `usr_admin`, `usr_tutor`, `usr_parent`), `onConflictDoNothing()`, nilai realistis (nama Indonesia, harga Rupiah, tanggal relatif `new Date()`), lalu `console.log` jumlah baris per tabel.

```ts
import "dotenv/config";
import { db } from "../src/db";
import { classes, tutors, students, studentEnrollments, attendance, invoices, waitingList, userRoles, user } from "../src/db/schema";

async function main() {
  await db.insert(user).values([
    { id: "usr_admin", name: "Admin Majiku", email: "admin@majiku.test" },
    { id: "usr_tutor", name: "Bu Rina", email: "rina@majiku.test" },
    { id: "usr_parent", name: "Orang Tua Demo", email: "parent@majiku.test" },
  ]).onConflictDoNothing();
  await db.insert(userRoles).values([
    { id: "ur_1", userId: "usr_admin", role: "admin" },
    { id: "ur_2", userId: "usr_tutor", role: "tutor" },
    { id: "ur_3", userId: "usr_parent", role: "parent" },
  ]).onConflictDoNothing();
  // ... insert classes (cls_1 "Baby Bee" dst, pricePerMonth "700000"), tutors, students
  // ... enrollments, attendance (status beragam present/absent/late/permit, date hari ini),
  // ... invoices (status beragam unpaid/paid/overdue), waitingList (waiting/notified)
  console.log("Seed selesai");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

(Isi insert lengkap mengikuti pola di atas — baris penuh ditulis di file, tidak boleh `...` di file asli.)

- [ ] **Step 2: Jalankan seed**

Run: `npx tsx scripts/seed.ts`
Expected: "Seed selesai", idempotent (jalan ulang tanpa error karena `onConflictDoNothing`).

- [ ] **Step 3: Commit**

```bash
git add scripts/seed.ts && git commit -m "feat(db): seed data demo untuk verifikasi 7 titik query"
```

---

### Task 4: BetterAuth (server + client) + rewrite `useAuth` + port halaman Auth

**Files:**
- Create: `src/server/auth.ts`, `src/app/api/auth/[...all]/route.ts`, `src/lib/auth-client.ts`, `src/server/actions/roles.ts`
- Modify: `src/hooks/useAuth.tsx` (rewrite 102 baris → ~40), `src/views/Auth.tsx` (ganti 6 panggilan `supabase.auth.*`), `src/app/layout.tsx` (wrap AuthProvider)
- Install: `better-auth`

**Interfaces:**
- Produces (dipakai Task 5/6):
  - `authClient` dari `@/lib/auth-client` (better-auth/react): `authClient.useSession()`, `authClient.signIn.email({ email, password })`, `authClient.signUp.email({ email, password, name })`, `authClient.signOut()`.
  - `getMyRoles(): Promise<AppRole[]>` — server action dari `@/server/actions/roles`.
  - `useAuth()` API TETAP sama seperti versi lama: `{ session, user, roles, hasRole, loading }` — konsumen (`RoleProtectedRoute`, `roleRedirect`, halaman) tidak berubah logikanya.

- [ ] **Step 1: Install BetterAuth**

```bash
npm install better-auth
```

- [ ] **Step 2: Buat `src/server/auth.ts`**

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
});
```

- [ ] **Step 3: Buat `src/app/api/auth/[...all]/route.ts`**

```ts
import { auth } from "@/server/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 4: Buat `src/lib/auth-client.ts`**

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
```

- [ ] **Step 5: Buat `src/server/actions/roles.ts`**

```ts
"use server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userRoles } from "@/db/schema";
import { auth } from "@/server/auth";

export type AppRole = "admin" | "moderator" | "user" | "parent" | "tutor";

export async function getMyRoles(): Promise<AppRole[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];
  const rows = await db.select().from(userRoles).where(eq(userRoles.userId, session.user.id));
  return rows.map((r) => r.role);
}
```

(dengan `import { headers } from "next/headers";` di atas.)

- [ ] **Step 6: Rewrite `src/hooks/useAuth.tsx`** — API lama dipertahankan:

```tsx
"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { getMyRoles, AppRole } from "@/server/actions/roles";

interface AuthContextType {
  user: { id: string; email: string; name?: string } | null;
  roles: AppRole[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, roles: [], loading: true, hasRole: () => false, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    if (data?.user) getMyRoles().then(setRoles).catch(() => setRoles([]));
    else setRoles([]);
  }, [data?.user?.id]);

  const hasRole = (role: AppRole) =>
    roles.includes("admin") || roles.includes(role); // semantik lama: admin memenuhi semua

  return (
    <AuthContext.Provider value={{
      user: data?.user ?? null,
      roles,
      loading: isPending,
      hasRole,
      signOut: async () => { await authClient.signOut(); setRoles([]); },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 7: Port halaman Auth** — di `src/views/Auth.tsx` ganti 6 panggilan supabase dengan authClient:
  - `supabase.auth.signInWithPassword({ email, password })` → `const { error } = await authClient.signIn.email({ email, password })`
  - `supabase.auth.signUp({ email, password, options.data })` → `const { error } = await authClient.signUp.email({ email, password, name: data.full_name ?? email })`
  - `supabase.auth.signOut()` → `await authClient.signOut()`
  - Setelah login sukses tetap pakai `roleRedirect` (Task 7 memindahkan logikanya; sementara `window.location.href` ke hasil `roleHome`).

- [ ] **Step 8: Wrap provider di `src/app/layout.tsx`** — tambah QueryClientProvider + AuthProvider + Toaster/sonner sesuai hierarki `src/App.tsx` lama (`QueryClientProvider > TooltipProvider > Toaster + Sonner > AuthProvider > children`), konfigurasi query sama (`staleTime: 30000, retry: 1, refetchOnWindowFocus: false`).

- [ ] **Step 9: Verifikasi auth end-to-end**

```bash
npm run dev &
curl -s -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@majiku.test","password":"Password123!","name":"Test"}' | head -c 400
```
Expected: JSON berisi `user` + token/cookie set (HTTP 200).

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat(auth): BetterAuth + rewrite useAuth (API sama) + port halaman Auth"
```

---

### Task 5: Server actions pengganti 7 titik query Supabase

**Files:**
- Create: `src/server/actions/attendance.ts`, `billing.ts`, `payout.ts`, `waitingList.ts`, `trialProcedures.ts`
- Modify (setelah actions jadi): `src/views/Attendance.tsx`, `src/views/Billing.tsx`, `src/views/TutorPayout.tsx`, `src/components/dashboard/WaitingListWidget.tsx`

**Interfaces:**
- Consumes: `db`, tabel `@/db/schema`, `getMyRoles` (Task 4) untuk cek role di dalam action yang sensitif.
- Produces (dipakai Task 6): fungsi async bernama jelas yang dipanggil `useQuery` di halaman, contoh:
  - `getTodayAttendance(): Promise<AttendanceRow[]>` (join enrollments/students/classes)
  - `getInvoices(): Promise<InvoiceRow[]>`
  - `getTutorPayoutData(): Promise<{ tutors, assignments, bonuses, classes }>`
  - `getWaitingList(): Promise<WaitingListRow[]>`
  - `submitTrialReview(trialId, recommendation, notes)` / `admitTrial(trialId)` — memanggil stored procedure (DIPAKAI UI NANTI setelah Fase 1; dibuat sekarang karena menggantikan RPC yang hilang dari Supabase).

- [ ] **Step 1: Tulis satu action sekaligus contoh kerja** — `src/server/actions/attendance.ts`:

```ts
"use server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { attendance, studentEnrollments, students, classes } from "@/db/schema";

export interface AttendanceRow {
  id: string; date: string; status: string; studentName: string; className: string;
  checkInTime: string | null; checkOutTime: string | null; permitType: string | null;
}

export async function getTodayAttendance(): Promise<AttendanceRow[]> {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db
    .select({
      id: attendance.id, date: attendance.date, status: attendance.status,
      checkInTime: attendance.checkInTime, checkOutTime: attendance.checkOutTime,
      permitType: attendance.permitType,
      studentName: students.name, className: classes.name,
    })
    .from(attendance)
    .innerJoin(students, eq(attendance.studentId, students.id))
    .innerJoin(classes, eq(attendance.classId, classes.id))
    .where(and(eq(attendance.date, today)));
  return rows.map((r) => ({ ...r, date: String(r.date) }));
}
```

- [ ] **Step 2: Tulis action lain** dengan pola yang sama, memetakan query supabase lama 1:1 (join `student_enrollments+students+classes` untuk Billing; 4 query + 2 mutation untuk Payout; join `waiting_list+classes` untuk WaitingList). Untuk stored procedure:

```ts
// src/server/actions/trialProcedures.ts
"use server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function submitTrialReview(
  trialId: string, recommendation: "suitable" | "repeat_trial" | "not_suitable", observationNotes: string
) {
  await db.execute(sql`SELECT public.submit_trial_review(${trialId}, ${recommendation}::trial_recommendation, ${observationNotes})`);
}

export async function admitTrial(trialId: string) {
  await db.execute(sql`SELECT public.admit_trial_candidate(${trialId})`);
}
```

(Cocokkan jumlah/urutan parameter dengan body procedure hasil porting Task 2 — bila procedure versi porting menerima `p_reviewer_user_id`, ambil dari `auth.api.getSession` di dalam action.)

- [ ] **Step 3: Ganti 7 titik query di halaman** — tiap blok `supabase.from(...).select(...)` di `useQuery` diganti panggilan action:

```tsx
// sebelum (Attendance.tsx):
// const { data } = useQuery({ queryKey: ["attendance"], queryFn: async () => {
//   const { data, error } = await supabase.from("attendance").select("*, ...");
//   if (error) throw error; return data; } });
// sesudah:
import { getTodayAttendance } from "@/server/actions/attendance";
const { data } = useQuery({ queryKey: ["attendance"], queryFn: getTodayAttendance });
```

- [ ] **Step 4: Verifikasi data nyata tampil**

```bash
npm run dev  # login admin@majiku.test nanti setelah seed user punya password
```
Catatan: user seed belum punya password — set di Step 1 Task 6 (seed diperluas) atau sign-up user baru lalu `UPDATE user_roles SET user_id='<id-baru>' WHERE user_id='usr_admin';` di Neon SQL editor. Expected: `/attendance`, `/billing`, `/tutor-payout`, `/dashboard` (widget waiting list) menampilkan data seed, bukan kosong.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(data): server actions Drizzle menggantikan 7 titik query Supabase"
```

---

### Task 6: Port massal 35 halaman + route groups + layout

**Files:**
- Create: `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/auth/[mode]/page.tsx`, `src/app/(public)/site/[type]/page.tsx`, `src/app/(admin)/layout.tsx` + 14 page.tsx, `src/app/(tutor)/layout.tsx` + 6 page.tsx, `src/app/(parent)/layout.tsx` + 8 page.tsx, `src/app/(admin)/vendor/page.tsx`
- Modify: file di `src/views/` + komponen (Appendix A), `src/components/auth/RoleProtectedRoute.tsx` (import path saja)
- **TIDAK dipindah** (Global Constraint 6): komponen orphan.

**Interfaces:**
- Consumes: `useAuth` (Task 4), server actions (Task 5), `DashboardLayout`, `Sidebar`, `RoleProtectedRoute` (porting tanpa perubahan logika).
- Produces: semua route lama hidup di path yang sama; `RoleProtectedRoute` membungkus children di layout per grup.

- [ ] **Step 1: Terapkan aturan Appendix A** ke `src/views/` dan komponen:

```bash
# jalankan 3 blok sed di Appendix A, lalu:
grep -rn "react-router-dom" src | sort   # daftar sisa perbaikan manual
```

- [ ] **Step 2: Buat layout admin** — `src/app/(admin)/layout.tsx`:

```tsx
"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute role="admin">
      <DashboardLayout>{children}</DashboardLayout>
    </RoleProtectedRoute>
  );
}
```

(Tutor/parent layout: pola sama dengan `role="tutor"` / `role="parent"` tanpa DashboardLayout bila di file lama tidak ada — ikuti perilaku lama.)

- [ ] **Step 3: Buat semua page.tsx** — pola thin-re-export (contoh Appendix A), dengan pemetaan:

```
(public):  /  → SaasLanding          /auth/[mode] → Auth
           /site/[type] → VendorSite
(admin):   /dashboard → Dashboard    /students → Students    /attendance → Attendance
           /daily-reports → DailyReports   /gallery → Gallery     /messages → Messages
           /billing → Billing        /tutor-payout → TutorPayout   /classes → Classes
           /tutors → Tutors          /schedule → Schedule    /birthdays → Birthdays
           /lesson-plans → LessonPlans     /crm → CRM            /settings → Settings
           /vendor → VendorDashboard (super-admin)
(tutor):   /tutor → TutorDashboard   /tutor/progress → TutorProgress  /tutor/chat → TutorChat
           /tutor/attendance → TutorAttendance  /tutor/kpi → TutorKPI  /tutor/guides → TutorGuides
(parent):  /parent → ParentPortal    /parent/marketplace → DaycareMarketplace
           /parent/billing → ParentBilling  /parent/payment → ParentPayment
           /parent/invoice/[id] → ParentInvoiceDetail
           /parent/registration → ParentRegistration  /parent/chat → ParentChat
           /parent/profile → ParentProfile  /parent/catalog → ParentCatalog
```

- [ ] **Step 4: Perbaiki sisa referensi router manual** (hasil grep Step 1): `<Navigate>` → `redirect()`, `navigate(-1)` → `router.back()`, `useSearchParams` → versi next/navigation.

- [ ] **Step 5: Verifikasi tsc + build + smoke**

```bash
npx tsc --noEmit          # Expected: 0 error
npm run build             # Expected: sukses, daftar route di output sesuai pemetaan
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(routes): port 35 halaman ke App Router, route groups per role, hapus orphan components dari porting"
```

---

### Task 7: Middleware session guard + not-found + roleRedirect server-side

**Files:**
- Create: `src/middleware.ts`, `src/app/not-found.tsx`
- Modify: `src/lib/roleRedirect.ts` (ekspor `roleHome` agar dipakai server & client)

**Interfaces:**
- Produces: middleware melindungi prefix `/dashboard|/students|/attendance|/daily-reports|/gallery|/messages|/billing|/tutor-payout|/classes|/tutors|/schedule|/birthdays|/lesson-plans|/crm|/settings|/vendor|/tutor|/parent` — hanya cek **keberadaan cookie session BetterAuth** (`better-auth.session_token`), bukan query DB (spec §6). Role validation tetap di client `RoleProtectedRoute` (Fase 1) + server actions.

- [ ] **Step 1: Buat `src/middleware.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";

const PROTECTED = [/^\/dashboard/, /^\/students/, /^\/attendance/, /^\/daily-reports/,
  /^\/gallery/, /^\/messages/, /^\/billing/, /^\/tutor-payout/, /^\/classes/, /^\/tutors/,
  /^\/schedule/, /^\/birthdays/, /^\/lesson-plans/, /^\/crm/, /^\/settings/, /^\/vendor/,
  /^\/tutor/, /^\/parent/];

export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has("better-auth.session_token");
  const isProtected = PROTECTED.some((re) => re.test(req.nextUrl.pathname));
  if (isProtected && !hasSession) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/students/:path*", "/attendance/:path*",
  "/daily-reports/:path*", "/gallery/:path*", "/messages/:path*", "/billing/:path*",
  "/tutor-payout/:path*", "/classes/:path*", "/tutors/:path*", "/schedule/:path*",
  "/birthdays/:path*", "/lesson-plans/:path*", "/crm/:path*", "/settings/:path*",
  "/vendor/:path*", "/tutor/:path*", "/parent/:path*"] };
```

- [ ] **Step 2: Buat `src/app/not-found.tsx`** — port isi `src/views/NotFound.tsx` (ubah `<Link to=` → `<Link href=`).

- [ ] **Step 3: Verifikasi redirect**

```bash
npm run dev &
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/dashboard
```
Expected: `307 http://localhost:3000/auth/login?next=/dashboard`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(auth): middleware session guard + not-found page"
```

---

### Task 8: Hapus Supabase, Lovable, dan artefak Vite

**Files:**
- Delete: `src/integrations/supabase/` (client.ts, types.ts, previewAuthStorage.ts), `vite.config.ts`, `index.html`, `tsconfig.app.json`, `tsconfig.node.json`, `src/vite-env.d.ts`, `bun.lock`, `bun.lockb`, `.lovable/`
- Modify: `package.json` (uninstall deps lama)

- [ ] **Step 1: Uninstall + delete**

```bash
npm uninstall @supabase/supabase-js lovable-tagger @lovable.dev/vite-plugin-dev-server-bridge @lovable.dev/vite-plugin-hmr-gate vite @vitejs/plugin-react-swc
git rm -r src/integrations vite.config.ts index.html tsconfig.app.json tsconfig.node.json src/vite-env.d.ts bun.lock bun.lockb
git rm -r .lovable   # rencana desain trial sudah terekam di spec + git history
```

- [ ] **Step 2: Verifikasi nol referensi**

```bash
grep -ri "supabase\|lovable" src package.json *.config.* index.html 2>/dev/null
```
Expected: kosong.

- [ ] **Step 3: Build bersih**

```bash
npx tsc --noEmit && npm run build
```
Expected: keduanya sukses.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: hapus Supabase, Lovable, dan artefak Vite"
```

---

### Task 9: Konfigurasi OpenNext + parity Workers lokal

**Files:**
- Create: `wrangler.jsonc`, `.dev.vars` (lokal saja, git-ignored)
- Modify: `next.config.ts`, `package.json` (scripts)
- Install: `-D @opennextjs/cloudflare wrangler @cloudflare/workers-types`

**Interfaces:**
- Produces: `npm run preview` = build Next + build OpenNext + jalankan workerd lokal dengan env `.dev.vars`.

- [ ] **Step 1: Install**

```bash
npm install -D @opennextjs/cloudflare wrangler @cloudflare/workers-types
```

- [ ] **Step 2: Update `next.config.ts`**

```ts
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 3: Buat `wrangler.jsonc`** (mengikuti template resmi `@opennextjs/cloudflare`; versi binding DO bisa berbeda — cek output error build):

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "majiku",
  "compatibility_date": "2026-09-01",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": { "directory": ".open-next/assets", "binding": "assets" },
  "durable_objects": {
    "bindings": [{ "name": "NEXT_INC_CACHE_DO", "class_name": "DOQueueHandler" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["DOQueueHandler"] }]
}
```

- [ ] **Step 4: `.dev.vars`** (lokal):

```
NEON_DATABASE_URL=<pooled-url>
NEON_DATABASE_URL_DIRECT=<direct-url>
BETTER_AUTH_SECRET=<secret-min-32-chars>
BETTER_AUTH_URL=http://localhost:8787
```

- [ ] **Step 5: Scripts**

```json
"preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
"deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
```

- [ ] **Step 6: Parity test lokal**

```bash
npm run preview   # workerd di http://localhost:8787
# jalankan smoke: daftar route di pemetaan Task 6 → curl semua:
for p in / /auth/login /dashboard /students /attendance /billing /tutor-payout /classes /tutors /schedule /birthdays /lesson-plans /crm /settings /vendor /tutor /tutor/kpi /parent /parent/marketplace /parent/registration /site/daycare; do
  echo -n "$p -> "; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8787$p";
done
```
Expected: semua `200` atau `307` (route terproteksi tanpa cookie).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(deploy): OpenNext + wrangler config untuk Cloudflare Workers"
```

---

### Task 10: Deploy staging + verifikasi akhir Fase 1

**Files:**
- Modify: tidak ada kode — hanya secret + deploy
- Create: `docs/superpowers/plans/2026-10-04-fase1-verification.md` (hasil checklist)

- [ ] **Step 1: Set secrets Workers**

```bash
npx wrangler secret put NEON_DATABASE_URL
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put BETTER_AUTH_URL
```

- [ ] **Step 2: Deploy staging**

```bash
npm run deploy
```
Expected: URL `https://majiku.<subdomain>.workers.dev`.

- [ ] **Step 3: Smoke di Workers** — ulangi loop curl Task 9 Step 6 dengan URL workers.dev. Expected: pola status sama dengan lokal.

- [ ] **Step 4: Auth end-to-end di staging** — sign-up via UI `/auth/login`, login, redirect sesuai role ke `/dashboard` (admin), `/tutor` (tutor), `/parent` (parent); logout; akses langsung `/dashboard` tanpa sesi → redirect login. Expected: semua berfungsi seperti versi lama.

- [ ] **Step 5: Checklist verifikasi & commit**

Buat `docs/superpowers/plans/2026-10-04-fase1-verification.md` berisi: daftar route + status, hasil login 3 role, hasil 4 halaman live-data (Attendance/Billing/TutorPayout/Dashboard-waitinglist menampilkan data seed), output `tsc --noEmit`, output `npm run build`.

```bash
git add -A && git commit -m "chore(fase1): verifikasi akhir — app live di Workers, nol Supabase/Lovable"
```

---

## Self-Review (sudah dijalankan)

1. **Spec coverage Fase 1**: scaffold ✓ (T1), skema+migrasi+procs ✓ (T2), seed ✓ (T3), BetterAuth+useAuth+Auth page ✓ (T4), 7 titik query ✓ (T5), 35 halaman+orphan+route groups ✓ (T6), middleware+not-found ✓ (T7), hapus Supabase/Lovable ✓ (T8), OpenNext+parity ✓ (T9), deploy+verifikasi ✓ (T10). Fase 2/3 bukan scope plan ini (spec §3).
2. **Placeholder scan**: bodies stored procedure merujuk file sumber verbatim dengan substitusi eksplisit (T2 Step 6) — bukan TBD; seed data lengkap ditulis di file mengikuti pola yang ditunjukkan (T3).
3. **Type consistency**: `AppRole` didefinisikan T4 Step 5, dipakai T4 Step 6 dan konsumen lama; `getTodayAttendance`/`AttendanceRow` T5 dipakai T6; `db`/schema T2 dipakai T3/T4/T5; cookie `better-auth.session_token` (nama bawaan BetterAuth) dipakai T7 dan diverifikasi di T10 Step 4.
