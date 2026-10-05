# Fase 2: SEO & Marketplace Layer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menjadikan halaman publik MAJIKU server-rendered dengan data nyata dari Neon (tabel `tenants` baru) + infrastruktur SEO penuh (sitemap, robots, metadata, JSON-LD) agar kompetitif melawan mesin SEO Happy Kamper.

**Architecture:** Halaman publik menjadi RSC (React Server Components) yang membaca Neon langsung via Drizzle — bukan lewat server actions, bukan fetch client. Halaman interaktif yang sudah ada (SaasLanding, marketplace parent) menerima data awal lewat props dari page server. Model data baru: tabel `tenants` (profil daycare/preschool/bimbel) dengan slug untuk URL publik `/marketplace/[slug]`.

**Tech Stack:** Next.js 15 (RSC, Metadata API, Route Handlers), Drizzle + Neon (sudah ada), schema.org JSON-LD, `sitemap.ts`/`robots.ts` bawaan Next.

**Spec:** `docs/superpowers/specs/2026-10-04-nextjs-neon-cloudflare-migration-design.md` §3 Fase 2.

## Global Constraints

1. npm saja; work in `D:\Coding\happy-days`; branch baru `feat/fase2-seo-marketplace` dari `main`.
2. Halaman publik harus server-rendered: konten utama (nama tenant, deskripsi, harga) TIDAK boleh di-fetch client-side setelah mount — view-source harus menampilkan konten.
3. Tabel `tenants` adalah sumber tunggal data marketplace & microsite — tidak boleh ada duplikasi model di komponen.
4. `/parent/marketplace` memakai komponen publik yang sama (bukan duplikat) — spec §3 Fase 2.
5. JSON-LD: `LocalBusiness` di detail tenant; `Course` per program di `programs` (hanya jika programs tidak kosong).
6. YAGNI (spec §2.8): TIDAK membuat upload foto (kolom `photos` jsonb berisi URL), TIDAK membuat review/rating nyata, TIDAK i18n, TIDAK payment.
7. Behavior-identical untuk halaman admin/tutor/parent non-marketplace — Fase 2 hanya menyentuh layer publik.
8. Site URL produksi dari env `NEXT_PUBLIC_SITE_URL` (default `http://localhost:3000` saat dev).
9. Verifikasi SEO = curl view-source + grep meta/JSON-LD + sitemap berisi slug tenant (Lighthouse dijalankan user sendiri di akhir).

---

### Task 1: Tabel `tenants` — skema, migrasi, seed

**Files:**
- Modify: `src/db/schema.ts` (tambah enum `tenantType` + tabel `tenants`)
- Create: `drizzle/migrations/000X_*.sql` (via drizzle-kit generate), update seed di `scripts/seed.ts` (bagian baru, idempotent)
- Modify: `scripts/seed.ts`

**Interfaces:**
- Produces (dipakai Task 2-5):
  - `tenants` tabel Drizzle di `@/db/schema` dengan kolom: `id` (text pk), `slug` (text unique notNull), `name`, `type` (enum `tenant_type`: `daycare|preschool|bimbel`), `tagline` (text), `description` (text), `city` (text notNull), `address` (text), `latitude`/`longitude` (numeric nullable), `priceFrom` (numeric notNull), `programs` (jsonb array `{name, ageRange, priceFrom}`), `photos` (jsonb array of URL string), `whatsapp` (text), `isVerified` (boolean default false), `isActive` (boolean default true), `createdAt`/`updatedAt`.

- [ ] **Step 1: Tambah ke `src/db/schema.ts`** (setelah enum yang ada):

