"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMyNotifications,
  getPushPublicKey,
  savePushSubscription,
  markAllNotificationsRead,
  type MyNotifications,
} from "@/server/actions/notifikasi";
import { cn } from "@/lib/utils";

/**
 * Lonceng notifikasi (N4) — badge unread + panel daftar, polling 30 detik.
 * Dipakai di portal ortu, guru, dan shell admin. Tanpa data saat sesi kosong.
 */
export function NotificationBell({ tone = "ink" }: { tone?: "ink" | "muted" }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["notifikasi"],
    queryFn: getMyNotifications,
    refetchInterval: 30_000,
    placeholderData: (prev: MyNotifications | undefined) => prev,
  });

  const tandaiSemua = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifikasi"] }),
  });

  const unread = data?.unread ?? 0;
  const items = data?.items ?? [];

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "press relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted",
          tone === "muted" && "border-transparent bg-transparent",
        )}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unread > 0 && (
          <span className="tabular absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-[18px] text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-[320px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-sm font-semibold">Notifikasi</span>
              {unread > 0 && (
                <Button
                  variant="txt"
                  size="sm"
                  onClick={() => tandaiSemua.mutate()}
                  disabled={tandaiSemua.isPending}
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                  Tandai dibaca
                </Button>
              )}
            </div>
            <AktifkanPush />
            <div className="max-h-[360px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <BellOff className="h-6 w-6 text-muted-foreground/50" aria-hidden />
                  <p className="text-[13px] text-muted-foreground">
                    Belum ada notifikasi. Kabar check-in, laporan harian, tagihan, dan pesan akan muncul di sini.
                  </p>
                </div>
              ) : (
                items.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "#"}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block border-b border-border-subtle px-4 py-3 last:border-b-0 hover:bg-muted",
                      !n.readAt && "bg-primary/5",
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-[14px]", !n.readAt && "font-semibold")}>
                          {n.title}
                        </span>
                        {n.body && (
                          <span className="mt-0.5 block line-clamp-2 text-[13px] text-muted-foreground">
                            {n.body}
                          </span>
                        )}
                      </span>
                      {!n.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function b64ToUint8(b64: string): Uint8Array {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Tawarkan Web Push bila browser mendukung, kunci VAPID ada, dan belum diizinkan. */
function AktifkanPush() {
  const [state, setState] = useState<"hidden" | "offer" | "busy" | "denied">("hidden");

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "denied") return setState("denied");
    let batal = false;
    (async () => {
      const key = await getPushPublicKey();
      if (!key || batal) return;
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.getSubscription();
      if (sub && Notification.permission === "granted") {
        // Segarkan di server (mis. setelah ganti akun di perangkat yang sama).
        const j = sub.toJSON();
        await savePushSubscription({ endpoint: sub.endpoint, p256dh: j.keys?.p256dh ?? "", auth: j.keys?.auth ?? "" });
        return;
      }
      if (!batal) setState("offer");
    })().catch(() => {});
    return () => {
      batal = true;
    };
  }, []);

  if (state === "hidden") return null;
  if (state === "denied")
    return (
      <p className="border-b border-border px-4 py-2 text-[12px] text-muted-foreground">
        Notifikasi HP diblokir di browser. Izinkan lewat pengaturan situs untuk menerima kabar.
      </p>
    );

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 px-4 py-2">
      <span className="text-[12px] text-foreground-2">Terima kabar langsung di HP</span>
      <Button
        size="sm"
        disabled={state === "busy"}
        onClick={async () => {
          setState("busy");
          try {
            const key = await getPushPublicKey();
            if (!key) return setState("hidden");
            const perm = await Notification.requestPermission();
            if (perm !== "granted") return setState(perm === "denied" ? "denied" : "offer");
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: b64ToUint8(key) as BufferSource,
            });
            const j = sub.toJSON();
            await savePushSubscription({
              endpoint: sub.endpoint,
              p256dh: j.keys?.p256dh ?? "",
              auth: j.keys?.auth ?? "",
              userAgent: navigator.userAgent,
            });
            setState("hidden");
          } catch {
            setState("offer");
          }
        }}
      >
        Aktifkan
      </Button>
    </div>
  );
}
