import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  createdAt: Date | string | null;
}

interface AnnouncementsCardProps {
  announcements: AnnouncementItem[];
}

export function AnnouncementsCard({ announcements }: AnnouncementsCardProps) {
  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-4">
      <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-primary" /> Pengumuman
      </h3>
      <div className="space-y-2">
        {announcements.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{a.title}</p>
                <Badge variant="secondary">Baru</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap">
                {a.body}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                {a.createdAt
                  ? formatDistanceToNow(new Date(a.createdAt), {
                      addSuffix: true,
                      locale: idLocale,
                    })
                  : "-"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