```ts
export const tenantType = pgEnum("tenant_type", ["daycare", "preschool", "bimbel"]);

export interface TenantProgram {
  name: string;
  ageRange: string;
  priceFrom: string;
}

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  type: tenantType("type").notNull().default("daycare"),
  tagline: text("tagline"),
  description: text("description"),
  city: text("city").notNull(),
  address: text("address"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  priceFrom: numeric("price_from").notNull(),
  programs: jsonb("programs").$type<TenantProgram[]>().default([]),
  photos: jsonb("photos").$type<string[]>().default([]),
  whatsapp: text("whatsapp"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

- [ ] **Step 2: Generate & migrate**

```bash
npx drizzle-kit generate --name tenants && npx drizzle-kit migrate
```
Expected: migrasi sukses; `npx tsx -e "..."` healthcheck `tables` kini 16 (termasuk `tenants`).

- [ ] **Step 3: Tambah seed 10 tenant** di `scripts/seed.ts` (blok baru sebelum `console.log`, `onConflictDoNothing()`): id `tnt_1..tnt_10`, slug kebab-case unik, 5 `isVerified: true`, kota nyata (Tangerang, Jakarta Selatan, Depok, Bandung, Surabaya, Bekasi), `priceFrom` realistis ("700000".."3500000"), 2-3 `programs` per tenant, `whatsapp` format `628xxxxxxxxxx`. Termasuk `tnt_1` = Majiku Kids (slug `majiku-kids`, Tangerang, type `daycare`, programs Tiny Tints & Pop Up Class dari data riil di happykamper).
- [ ] **Step 4: Verifikasi seed**

Run: `npx tsx scripts/seed.ts` (dua kali)
Expected: "Seed selesai", 10 baris `tenants`, idempotent.

- [ ] **Step 5: Commit** `feat(db): tabel tenants + seed 10 tenant untuk marketplace`

---

### Task 2: Fondasi SEO — site config, robots, sitemap, metadata root

**Files:**
- Create: `src/lib/site.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`
- Modify: `src/app/layout.tsx` (metadataBase + OG defaults), `.env.local` (tambah `NEXT_PUBLIC_SITE_URL`)

**Interfaces:**
- Produces: `siteConfig` dari `@/lib/site` (`{ name, url, description }`); `getAllTenantSlugs(): Promise<string[]>` helper di `src/lib/tenants.ts`.

- [ ] **Step 1: Buat `src/lib/site.ts`**

```ts
export const siteConfig = {
  name: "MAJIKU",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Platform manajemen daycare, preschool, dan bimbel multi-tenant. Temukan daycare terverifikasi atau kelola operasional center Anda.",
};
```

- [ ] **Step 2: Buat `src/lib/tenants.ts`** — semua akses data tenant publik lewat file ini:

```ts
import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";

export interface TenantFilters {
  type?: "daycare" | "preschool" | "bimbel";
  city?: string;
  q?: string;
}

export async function listActiveTenants(filters: TenantFilters = {}) {
  const conds: SQL[] = [eq(tenants.isActive, true)];
  if (filters.type) conds.push(eq(tenants.type, filters.type));
  if (filters.city) conds.push(ilike(tenants.city, filters.city));
  if (filters.q)
    conds.push(
      or(ilike(tenants.name, `%${filters.q}%`), ilike(tenants.description, `%${filters.q}%`))!
    );
  return db.select().from(tenants).where(and(...conds)).orderBy(desc(tenants.isVerified), tenants.name);
}

export async function getTenantBySlug(slug: string) {
  const rows = await db.select().from(tenants).where(and(eq(tenants.slug, slug), eq(tenants.isActive, true))).limit(1);
  return rows[0] ?? null;
}

export async function getAllTenantSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: tenants.slug }).from(tenants).where(eq(tenants.isActive, true));
  return rows.map((r) => r.slug);
}

