# Synchronized Demo Mode & Mutation Lock for Bunayo

* **Author:** moxsenna
* **Date:** 2026-11-19

## Overview

Bunayo provides interactive demo access for three core operational personas: Daycare Administrator (`/dashboard`), Class Tutor (`/tutor`), and Parent (`/parent`). This document specifies the implementation of a unified relational dataset across all three roles and introduces a server-level mutation lock preventing visitors from modifying, polluting, or creating database records.

All legacy `@majiku.test` branding is decommissioned in favor of `@bunayo.test` across authentication handlers, landing page modal triggers, and tenant configurations.

## Analysis

### 1. Multi-Lens Swarm Findings

* **UX & Ergonomics (`egm-design`):**
  - Disabling form buttons outright destroys product exploration; prospective buyers cannot inspect input validation, datepicker popovers, or multi-step wizard ergonomics.
  - Rejecting mutations with destructive (red/danger) toasts leads users to believe the application crashed. Mutations must return informative, non-punitive feedback confirming form validity while explaining the read-only sandbox policy.
  - A subtle contextual indicator pill (`[👁️ Mode Demo: Eksplorasi Interaktif]`) should appear in portal headers to establish clear expectations before submission.

* **Codebase & Authentication Mechanics (`egm-codebase-details`):**
  - BetterAuth stores passwords in a dedicated `account` table (`provider_id = "credential"` with hashed password), not the `user` table. Direct inserts into `user` will fail login unless credentials are created via `auth.api.signUpEmail` or explicit scrypt hashing.
  - In `src/server/authz.ts`, `requireTenantContext()` contains a flawed fallback that queries the first tenant in Neon DB (`tnt_1`). For demo users, this must strictly resolve to `tnt_demo`.
  - `requireParentContext()` and `requireTutorContext()` in `authz.ts` must be upgraded to return uniform `{ session, tenantId, isDemo }` contexts.

* **Strategic & Systems Architecture (`egm-zoom-out`):**
  - The core product value proposition is triangular synchronization: Director, Tutor, and Parent viewing the exact same operational reality in real-time.
  - *The Date Decay Risk:* Dashboards query operations against `todayInWib()`. Static seed dates become empty after the seed date passes. Attendance queries for demo tenant must dynamically resolve against `CURRENT_DATE` / `todayInWib()`.

* **Security & Multi-Tenant Boundary (`egm-structural`):**
  - Dual-layer mutation verification: reject writes if `isDemoEmail(session.user.email) || tenantId === 'tnt_demo'`.
  - Client request bodies must never dictate tenant identity; tenant context must always be derived from verified server session cookies.
  - Perimeter audit: mutation locks must guard Cloudflare R2 presigned photo uploads, Midtrans/Paycore payment orders, and direct chat messages (`src/server/actions/chat.ts`).

### 2. Inventive Contradictions & Pattern Resolutions (TRIZ Matrix)

* **Contradiction 1: Form Interactivity vs Database Immutability**
  - *Conflict:* Visitors want to test form workflows, but database persistence pollutes shared demo data.
  - *Resolution (TRIZ Principle 10: Prior Action & Principle 24: Intermediary):*
    Forms validate user input normally. On submit, server actions intercept writes, validate payloads, and return:
    ```json
    {
      "success": false,
      "isDemoLock": true,
      "message": "Formulir valid! Penambahan atau perubahan data dinonaktifkan dalam mode demo untuk menjaga integritas simulasi."
    }
    ```
    Frontend toasts present this as a successful simulation rather than an application failure.

* **Contradiction 2: Static Relational Seed vs Dynamic Operational Calendar**
  - *Conflict:* Daily attendance and reports filter by `todayInWib()`. Fixed seed dates become stale immediately.
  - *Resolution (TRIZ Principle 15: Dynamization):*
    Attendance and daily report query handlers automatically map demo records to `todayInWib()` when queried under `tnt_demo`, ensuring Aisyah Putri and Raka Pratama are always displayed as present today regardless of the calendar date.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  - Complete migration of all demo account references from `majiku` to `bunayo` (`@bunayo.test` + test Gmail aliases).
  - Seed dedicated PostgreSQL tenant `tnt_demo` with fully reconciled relational data across Admin, Tutor, and Parent.
  - Implement centralized mutation lock (`assertDemoMutationLock`) in `src/server/authz.ts` guarding all write-capable server actions, R2 presigned uploads, and chat.
  - Dynamic calendar projection ensuring attendance and daily logs reflect `todayInWib()`.
  - Contextual demo indicator pill in portal headers.

