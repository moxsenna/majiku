"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Users,
  Calendar,
  FileText,
  Sparkles,
  Clock,
  Star,
  Heart,
  Baby,
  Home,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  User,
  AlertCircle,
  Timer,
  XCircle,
  CalendarCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const programs = [
  {
    id: "toddler",
    name: "Program Toddler",
    age: "1.5 - 3 tahun",
    price: 2000000,
    schedule: "Senin - Jumat, 08:00 - 12:00",
    features: ["Stimulasi motorik", "Musik & gerak", "Bermain sensori"],
    color: "bg-highlight/10 border-highlight/30",
    icon: Baby,
    // Registration info
    quota: 20,
    enrolled: 15,
    closingDate: new Date("2025-01-15"),
    status: "open",
    nextOpenDate: null,
  },
  {
    id: "playgroup",
    name: "Playgroup",
    age: "3 - 4 tahun",
    price: 2500000,
    schedule: "Senin - Jumat, 08:00 - 13:00",
    features: ["Belajar huruf & angka", "Kegiatan seni", "Bermain kreatif"],
    color: "bg-primary/10 border-primary/30",
    icon: Star,
    popular: true,
    quota: 25,
    enrolled: 25,
    closingDate: new Date("2025-01-10"),
    status: "full",
    nextOpenDate: new Date("2025-02-01"),
  },
  {
    id: "kindergarten",
    name: "TK A & B",
    age: "4 - 6 tahun",
    price: 3000000,
    schedule: "Senin - Jumat, 07:30 - 14:00",
    features: ["Persiapan SD", "Bahasa Inggris", "Ekstrakurikuler"],
    color: "bg-success/10 border-success/30",
    icon: GraduationCap,
    quota: 30,
    enrolled: 22,
    closingDate: new Date("2025-01-20"),
    status: "open",
    nextOpenDate: null,
  },
  {
    id: "daycare",
    name: "Daycare Full Day",
    age: "1.5 - 6 tahun",
    price: 3500000,
    schedule: "Senin - Jumat, 07:00 - 17:00",
    features: ["Makan 3x + snack", "Tidur siang", "Aktivitas lengkap"],
    color: "bg-info/10 border-info/30",
    icon: Heart,
    quota: 15,
    enrolled: 15,
    closingDate: new Date("2024-12-31"),
    status: "closed",
    nextOpenDate: new Date("2025-03-01"),
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ParentRegistration() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Child Info
    childName: "",
    childNickname: "",
    birthDate: "",
    gender: "",
    allergies: "",
    medicalNotes: "",
    
    // Parent Info
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    
    // Preferences
    startDate: "",
    additionalNotes: "",
    agreeTerms: false,
  });

  const updateForm = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.agreeTerms) {
      toast({
        title: "Syarat & Ketentuan",
        description: "Silakan setujui syarat dan ketentuan terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);

    toast({
      title: "Pendaftaran Berhasil! 🎉",
      description: "Tim kami akan menghubungi Anda dalam 1-2 hari kerja",
    });

    router.push("/parent");
  };

  const nextStep = () => {
    if (step === 1 && !selectedProgram) {
      toast({
        title: "Pilih Program",
        description: "Silakan pilih program yang diinginkan",
        variant: "destructive",
      });
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/parent">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Pendaftaran Program</h1>
            <p className="text-xs text-muted-foreground">Langkah {step} dari 4</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {/* Step 1: Program Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <Sparkles className="h-12 w-12 mx-auto text-primary mb-3" />
              <h2 className="text-xl font-bold">Pilih Program</h2>
              <p className="text-sm text-muted-foreground">
                Pilih program yang sesuai untuk putra/putri Anda
              </p>
            </div>

            <div className="space-y-3">
              {programs.map((program) => {
                const remainingQuota = program.quota - program.enrolled;
                const quotaPercentage = (program.enrolled / program.quota) * 100;
                const daysRemaining = differenceInDays(program.closingDate, new Date());
                const hoursRemaining = differenceInHours(program.closingDate, new Date());
                const isOpen = program.status === "open";
                const isFull = program.status === "full";
                const isClosed = program.status === "closed";
                const isDisabled = isFull || isClosed;

                return (
                  <Card
                    key={program.id}
                    className={`transition-all border-2 ${
                      isDisabled
                        ? "opacity-75 cursor-not-allowed"
                        : "cursor-pointer"
                    } ${
                      selectedProgram === program.id
                        ? "border-primary shadow-lg"
                        : `${program.color} hover:border-primary/50`
                    }`}
                    onClick={() => !isDisabled && setSelectedProgram(program.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                            isDisabled 
                              ? "bg-muted text-muted-foreground" 
                              : selectedProgram === program.id 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                          }`}>
                            <program.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold">{program.name}</h3>
                              {program.popular && isOpen && (
                                <Badge variant="default" className="text-xs">Popular</Badge>
                              )}
                              {isFull && (
                                <Badge variant="destructive" className="text-xs">Kuota Penuh</Badge>
                              )}
                              {isClosed && (
                                <Badge variant="secondary" className="text-xs bg-muted-foreground/20">Tutup</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{program.age}</p>
                          </div>
                        </div>
                        {selectedProgram === program.id && !isDisabled && (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Clock className="h-3 w-3" />
                        <span>{program.schedule}</span>
                      </div>

                      {/* Quota & Countdown Info */}
                      <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-2">
                        {/* Quota */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Sisa Kuota:</span>
                          </div>
                          <span className={`font-bold ${remainingQuota <= 3 ? "text-red-600" : "text-green-600"}`}>
                            {remainingQuota} / {program.quota}
                          </span>
                        </div>
                        <Progress 
                          value={quotaPercentage} 
                          className={`h-1.5 ${quotaPercentage >= 90 ? "[&>div]:bg-destructive" : quotaPercentage >= 70 ? "[&>div]:bg-highlight" : ""}`} 
                        />

                        {/* Countdown or Status */}
                        {isOpen && daysRemaining >= 0 && (
                          <div className="flex items-center justify-between text-xs pt-1">
                            <div className="flex items-center gap-1.5">
                              <Timer className="h-3.5 w-3.5 text-highlight" />
                              <span className="text-muted-foreground">Pendaftaran ditutup:</span>
                            </div>
                            <span className={`font-bold ${daysRemaining <= 3 ? "text-red-600" : "text-amber-600"}`}>
                              {daysRemaining > 0
                                ? `${daysRemaining} hari lagi`
                                : `${hoursRemaining} jam lagi`
                              }
                            </span>
                          </div>
                        )}

                        {(isFull || isClosed) && program.nextOpenDate && (
                          <div className="flex items-center gap-2 text-xs pt-1 bg-blue-50 dark:bg-blue-950/30 rounded-md p-2 -mx-1">
                            <CalendarCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span className="text-blue-700 dark:text-blue-300">
                              Dibuka kembali: <strong>{format(program.nextOpenDate, "d MMMM yyyy", { locale: idLocale })}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {program.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">Biaya per bulan</span>
                        <span className="font-bold text-primary">{formatCurrency(program.price)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Child Information */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <Baby className="h-12 w-12 mx-auto text-primary mb-3" />
              <h2 className="text-xl font-bold">Data Anak</h2>
              <p className="text-sm text-muted-foreground">
                Lengkapi informasi putra/putri Anda
              </p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childName">Nama Lengkap Anak *</Label>
                    <Input
                      id="childName"
                      placeholder="Contoh: Aisyah Putri Ramadhani"
                      value={formData.childName}
                      onChange={(e) => updateForm("childName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="childNickname">Nama Panggilan</Label>
                    <Input
                      id="childNickname"
                      placeholder="Contoh: Aisyah"
                      value={formData.childNickname}
                      onChange={(e) => updateForm("childNickname", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Tanggal Lahir *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => updateForm("birthDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Jenis Kelamin *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => updateForm("gender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Laki-laki</SelectItem>
                          <SelectItem value="female">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Alergi (jika ada)</Label>
                    <Input
                      id="allergies"
                      placeholder="Contoh: Kacang, susu, udang"
                      value={formData.allergies}
                      onChange={(e) => updateForm("allergies", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalNotes">Catatan Kesehatan</Label>
                    <Textarea
                      id="medicalNotes"
                      placeholder="Informasi kesehatan penting yang perlu diketahui..."
                      value={formData.medicalNotes}
                      onChange={(e) => updateForm("medicalNotes", e.target.value)}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Contoh: Speech delay, ADHD, autisme, asma, epilepsi, kelainan jantung, atau kondisi khusus lainnya yang perlu diperhatikan guru.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Parent Information */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <Users className="h-12 w-12 mx-auto text-primary mb-3" />
              <h2 className="text-xl font-bold">Data Orang Tua</h2>
              <p className="text-sm text-muted-foreground">
                Lengkapi informasi kontak orang tua/wali
              </p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Nama Orang Tua/Wali *</Label>
                  <Input
                    id="parentName"
                    placeholder="Nama lengkap"
                    value={formData.parentName}
                    onChange={(e) => updateForm("parentName", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">No. Telepon *</Label>
                    <Input
                      id="parentPhone"
                      type="tel"
                      placeholder="08xxx"
                      value={formData.parentPhone}
                      onChange={(e) => updateForm("parentPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Email *</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      placeholder="email@contoh.com"
                      value={formData.parentEmail}
                      onChange={(e) => updateForm("parentEmail", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Alamat Lengkap *</Label>
                  <Textarea
                    id="address"
                    placeholder="Alamat rumah lengkap..."
                    value={formData.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-3">Kontak Darurat</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Nama</Label>
                      <Input
                        id="emergencyContact"
                        placeholder="Nama kontak darurat"
                        value={formData.emergencyContact}
                        onChange={(e) => updateForm("emergencyContact", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">No. Telepon</Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        placeholder="08xxx"
                        value={formData.emergencyPhone}
                        onChange={(e) => updateForm("emergencyPhone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 mx-auto text-primary mb-3" />
              <h2 className="text-xl font-bold">Konfirmasi Pendaftaran</h2>
              <p className="text-sm text-muted-foreground">
                Periksa kembali data yang Anda masukkan
              </p>
            </div>

            {/* Program Summary */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold">{programs.find((p) => p.id === selectedProgram)?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {programs.find((p) => p.id === selectedProgram)?.schedule}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Biaya Bulanan</span>
                  <span className="font-bold text-primary text-lg">
                    {formatCurrency(programs.find((p) => p.id === selectedProgram)?.price || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Child Info Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Baby className="h-4 w-4" />
                  Data Anak
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="font-medium">{formData.childName || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Lahir</span>
                  <span className="font-medium">{formData.birthDate || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jenis Kelamin</span>
                  <span className="font-medium">
                    {formData.gender === "male" ? "Laki-laki" : formData.gender === "female" ? "Perempuan" : "-"}
                  </span>
                </div>
                {formData.allergies && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alergi</span>
                    <span className="font-medium">{formData.allergies}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parent Info Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Data Orang Tua
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="font-medium">{formData.parentName || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telepon</span>
                  <span className="font-medium">{formData.parentPhone || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{formData.parentEmail || "-"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Terms */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => updateForm("agreeTerms", !!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    Saya menyetujui <span className="text-primary font-medium">Syarat & Ketentuan</span> serta{" "}
                    <span className="text-primary font-medium">Kebijakan Privasi</span> MAJIKU Daycare
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          )}
          {step < 4 ? (
            <Button variant="hero" onClick={nextStep} className="flex-1">
              Lanjut
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="hero"
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Mendaftar...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Kirim Pendaftaran
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <Link href="/parent" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <Home className="h-6 w-6" />
            <span className="text-xs">Beranda</span>
          </Link>
          <Link href="/parent/catalog" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs">Katalog</span>
          </Link>
          <Link href="/parent/billing" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <CreditCard className="h-6 w-6" />
            <span className="text-xs">Tagihan</span>
          </Link>
          <Link href="/parent/chat" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs">Chat</span>
          </Link>
          <Link href="/parent/profile" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <User className="h-6 w-6" />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
