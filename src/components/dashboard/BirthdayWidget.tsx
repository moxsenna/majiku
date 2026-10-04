import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, Gift, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BirthdayStudent {
  id: string;
  name: string;
  avatar?: string;
  className: string;
  birthDate: string;
  age: number;
  daysUntil: number;
}

interface BirthdayWidgetProps {
  birthdays: BirthdayStudent[];
}

export function BirthdayWidget({ birthdays }: BirthdayWidgetProps) {
  const { toast } = useToast();

  const handleSendWish = (name: string) => {
    toast({
      title: "Ucapan Terkirim! 🎉",
      description: `Ucapan selamat ulang tahun untuk ${name} telah dikirim ke orang tua.`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-highlight/10 flex items-center justify-center shrink-0">
            <Cake className="h-4 w-4 sm:h-5 sm:w-5 text-highlight" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base">Ulang Tahun</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">Minggu ini</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-2 sm:space-y-3">
          {birthdays.map((student) => (
            <div
              key={student.id}
              className="flex items-start sm:items-center justify-between p-2 sm:p-3 rounded-lg bg-highlight/5 border border-highlight/20 gap-2"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative shrink-0">
                  <Avatar size="sm" className="sm:w-10 sm:h-10">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback className="bg-highlight/20 text-highlight-foreground text-xs sm:text-sm">
                      {student.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 sm:h-6 sm:w-6 rounded-full bg-highlight flex items-center justify-center">
                    <Gift className="h-2 w-2 sm:h-3 sm:w-3 text-highlight-foreground" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-xs sm:text-sm truncate">{student.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {student.className} • Usia {student.age} thn
                  </p>
                  <p className="text-[10px] sm:text-xs text-highlight-foreground font-medium">
                    {student.daysUntil === 0
                      ? "Hari ini! 🎉"
                      : student.daysUntil === 1
                      ? "Besok"
                      : `${student.daysUntil} hari lagi`}
                  </p>
                </div>
              </div>

              <Button variant="soft" size="sm" className="shrink-0 text-xs px-2 sm:px-3" onClick={() => handleSendWish(student.name)}>
                <Send className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Kirim</span>
              </Button>
            </div>
          ))}

          {birthdays.length === 0 && (
            <div className="text-center py-4 sm:py-6 text-muted-foreground">
              <Cake className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">Tidak ada ulang tahun minggu ini</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