export async function getFeaturedTenants(limit = 6) {
  return db.select().from(tenants).where(eq(tenants.isActive, true)).orderBy(desc(tenants.isVerified), tenants.name).limit(limit);
}
```

- [ ] **Step 3: Buat `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/vendor", "/tutor", "/parent", "/students", "/attendance", "/billing", "/crm", "/messages", "/settings", "/gallery", "/schedule", "/classes", "/tutors", "/tutor-payout", "/birthdays", "/lesson-plans", "/daily-reports"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Buat `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllTenantSlugs } from "@/lib/tenants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllTenantSlugs();
  const staticRoutes = ["", "/marketplace", "/auth/login", "/auth/register"].map((p) => ({
    url: `${siteConfig.url}${p}`,
    lastModified: new Date(),
  }));
  const tenantRoutes = slugs.map((slug) => ({
    url: `${siteConfig.url}/marketplace/${slug}`,
    lastModified: new Date(),
  }));
  return [...staticRoutes, ...tenantRoutes];
}
```

- [ ] **Step 5: Update `src/app/layout.tsx` metadata**

```ts
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — Manajemen Daycare, Preschool & Bimbel`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { type: "website", locale: "id_ID", siteName: siteConfig.name, title: siteConfig.name, description: siteConfig.description },
};
```

- [ ] **Step 6: Verifikasi**

```bash
npm run dev & sleep 5
curl -s http://localhost:3000/robots.txt | head -5   # Expected: User-agent: * + Sitemap URL
curl -s http://localhost:3000/sitemap.xml | grep -c "marketplace/"   # Expected: >= 10 (slug tenant)
kill %1
```

- [ ] **Step 7: Commit** `feat(seo): robots, sitemap dinamis tenant, metadata root + site config`

---

### Task 3: Marketplace publik `/marketplace` (list, server-rendered) + filter searchParams

**Files:**
- Create: `src/app/(public)/marketplace/page.tsx` (RSC), `src/components/marketplace/TenantCard.tsx` (client ringan), `src/components/marketplace/MarketplaceFilters.tsx` (client)
- Modify: `src/app/(parent)/parent/marketplace/page.tsx` (delegate ke komponen publik yang sama)

**Interfaces:**
- Consumes: `listActiveTenants`, `TenantFilters` (Task 2), `tenants` row type.
- Produces: `TenantCard` props `{ tenant: typeof tenants.$inferSelect }`.

- [ ] **Step 1: Buat `src/components/marketplace/TenantCard.tsx`** — client component presentational: badge type + verified ✓, nama, tagline, kota, `priceFrom` format `Rp` via `Intl.NumberFormat("id-ID")`, Link href={`/marketplace/${tenant.slug}`}.
- [ ] **Step 2: Buat `src/components/marketplace/MarketplaceFilters.tsx`** — client component: form GET ke `/marketplace` dengan `<select name="type">` (semua/daycare/preschool/bimbel) + `<input name="q">` + `<input name="city">`; submit = native form GET (tanpa state filter client-side — filter hidup di URL untuk SEO).
- [ ] **Step 3: Buat `src/app/(public)/marketplace/page.tsx`**

```tsx
import type { Metadata } from "next";
import { listActiveTenants, type TenantFilters } from "@/lib/tenants";
import { TenantCard } from "@/components/marketplace/TenantCard";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";

export const metadata: Metadata = {
  title: "Marketplace Daycare, Preschool & Bimbel Terverifikasi",
  description: "Temukan dan bandingkan daycare, preschool, dan bimbel terverifikasi di seluruh Indonesia.",
};

type SearchParams = Promise<{ type?: string; city?: string; q?: string }>;

export default async function MarketplacePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters: TenantFilters = {
    type: sp.type === "daycare" || sp.type === "preschool" || sp.type === "bimbel" ? sp.type : undefined,
    city: sp.city || undefined,
    q: sp.q || undefined,
  };
  const tenantList = await listActiveTenants(filters);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Marketplace Daycare &amp; Bimbel</h1>
      <p className="mt-2 text-muted-foreground">{tenantList.length} pusat pembelajaran ditemukan</p>
      <MarketplaceFilters />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tenantList.map((t) => <TenantCard key={t.id} tenant={t} />)}
      </div>
      {tenantList.length === 0 && <p className="mt-10 text-center text-muted-foreground">Tidak ada hasil. Coba ubah filter.</p>}
    </main>
  );
}
```

