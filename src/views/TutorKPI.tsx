import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Target, TrendingUp, Award, Star, 
  CheckCircle2, Clock, MessageCircle, Camera,
  ChevronRight, Trophy, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const kpiMetrics = [
  { 
    id: "attendance",
    label: "Kehadiran", 
    value: 95, 
    target: 95, 
    icon: Clock, 
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    description: "Persentase kehadiran tepat waktu"
  },
  { 
    id: "reports",
    label: "Laporan Harian", 
    value: 88, 
    target: 90, 
    icon: Camera, 
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Kelengkapan laporan siswa"
  },
  { 
    id: "response",
    label: "Respon Chat", 
    value: 92, 
    target: 85, 
    icon: MessageCircle, 
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Kecepatan respon ke orang tua"
  },
  { 
    id: "quality",
    label: "Kualitas Laporan", 
    value: 85, 
    target: 80, 
    icon: Star, 
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    description: "Rating dari orang tua"
  },
];

const achievements = [
  { id: 1, title: "Tutor Teladan", description: "Kehadiran 100% selama 1 bulan", icon: Trophy, unlocked: true, date: "November 2024" },
  { id: 2, title: "Komunikator Handal", description: "Respon chat < 5 menit selama 1 minggu", icon: Zap, unlocked: true, date: "Oktober 2024" },
  { id: 3, title: "Super Dokumenter", description: "Upload 100 laporan dengan foto", icon: Camera, unlocked: false, progress: 78 },
  { id: 4, title: "Bintang 5", description: "Rating 5 bintang dari 50 orang tua", icon: Star, unlocked: false, progress: 45 },
];

const monthlyHistory = [
  { month: "Desember 2024", score: 92, trend: "up" },
  { month: "November 2024", score: 89, trend: "up" },
  { month: "Oktober 2024", score: 85, trend: "down" },
  { month: "September 2024", score: 88, trend: "up" },
];

export default function TutorKPI() {
  const overallScore = Math.round(kpiMetrics.reduce((acc, m) => acc + m.value, 0) / kpiMetrics.length);
  
  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Link href="/tutor">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg">KPI & Performa</h1>
            <p className="text-xs text-muted-foreground">Pantau pencapaian Anda</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Overall Score Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-center text-primary-foreground">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="12"
                  fill="none"
                  className="stroke-primary-foreground/20"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="12"
                  fill="none"
                  className="stroke-primary-foreground"
                  strokeLinecap="round"
                  strokeDasharray={`${(overallScore / 100) * 352} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{overallScore}</span>
                <span className="text-sm opacity-80">dari 100</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-1">Skor KPI Anda</h2>
            <p className="text-primary-foreground/80 text-sm">Bulan Desember 2024</p>
            <Badge variant="secondary" className="mt-3 bg-white/20 text-white border-0">
              <TrendingUp className="w-3 h-3 mr-1" />
              +3% dari bulan lalu
            </Badge>
          </div>
        </Card>

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="metrics">Metrik</TabsTrigger>
            <TabsTrigger value="achievements">Pencapaian</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4 mt-4">
            {kpiMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", metric.bgColor)}>
                      <metric.icon className={cn("w-6 h-6", metric.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{metric.label}</h3>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-lg font-bold", metric.color)}>{metric.value}%</span>
                          {metric.value >= metric.target ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Target className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <Progress value={metric.value} className="h-2 mb-2" />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                        <p className="text-xs text-muted-foreground">Target: {metric.target}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4 mt-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={cn(!achievement.unlocked && "opacity-60")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      achievement.unlocked 
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500" 
                        : "bg-muted"
                    )}>
                      <achievement.icon className={cn(
                        "w-7 h-7",
                        achievement.unlocked ? "text-white" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        {achievement.unlocked && (
                          <Badge variant="default" className="bg-green-500">Tercapai</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked ? (
                        <p className="text-xs text-primary mt-1">{achievement.date}</p>
                      ) : (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                {monthlyHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium">{item.month}</p>
                      <p className="text-xs text-muted-foreground">Skor KPI bulanan</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">{item.score}</span>
                      {item.trend === "up" ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tips Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Tips Meningkatkan KPI</h3>
                <p className="text-sm text-muted-foreground">
                  Upload laporan harian sebelum jam 15:00 untuk meningkatkan skor kelengkapan laporan Anda.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
