import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMyTrialQueue } from "@/server/actions/trial";
import { TrialReviewCard } from "@/components/tutor/TrialReviewCard";

export const dynamic = "force-dynamic";

export default async function TutorTrialsPage() {
  const queue = await getMyTrialQueue();

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link href="/tutor">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-foreground">
                  Antrean Trial Saya
                </h1>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {queue.length}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Tandai kehadiran sesi observasi dan kirimkan rekomendasi calon murid
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        {queue.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 px-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-base">
                Belum ada trial yang ditugaskan
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Saat admin menjadwalkan sesi trial untuk kelas Anda, calon murid akan muncul di antrean ini untuk diobservasi.
              </p>
              <div className="mt-5">
                <Link href="/tutor">
                  <Button variant="outline" size="sm">
                    Kembali ke Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Menampilkan {queue.length} jadwal trial aktif</span>
              <span className="flex items-center gap-1 text-primary font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Siap diobservasi
              </span>
            </div>
            {queue.map((trial) => (
              <TrialReviewCard key={trial.id} trial={trial} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