* **Out-of-Scope Non-Goals:**
  - Ephemeral client-side session cloning via LocalStorage or IndexedDB.
  - Multi-tenant isolated schema branching per anonymous visitor.
  - Automated background database rollback crons.

## Alternatives Weighed

1. **In-Memory TypeScript Mock Fallback (Rejected):**
   - *Reason for Rejection:* Requires maintaining duplicate query and filtering logic across 500+ lines in `src/lib/demoData.ts`. Diverges whenever Drizzle schemas change.
2. **Upfront UI Button Disabling (Rejected):**
   - *Reason for Rejection:* Disabling inputs and submit buttons prevents prospective customers from evaluating form ergonomics, datepickers, and field validation.
3. **Session-Level Database Branching (Rejected):**
   - *Reason for Rejection:* Excessive compute and storage overhead on Cloudflare Workers edge runtime; excessive cold-start latencies.

## Key Decisions & Staging for Next Steps

### Entity Graph Specification (`tnt_demo`)
* **Tenant:** `tnt_demo` ("Bunayo Daycare Demo", slug: `bunayo-demo`)
* **Users & Credentials:**
  - Admin: `admin@bunayo.test` (alias: `admin.test@gmail.com`) / `Password123!`
  - Tutor: `tutor@bunayo.test` / `rina@bunayo.test` (alias: `tutor.test@gmail.com`) / `Password123!`
  - Parent: `parent@bunayo.test` (alias: `parent.test@gmail.com`) / `Password123!`
* **Classes:**
  - `cls_bunga_matahari`: Kelas Bunga Matahari (Tutor: Bu Rina, Capacity: 15)
  - `cls_pelangi`: Kelas Pelangi (Tutor: Ibu Maya, Capacity: 12)
* **Students:**
  - `stu_demo_aisyah`: Aisyah Putri (Parent: `parent@bunayo.test`, Class: `cls_bunga_matahari`)
  - `stu_demo_raka`: Raka Pratama
  - `stu_demo_keisha`: Keisha Azzahra
  - `stu_demo_arjuna`: Arjuna Wijaya
* **Synchronized Operations:**
  - Attendance: Aisyah Putri (Hadir, 07:45 WIB), Raka (Hadir, 08:00 WIB), Keisha (Sakit), Arjuna (Izin)
  - Billing: 1 Paid SPP invoice (Aisyah: Rp 1.500.000) + 1 Unpaid invoice
  - Activity Feed: 3 milestone logs for Aisyah with authentic Indonesian media
  - Chat: Active discussion thread between Bu Rina and Ibu Anita

### Implementation Phases
1. **Phase 1: Seed & Auth Foundations:**
   Create `scripts/seed-bunayo-demo.ts` with BetterAuth `account` credential generation (`Password123!`), relational student/class bindings, and `tnt_demo` setup.
2. **Phase 2: Auth Normalization & Context Harmonization:**
   Update `src/lib/demo.ts` to recognize `@bunayo.test` and test aliases. Update `src/server/authz.ts` so all roles reliably receive `{ session, tenantId: 'tnt_demo', isDemo: true }`.
3. **Phase 3: Universal Mutation Lock:**
   Add `assertDemoMutationLock()` in `src/server/authz.ts` and apply to write actions in `kehadiran.ts`, `laporanHarian.ts`, `siswa.ts`, `keuangan.ts`, `chat.ts`, and photo uploads.
4. **Phase 4: Dynamic Calendar & UI Polish:**
   Implement dynamic projection for demo attendance/reports relative to `todayInWib()`. Update `DemoAccessModal.tsx` and add portal demo indicator pills.
5. **Phase 5: Verification & Cloudflare Deployment:**
   Validate 3-way synchronization across all portals and deploy to production.
