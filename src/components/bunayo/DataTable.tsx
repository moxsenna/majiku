"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FilterChip } from "./ClassChip";

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Nilai untuk pengurutan; kolom tanpa sortValue tidak bisa diurutkan */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Angka (Plex Mono, rata kanan) */
  numeric?: boolean;
  /** Disembunyikan di lebar ≤ 560 px (kit .m-hide) */
  hideOnMobile?: boolean;
  /** Kolom pertama yang menempel saat tabel digulir mendatar */
  sticky?: boolean;
  className?: string;
}

export interface FilterOption<T> {
  id: string;
  label: string;
  predicate: (row: T) => boolean;
}

/**
 * Tabel data kit (.tbl): cari, chip filter, sort, centang + bilah aksi massal gelap, kolom sticky, paginasi,
 * dan mode kartu di ≤ 560 px (`renderCard`).
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  searchPlaceholder = "Cari…",
  searchText,
  filters,
  defaultFilter,
  selectable,
  bulkActions,
  renderCard,
  onRowClick,
  pageSize = 25,
  empty,
  toolbarRight,
  activeRowId,
  highlightRow,
  initialQuery = "",
  className,
}: {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  /** Teks yang dicari untuk tiap baris; tanpa ini kotak cari disembunyikan */
  searchText?: (row: T) => string;
  filters?: FilterOption<T>[];
  defaultFilter?: string;
  selectable?: boolean;
  /** Dirender di bilah gelap saat ada baris dicentang */
  bulkActions?: (selected: T[], clear: () => void) => React.ReactNode;
  renderCard?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  /** Ditampilkan bila tidak ada baris sama sekali (sebelum filter) */
  empty?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  /** Baris yang sedang dibuka di panel samping: latar Garis muda + garis Tinta di kiri (bukan stabilo) */
  activeRowId?: string | null;
  /** Baris tertahan yang perlu dicek (latar Matahari muda, kit K7) — bukan stabilo */
  highlightRow?: (row: T) => boolean;
  /** Isi awal kotak cari, mis. dari ?q= */
  initialQuery?: string;
  className?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [filter, setFilter] = useState(defaultFilter ?? filters?.[0]?.id ?? "");
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let out = rows;
    const f = filters?.find((x) => x.id === filter);
    if (f) out = out.filter(f.predicate);
    if (searchText && q.trim()) {
      const needle = q.trim().toLowerCase();
      out = out.filter((r) => searchText(r).toLowerCase().includes(needle));
    }
    if (sort) {
      const col = columns.find((c) => c.id === sort.id);
      if (col?.sortValue) {
        const sv = col.sortValue;
        out = [...out].sort((a, b) => {
          const va = sv(a);
          const vb = sv(b);
          if (va === vb) return 0;
          if (va === null || va === undefined) return 1;
          if (vb === null || vb === undefined) return -1;
          const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "id");
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return out;
  }, [rows, filters, filter, searchText, q, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const selectedRows = rows.filter((r) => selected.has(getRowId(r)));
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected.has(getRowId(r)));

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const togglePage = () =>
    setSelected((s) => {
      const n = new Set(s);
      pageRows.forEach((r) => (allOnPage ? n.delete(getRowId(r)) : n.add(getRowId(r))));
      return n;
    });
  const clear = () => setSelected(new Set());

  const sortBy = (id: string) => {
    setSort((s) => (s?.id === id ? (s.dir === "asc" ? { id, dir: "desc" } : null) : { id, dir: "asc" }));
    setPage(0);
  };

  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {(searchText || filters || toolbarRight) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchText && (
            <label className="flex h-input min-w-[220px] flex-1 items-center gap-2 rounded-input border border-input bg-card px-3 focus-within:border-primary focus-within:shadow-focus sm:max-w-xs">
              <Search className="h-[18px] w-[18px] text-muted-foreground" aria-hidden />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-placeholder"
                aria-label={searchPlaceholder}
              />
            </label>
          )}
          {filters && (
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <FilterChip
                  key={f.id}
                  active={filter === f.id}
                  count={rows.filter(f.predicate).length}
                  onClick={() => {
                    setFilter(f.id);
                    setPage(0);
                  }}
                >
                  {f.label}
                </FilterChip>
              ))}
            </div>
          )}
          {toolbarRight && <div className="ml-auto flex items-center gap-2">{toolbarRight}</div>}
        </div>
      )}

      {selectable && selectedRows.length > 0 && bulkActions && (
        <div className="flex flex-wrap items-center gap-2.5 rounded bg-foreground px-3.5 py-2.5 text-sm text-background [&_.bulk-sec]:border-background/50 [&_.bulk-sec]:bg-transparent [&_.bulk-sec]:text-background">
          <b>{selectedRows.length} dipilih</b>
          <span className="flex flex-1 flex-wrap items-center gap-2">{bulkActions(selectedRows, clear)}</span>
          <Button variant="txt" size="sm" className="text-background/80 hover:text-background" onClick={clear}>
            Batal
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded border border-border bg-card">
        {/* Tabel: > 560 px (atau selalu bila tidak ada renderCard) */}
        <div className={cn("overflow-x-auto", renderCard && "max-[560px]:hidden")}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-foreground">
                {selectable && (
                  <th className="sticky left-0 top-0 z-[2] w-10 bg-card px-3.5 py-2.5">
                    <Checkbox checked={allOnPage} onCheckedChange={togglePage} aria-label="Pilih semua di halaman ini" />
                  </th>
                )}
                {columns.map((c) => {
                  const active = sort?.id === c.id;
                  const SortIcon = active ? (sort?.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
                  return (
                    <th
                      key={c.id}
                      aria-sort={active ? (sort?.dir === "asc" ? "ascending" : "descending") : undefined}
                      className={cn(
                        "sticky top-0 whitespace-nowrap bg-card px-3.5 py-2.5 text-left text-[13px] font-medium text-muted-foreground",
                        c.numeric && "text-right",
                        c.sticky && "left-0 z-[2]",
                        c.sticky && selectable && "left-10",
                        c.hideOnMobile && "max-[560px]:hidden",
                      )}
                    >
                      {c.sortValue ? (
                        <button
                          type="button"
                          onClick={() => sortBy(c.id)}
                          className={cn("inline-flex items-center gap-1 hover:text-foreground", active && "text-foreground")}
                        >
                          {c.header}
                          <SortIcon className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => {
                const id = getRowId(r);
                const isSel = selected.has(id);
                const isActive = activeRowId === id;
                const isHl = !isActive && !isSel && !!highlightRow?.(r);
                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(r) : undefined}
                    className={cn(
                      "group border-b border-border-subtle last:border-b-0",
                      isSel && "bg-primary-soft/50",
                      isHl && "bg-matahari-soft",
                      isActive && "bg-muted shadow-[inset_3px_0_0_hsl(var(--foreground))]",
                      onRowClick && "cursor-pointer hover:bg-background",
                    )}
                  >
                    {selectable && (
                      <td className="sticky left-0 z-[1] bg-inherit px-3.5 py-[11px]" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSel} onCheckedChange={() => toggle(id)} aria-label="Pilih baris" />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td
                        key={c.id}
                        className={cn(
                          "px-3.5 py-[11px] align-middle",
                          c.numeric && "tabular whitespace-nowrap text-right",
                          // Sel sticky perlu latar sendiri yang mengikuti state baris (aktif/terpilih/hover).
                          c.sticky && "sticky left-0 z-[1]",
                          c.sticky && (isActive ? "bg-muted shadow-[inset_3px_0_0_hsl(var(--foreground))]" : isSel ? "bg-primary-soft" : isHl ? "bg-matahari-soft" : "bg-card"),
                          c.sticky && !isActive && !isSel && !isHl && onRowClick && "group-hover:bg-background",
                          c.sticky && selectable && "left-10",
                          c.hideOnMobile && "max-[560px]:hidden",
                          c.className,
                        )}
                      >
                        {c.cell(r)}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-3.5 py-8 text-center text-muted-foreground">
                    Tidak ada yang cocok dengan pencarian atau filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mode kartu ≤ 560 px */}
        {renderCard && (
          <div className="hidden max-[560px]:block">
            {pageRows.map((r) => {
              const id = getRowId(r);
              return (
                <div
                  key={id}
                  className={cn("flex items-start gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0", highlightRow?.(r) && "bg-matahari-soft")}
                >
                  {selectable && (
                    <span className="pt-1">
                      <Checkbox checked={selected.has(id)} onCheckedChange={() => toggle(id)} aria-label="Pilih" />
                    </span>
                  )}
                  <div
                    className={cn("min-w-0 flex-1", onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(r) : undefined}
                  >
                    {renderCard(r)}
                  </div>
                </div>
              );
            })}
            {pageRows.length === 0 && (
              <p className="px-4 py-8 text-center text-muted-foreground">Tidak ada yang cocok dengan pencarian atau filter ini.</p>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-3.5 py-2.5 text-[13px] text-muted-foreground">
            <span className="tabular">
              {safePage * pageSize + 1}–{Math.min(filtered.length, (safePage + 1) * pageSize)} dari {filtered.length}
            </span>
            {pageCount > 1 && (
              <span className="flex items-center gap-1">
                <Button variant="txt" size="icon-sm" onClick={() => setPage(safePage - 1)} disabled={safePage === 0} aria-label="Halaman sebelumnya" className="disabled:bg-transparent disabled:text-placeholder">
                  <ChevronLeft />
                </Button>
                <span className="tabular">
                  {safePage + 1}/{pageCount}
                </span>
                <Button variant="txt" size="icon-sm" onClick={() => setPage(safePage + 1)} disabled={safePage >= pageCount - 1} aria-label="Halaman berikutnya" className="disabled:bg-transparent disabled:text-placeholder">
                  <ChevronRight />
                </Button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Skeleton tabel. */
export function DataTableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded border border-border bg-card">
      <div className="flex gap-4 border-b border-foreground px-3.5 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <span key={i} className="sk h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-border-subtle px-3.5 py-3.5 last:border-b-0">
          <span className="sk sk-circle h-8 w-8 shrink-0" />
          {Array.from({ length: cols - 1 }).map((_, i) => (
            <span key={i} className={cn("sk flex-1", i % 2 ? "sk-light h-3" : "h-3.5")} />
          ))}
        </div>
      ))}
    </div>
  );
}