- [ ] **Step 4: Update `src/app/(parent)/parent/marketplace/page.tsx`** — ganti isi menjadi re-export/thin wrapper yang me-render komponen list yang sama (render `MarketplaceContent` shared; ekstrak JSX list dari Step 3 ke `src/components/marketplace/MarketplaceContent.tsx` server component agar kedua route memakai satu sumber). `/parent/marketplace` tetap di dalam parent layout (proteksi role tetap).
- [ ] **Step 5: Verifikasi**

```bash
npm run dev & sleep 5
curl -s http://localhost:3000/marketplace | grep -o "Majiku Kids" | head -1   # Expected: konten di HTML (view-source test)
curl -s "http://localhost:3000/marketplace?type=bimbel" | grep -c "marketplace/" 
kill %1
```
Expected: nama tenant muncul di HTML awal (server-rendered), filter type mempersempit hasil.

- [ ] **Step 6: Commit** `feat(marketplace): list publik server-rendered + filter URL-based, parent marketplace reuse komponen`

---

### Task 4: Detail tenant `/marketplace/[slug]` + JSON-LD

**Files:**
- Create: `src/app/(public)/marketplace/[slug]/page.tsx` (RSC dengan generateMetadata + JSON-LD), `src/components/marketplace/ProgramList.tsx`

**Interfaces:**
- Consumes: `getTenantBySlug` (Task 2), `siteConfig` (Task 2).

- [ ] **Step 1: Buat `src/app/(public)/marketplace/[slug]/page.tsx`** — `generateStaticParams` tidak dipakai (dynamic); `generateMetadata` dari tenant (title `${name} — ${city}`, description dari tagline/description, OG, canonical `${siteConfig.url}/marketplace/${slug}`); `notFound()` saat slug tidak ada; render: header (nama + badge + verified), tagline, deskripsi, alamat + kota, daftar program (name, ageRange, priceFrom), CTA WhatsApp `https://wa.me/${whatsapp}` (tampil hanya jika whatsapp ada), JSON-LD script:

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: tenant.name,
  description: tenant.description ?? tenant.tagline,
  address: { "@type": "PostalAddress", streetAddress: tenant.address, addressLocality: tenant.city, addressCountry: "ID" },
  url: `${siteConfig.url}/marketplace/${tenant.slug}`,
};
// <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

- [ ] **Step 2: Buat `src/components/marketplace/ProgramList.tsx`** — server component murni: daftar `programs` dengan JSON-LD `Course` per program (hanya jika programs array tidak kosong):

```tsx
const courseJsonLd = tenant.programs?.map((p) => ({
  "@context": "https://schema.org", "@type": "Course",
  name: p.name, description: `Program ${p.name} untuk usia ${p.ageRange} di ${tenant.name}`,
  provider: { "@type": "Organization", name: tenant.name },
}));
```

- [ ] **Step 3: Verifikasi**

```bash
npm run dev & sleep 5
curl -s http://localhost:3000/marketplace/majiku-kids | grep -c "application/ld+json"   # Expected: >= 2 (LocalBusiness + Course)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/marketplace/slug-palsu     # Expected: 404
curl -s http://localhost:3000/marketplace/majiku-kids | grep -o "<title>[^<]*"            # Expected: title berisi nama tenant
kill %1
```

- [ ] **Step 4: Commit** `feat(marketplace): detail tenant server-rendered + JSON-LD LocalBusiness & Course`

---

### Task 5: Landing SSR + `/site/[type]` SSR

**Files:**
- Modify: `src/app/(public)/page.tsx` (server page fetch featured tenants → props), `src/views/SaasLanding.tsx` (terima props `featuredTenants`, render section "Featured" dari data nyata), `src/app/(public)/site/[type]/page.tsx` (RSC list tenant by type), `src/app/(public)/site/[type]/page.tsx` metadata.

**Interfaces:**
- Consumes: `getFeaturedTenants`, `listActiveTenants` (Task 2), `TenantCard` (Task 3).

