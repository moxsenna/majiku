import { ClipboardCheck } from "lucide-react";
import { MobileSubHeader } from "@/components/bunayo";
import { getMyTrialQueue } from "@/server/actions/trial";
import { TrialReviewCard } from "@/components/tutor/TrialReviewCard";

export const dynamic = "force-dynamic";

export default async function TutorTrialsPage() {
  const queue = await getMyTrialQueue();

  return (
    <>
      <MobileSubHeader title="Observasi trial" eyebrow={`${queue.length} jadwal aktif`} backHref="/tutor" />

      <main className="mx-auto max-w-[560px] p-4 pb-24">
        {queue.length === 0 ? (
          <section className="rise flex items-start gap-3 rounded-sheet bg-card p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-anggur-soft text-anggur-ink">
              <ClipboardCheck className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-[15px] font-semibold">Belum ada trial yang ditugaskan</p>
              <p className="text-sm text-foreground-2">
                Saat admin menjadwalkan sesi observasi di kelas Anda, calon murid muncul di sini.
              </p>
            </div>
          </section>
        ) : (
          <div className="space-y-3">
            {queue.map((trial) => (
              <TrialReviewCard key={trial.id} trial={trial} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
