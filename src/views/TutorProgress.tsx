import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Upload, Camera, Image, X, Check, 
  Utensils, Moon, Smile, BookOpen, AlertTriangle,
  Users, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const students = [
  { id: 1, name: "Ahmad Rizki", class: "Kelas A", avatar: "" },
  { id: 2, name: "Siti Aisyah", class: "Kelas A", avatar: "" },
  { id: 3, name: "Budi Santoso", class: "Kelas A", avatar: "" },
  { id: 4, name: "Dewi Lestari", class: "Kelas A", avatar: "" },
  { id: 5, name: "Eko Prasetyo", class: "Kelas A", avatar: "" },
];

const reportTypes = [
  { id: "meal", label: "Makan", icon: Utensils, color: "text-orange-500 bg-orange-500/10" },
  { id: "nap", label: "Tidur", icon: Moon, color: "text-blue-500 bg-blue-500/10" },
  { id: "mood", label: "Mood", icon: Smile, color: "text-yellow-500 bg-yellow-500/10" },
  { id: "activity", label: "Aktivitas", icon: BookOpen, color: "text-green-500 bg-green-500/10" },
  { id: "incident", label: "Insiden", icon: AlertTriangle, color: "text-red-500 bg-red-500/10" },
];

const moodOptions = ["😊 Senang", "😐 Biasa", "😢 Sedih", "😴 Lelah", "🤒 Kurang Sehat"];
const mealOptions = ["Habis", "Setengah", "Sedikit", "Tidak Makan"];
const napOptions = ["Tidur Nyenyak", "Tidur Sebentar", "Sulit Tidur", "Tidak Tidur"];

export default function TutorProgress() {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [reportType, setReportType] = useState("activity");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [moodValue, setMoodValue] = useState("");
  const [mealValue, setMealValue] = useState("");
  const [napValue, setNapValue] = useState("");

  const toggleStudent = (id: number) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handlePhotoUpload = () => {
    // Simulated photo upload
    const mockPhoto = "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400";
    setPhotos(prev => [...prev, mockPhoto]);
    toast.success("Foto berhasil diupload");
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedStudents.length === 0) {
      toast.error("Pilih minimal 1 siswa");
      return;
    }
    if (!description.trim()) {
      toast.error("Isi deskripsi laporan");
      return;
    }

    toast.success(`Laporan untuk ${selectedStudents.length} siswa berhasil dikirim!`);
    setSelectedStudents([]);
    setDescription("");
    setPhotos([]);
    setMoodValue("");
    setMealValue("");
    setNapValue("");
  };

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
            <h1 className="font-bold text-lg">Upload Laporan Progress</h1>
            <p className="text-xs text-muted-foreground">Buat laporan harian siswa</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Select Students */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pilih Siswa
              </CardTitle>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedStudents.length === students.length ? "Batal Semua" : "Pilih Semua"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all",
                    selectedStudents.includes(student.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {selectedStudents.includes(student.id) && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">{student.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
            {selectedStudents.length > 0 && (
              <p className="text-sm text-primary mt-3 font-medium">
                {selectedStudents.length} siswa dipilih
              </p>
            )}
          </CardContent>
        </Card>

        {/* Report Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Jenis Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all",
                    reportType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", type.color)}>
                    <type.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Options based on report type */}
        {reportType === "mood" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pilih Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setMoodValue(mood)}
                    className={cn(
                      "px-4 py-2 rounded-full border-2 text-sm transition-all",
                      moodValue === mood
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === "meal" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status Makan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mealOptions.map((meal) => (
                  <button
                    key={meal}
                    onClick={() => setMealValue(meal)}
                    className={cn(
                      "px-4 py-2 rounded-full border-2 text-sm transition-all",
                      mealValue === meal
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === "nap" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status Tidur Siang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {napOptions.map((nap) => (
                  <button
                    key={nap}
                    onClick={() => setNapValue(nap)}
                    className={cn(
                      "px-4 py-2 rounded-full border-2 text-sm transition-all",
                      napValue === nap
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {nap}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Deskripsi</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Tulis detail laporan di sini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Foto Kegiatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={handlePhotoUpload}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <Camera className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Tambah</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button onClick={handleSubmit} className="w-full h-12 text-base" size="lg">
          <Upload className="w-5 h-5 mr-2" />
          Kirim Laporan
        </Button>
      </main>
    </div>
  );
}
