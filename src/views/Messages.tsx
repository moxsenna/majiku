"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Megaphone, Send, Trash2, Users, CalendarDays, MessageSquarePlus } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  createAnnouncement,
  deleteAnnouncement,
  type AnnouncementRow,
} from "@/server/actions/announcements";

interface MessagesProps {
  announcements: AnnouncementRow[];
}

export default function Messages({ announcements }: MessagesProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const monthNow = now.getMonth();
    const yearNow = now.getFullYear();
    const monthCount = announcements.filter((a) => {
      const d = a.createdAt ? new Date(a.createdAt) : null;
      return d && d.getMonth() === monthNow && d.getFullYear() === yearNow;
    }).length;
    const latestRecipients =
      announcements.length > 0 ? (announcements[0].recipientCount ?? 0) : 0;
    return { total: announcements.length, monthCount, latestRecipients };
  }, [announcements]);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await createAnnouncement({ title, body });
      toast({
        title: "Broadcast terkirim",
        description: `Pengumuman dikirim ke ${result.recipientCount} orang tua`,
      });
      setTitle("");
      setBody("");
      setComposerOpen(false);
      startTransition(() => router.refresh());
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Gagal mengirim pengumuman",
        description: err.message || "Terjadi kesalahan saat mengirim broadcast",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAnnouncement(deleteTarget.id);
      toast({ title: "Pengumuman dihapus" });
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Gagal menghapus",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const canSubmit = title.trim().length >= 3 && body.trim().length >= 10;

  return (
    <DashboardLayout
      title="Komunikasi"
      subtitle="Broadcast pengumuman ke orang tua wali murid"
      hideNavbarActions
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Pengumuman</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.monthCount}</p>
                <p className="text-xs text-muted-foreground">Bulan Ini</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.latestRecipients}</p>
                <p className="text-xs text-muted-foreground">Penerima Terakhir</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Composer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquarePlus className="h-4 w-4 text-primary" /> Broadcast Baru
            </CardTitle>
            <CardDescription>
              Pengumuman akan tampil di portal seluruh orang tua yang terdaftar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Judul pengumuman (3-120 karakter)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
            <div className="space-y-1">
              <Textarea
                placeholder="Isi pengumuman (10-2000 karakter)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={2000}
                rows={4}
              />
              <p className="text-xs text-muted-foreground text-right">{body.length}/2000</p>
            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={!canSubmit || isPending}
              onClick={() => setComposerOpen(true)}
            >
              <Send className="h-4 w-4" /> Kirim Broadcast
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Riwayat Pengumuman
          </h3>
          {announcements.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Belum ada pengumuman yang dikirim.
              </CardContent>
            </Card>
          )}
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{a.title}</p>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {a.recipientCount ?? 0} penerima
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-3">
                      {a.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {a.createdAt
                        ? format(new Date(a.createdAt), "d MMMM yyyy, HH:mm", { locale: idLocale })
                        : "-"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Hapus pengumuman"
                    onClick={() => setDeleteTarget(a)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Send confirmation */}
      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kirim Broadcast?</DialogTitle>
            <DialogDescription>
              Pengumuman &ldquo;{title}&rdquo; akan dikirim ke seluruh orang tua yang terdaftar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposerOpen(false)} disabled={isSending}>
              Batal
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? "Mengirim..." : "Ya, Kirim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengumuman?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengumuman &ldquo;{deleteTarget?.title}&rdquo; akan dihapus dari portal orang tua.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
