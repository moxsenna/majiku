# Implementation Plan: Production-Ready & Isolasi Mock Data 4 Portal MAJIKU

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menjadikan seluruh 4 portal MAJIKU (Admin, Parent, Tutor, Vendor) production-ready dengan mengisolasi mock data hanya untuk akun demo (`*@majiku.test`, `demo@majiku.id`), dan menyajikan data DB murni + Onboarding Empty States ramah untuk seluruh akun pengguna riil baru.

**Architecture:** Modul utilitas deteksi demo (`src/lib/demo.ts`) digunakan oleh Server Actions di setiap domain (`adminDashboard.ts`, `parentChildren.ts`, `tutorDashboard.ts`, `vendorDashboard.ts`). Jika pemanggil adalah akun demo, kembalikan data demo terisolasi. Jika akun riil, lakukan query langsung ke Neon DB. Jika data kosong (pengguna baru), komponen UI merender Empty State edukatif dengan tombol aksi (CTA) onboarding alih-alih data palsu.

**Tech Stack:** Next.js 15 (App Router), Neon Postgres (`@neondatabase/serverless` HTTP driver), Drizzle ORM, BetterAuth, TanStack React Query, Tailwind CSS, shadcn/ui.

---

## Global Constraints
- Driver database: gunakan Neon HTTP driver (`neon-http`), stateless query.
- Keamanan: identitas user selalu diambil dari sesi server (`auth.api.getSession`), tidak pernah menerima user ID dari request body client.
- Zero mock leakage: akun dengan email non-demo dilarang menampilkan data fiktif (Aisyah Putri, 156 siswa demo, omzet palsu).
- Cloudflare Workers compatibility: tidak menggunakan Node-only modules di client/edge runtime.

---

### Task 1: Core Demo Detection Utility (`src/lib/demo.ts`)

**Files:**
- Create: `src/lib/demo.ts`
- Test: `scripts/test-demo-detection.ts`

**Interfaces:**
- Produces: `isDemoEmail(email?: string | null): boolean`

- [ ] **Step 1: Write test script for demo detection**
- [ ] **Step 2: Run test to verify it fails (module not found)**
- [ ] **Step 3: Implement `src/lib/demo.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Admin Dashboard Real Data & Onboarding Empty States

**Files:**
- Create: `src/server/actions/adminDashboard.ts`
- Modify: `src/app/(admin)/dashboard/page.tsx`
- Modify: `src/views/Dashboard.tsx`
- Create: `src/components/dashboard/AdminOnboardingCard.tsx`

**Interfaces:**
- Consumes: `isDemoEmail` from `src/lib/demo.ts`
- Produces: `getAdminDashboardOverview(): Promise<AdminDashboardOverviewData>`

- [ ] **Step 1: Buat Server Action `getAdminDashboardOverview()` di `src/server/actions/adminDashboard.ts`**
- [ ] **Step 2: Buat Komponen Onboarding `src/components/dashboard/AdminOnboardingCard.tsx`**
- [ ] **Step 3: Update `src/views/Dashboard.tsx` dan `src/app/(admin)/dashboard/page.tsx`**
- [ ] **Step 4: Verifikasi build & test**
- [ ] **Step 5: Commit**

---

### Task 3: Parent Portal Real Children & Clean Tabs

**Files:**
- Create: `src/server/actions/parentChildren.ts`
- Modify: `src/views/ParentPortal.tsx`
- Modify: `src/app/(parent)/parent/page.tsx`
- Modify: `src/app/(parent)/parent/payment/page.tsx` (redirect ke `/parent/billing`)

**Interfaces:**
- Produces: `getMyChildren(): Promise<ParentChildData[]>`

- [ ] **Step 1: Buat Server Action `getMyChildren()` di `src/server/actions/parentChildren.ts`**
- [ ] **Step 2: Redirect route usang `/parent/payment`**
- [ ] **Step 3: Update `src/views/ParentPortal.tsx`**
- [ ] **Step 4: Update `src/app/(parent)/parent/page.tsx`**
- [ ] **Step 5: Verifikasi build & commit**

---

### Task 4: Tutor Dashboard Assigned Classes & Schedule Queries

**Files:**
- Create: `src/server/actions/tutorDashboard.ts`
- Modify: `src/views/TutorDashboard.tsx`
- Modify: `src/app/(tutor)/tutor/page.tsx`

**Interfaces:**
- Produces: `getTutorDashboardOverview(): Promise<TutorDashboardData>`

- [ ] **Step 1: Buat Server Action `getTutorDashboardOverview()` di `src/server/actions/tutorDashboard.ts`**
- [ ] **Step 2: Update `src/views/TutorDashboard.tsx`**
- [ ] **Step 3: Update `src/app/(tutor)/tutor/page.tsx`**
- [ ] **Step 4: Verifikasi build & commit**

---

### Task 5: Vendor Superadmin Real Platform Metrics

**Files:**
- Create: `src/server/actions/vendorDashboard.ts`
- Modify: `src/views/VendorDashboard.tsx`
- Modify: `src/components/vendor/DaycareManagementTab.tsx`
- Modify: `src/components/vendor/UserManagementTab.tsx`

**Interfaces:**
- Produces: `getVendorPlatformOverview(): Promise<VendorOverviewData>`

- [ ] **Step 1: Buat Server Action `getVendorPlatformOverview()`**
- [ ] **Step 2: Update komponen Vendor Tabs**
- [ ] **Step 3: Verifikasi build & commit**

---

### Task 6: Script Otomasi Akun Uji Coba & Smoke Test Produksi

**Files:**
- Create: `scripts/seed-clean-test-users.ts`
- Create: `scripts/verify-production-isolation.ts`

- [ ] **Step 1: Buat script pembuat akun uji coba bersih `scripts/seed-clean-test-users.ts`**
- [ ] **Step 2: Buat script verifikasi isolasi `scripts/verify-production-isolation.ts`**
- [ ] **Step 3: Jalankan verifikasi dan build penuh**
- [ ] **Step 4: Commit final**