- [ ] **Step 1: Ubah `src/app/(public)/page.tsx`** menjadi async server component yang fetch `getFeaturedTenants(6)` dan me-render `<SaasLanding featuredTenants={rows} />` (saat ini thin re-export client — ganti).

- [ ] **Step 2: Ubah `src/views/SaasLanding.tsx`** — tambah props `{ featuredTenants }` (default `[]` agar tidak breaking), tetap `"use client"`, tambahkan satu section baru "Daycare & Bimbel Pilihan" setelah hero yang me-render `featuredTenants` dengan `TenantCard` (data nyata, bukan mock). Jangan hapus konten landing yang ada.

- [ ] **Step 3: Ubah `src/app/(public)/site/[type]/page.tsx`** — RSC: validasi `type` ∈ {daycare, preschool, tk, bimbel} (map `tk`→`preschool`), fetch `listActiveTenants({ type })`, render grid `TenantCard` + intro copy per type + `generateMetadata` per type (`"Daycare di Indonesia — Temukan TPA Terverifikasi"` dst), `notFound()` untuk type tidak valid.

- [ ] **Step 4: Verifikasi**

```bash
npm run build   # Expected: / dan /site/[type] ter-SSR tanpa error
npm run dev & sleep 5
curl -s http://localhost:3000/ | grep -c "marketplace/"     # Expected: >= 6 (link featured tenant di HTML)
curl -s http://localhost:3000/site/daycare | grep -o "<title>[^<]*"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/site/kindergarten   # Expected: 404
kill %1
```

- [ ] **Step 5: Commit** `feat(seo): landing featured tenants dari DB + microsite /site/[type] server-rendered`

---

### Task 6: Verifikasi akhir Fase 2 + deploy staging

**Files:**
- Create: `docs/superpowers/plans/2026-10-05-fase2-verification.md`
- Modify: tidak ada kode (kecuali temuan)

- [ ] **Step 1: Full check lokal**: `npx tsc --noEmit` clean; `npm run build` sukses; smoke semua route lama tetap lulus (loop 21 route dari plan Fase 1) + route baru (`/marketplace`, `/marketplace/[slug]` 10 slug, `/site/daycare|preschool|bimbel`).
- [ ] **Step 2: SEO checklist terdokumentasi**: view-source `/`, `/marketplace`, `/marketplace/majiku-kids`, `/site/daycare` → catat keberadaan `<title>`, meta description, canonical, OG tags, JSON-LD; `/sitemap.xml` berisi ≥ 14 URL; `/robots.txt` valid + disallow area privat.
- [ ] **Step 3: Deploy staging** (`npm run deploy`, wrangler sudah OAuth-login) + ulangi curl checklist di URL workers.dev.
- [ ] **Step 4: Commit** `chore(fase2): verifikasi akhir — publik server-rendered, sitemap+JSON-LD live di staging`

---

## Self-Review (dijalankan)

1. **Spec coverage Fase 2**: tabel `tenants` ✓ (T1), sitemap+robots+metadata ✓ (T2), marketplace list+detail server-rendered ✓ (T3/T4), parent marketplace reuse ✓ (T3 Step 4), landing SSR ✓ (T5), `/site/[type]` ✓ (T5), JSON-LD LocalBusiness+Course ✓ (T4), middleware edge sudah dari Fase 1 (tidak perlu task), Lighthouse ≥90 → user-run, checklist manual disediakan ✓ (T6).
2. **Placeholder scan**: tidak ada TBD; semua kode kunci ditampilkan penuh; TenantCard/MarketplaceFilters/ProgramList dideskripsikan dengan props & perilaku eksplisit (presentational, konten di step).
3. **Type consistency**: `listActiveTenants/getTenantBySlug/getAllTenantSlugs/getFeaturedTenants` (T2) dipakai T3/T4/T5 dengan signature sama; `TenantProgram` didefinisikan T1 dipakai T4; `siteConfig.url` T2 dipakai T2/T4.
