import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Clock, Package, Save, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  title: string;
  duration: number;
  description: string;
  materials: string[];
}

interface CreateLessonPlanDialogProps {
  children: React.ReactNode;
  template?: {
    title: string;
    subject: string;
    objectives: string[];
    activities: Activity[];
    materials: string[];
  };
  onSave?: (data: any) => void;
  onSaveAsTemplate?: (data: any) => void;
}

const demoTemplates = [
  { id: "1", name: "Montessori - Berhitung Dasar", subject: "Matematika" },
  { id: "2", name: "Sensori - Mengenal Warna", subject: "Sensori" },
  { id: "3", name: "Kreativitas - Melukis", subject: "Seni" },
  { id: "4", name: "Motorik - Senam Pagi", subject: "Olahraga" },
];

const demoClasses = [
  { id: "1", name: "Kelas Bunga Matahari" },
  { id: "2", name: "Kelas Pelangi" },
  { id: "3", name: "Kelas Bintang" },
];

const demoTutors = [
  { id: "1", name: "Ibu Sarah" },
  { id: "2", name: "Ibu Dina" },
  { id: "3", name: "Pak Ahmad" },
];

export function CreateLessonPlanDialog({ children, template, onSave, onSaveAsTemplate }: CreateLessonPlanDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
  const [formData, setFormData] = useState({
    title: template?.title || "",
    subject: template?.subject || "",
    classId: "",
    tutorId: "",
    date: "",
    time: "",
    objectives: template?.objectives || [""],
    activities: template?.activities || [
      { id: "1", title: "", duration: 15, description: "", materials: [] }
    ],
    materials: template?.materials || [""],
  });

  const [newMaterial, setNewMaterial] = useState("");

  const handleAddActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [
        ...prev.activities,
        { id: Date.now().toString(), title: "", duration: 15, description: "", materials: [] }
      ]
    }));
  };

  const handleRemoveActivity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== id)
    }));
  };

  const handleActivityChange = (id: string, field: keyof Activity, value: any) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map(a => 
        a.id === id ? { ...a, [field]: value } : a
      )
    }));
  };

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()]
      }));
      setNewMaterial("");
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleAddObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, ""]
    }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const handleRemoveObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.classId || !formData.date) {
      toast({
        title: "Form belum lengkap",
        description: "Mohon isi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    onSave?.(formData);
    toast({
      title: "Lesson Plan dibuat!",
      description: `${formData.title} berhasil disimpan`,
    });
    setOpen(false);
  };

  const handleSaveAsTemplate = () => {
    onSaveAsTemplate?.(formData);
    toast({
      title: "Template disimpan!",
      description: `${formData.title} disimpan sebagai template`,
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Demo: populate with sample data
    if (templateId === "1") {
      setFormData(prev => ({
        ...prev,
        title: "Montessori - Berhitung 1-10",
        subject: "Matematika",
        objectives: [
          "Anak mampu mengenal angka 1-10",
          "Anak mampu menghitung benda konkrit",
          "Anak mampu menulis angka 1-5"
        ],
        activities: [
          { id: "1", title: "Circle Time - Bernyanyi Angka", duration: 10, description: "Bernyanyi lagu angka bersama sambil tepuk tangan", materials: ["Speaker", "Lirik lagu"] },
          { id: "2", title: "Menghitung Manik-manik", duration: 20, description: "Anak menghitung manik-manik dan memasukkan ke wadah sesuai angka", materials: ["Manik-manik warna", "Wadah angka 1-10"] },
          { id: "3", title: "Menulis Angka di Pasir", duration: 15, description: "Anak menelusuri angka di nampan pasir", materials: ["Nampan pasir", "Kartu angka"] },
          { id: "4", title: "Games Tebak Angka", duration: 15, description: "Permainan interaktif menebak jumlah benda", materials: ["Kartu gambar", "Stiker reward"] },
        ],
        materials: ["Speaker", "Manik-manik warna", "Wadah angka", "Nampan pasir", "Kartu angka", "Kartu gambar", "Stiker reward"],
      }));
    }
  };

  const totalDuration = formData.activities.reduce((acc, act) => acc + act.duration, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Lesson Plan Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Option */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex-1">
              <Label className="text-sm font-medium">Gunakan Template?</Label>
              <p className="text-xs text-muted-foreground">Pilih template untuk mempercepat pembuatan</p>
            </div>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih template" />
              </SelectTrigger>
              <SelectContent>
                {demoTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Info */}
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Judul Lesson Plan *</Label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Montessori Berhitung 1-10"
                />
              </div>
              <div>
                <Label>Mata Pelajaran</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, subject: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matematika">Matematika</SelectItem>
                    <SelectItem value="Bahasa">Bahasa</SelectItem>
                    <SelectItem value="Seni">Seni</SelectItem>
                    <SelectItem value="Olahraga">Olahraga</SelectItem>
                    <SelectItem value="Sensori">Sensori</SelectItem>
                    <SelectItem value="Motorik">Motorik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kelas *</Label>
                <Select 
                  value={formData.classId} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, classId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoClasses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tutor</Label>
                <Select 
                  value={formData.tutorId} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, tutorId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoTutors.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tanggal *</Label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Waktu</Label>
                <Input 
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Objectives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Tujuan Pembelajaran</Label>
              <Button type="button" variant="ghost" size="sm" onClick={handleAddObjective}>
                <Plus className="w-4 h-4 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-2">
              {formData.objectives.map((obj, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={obj}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    placeholder={`Tujuan ${index + 1}`}
                  />
                  {formData.objectives.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveObjective(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <Label>Daftar Kegiatan</Label>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Total durasi: {totalDuration} menit
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddActivity}>
                <Plus className="w-4 h-4 mr-1" /> Tambah Kegiatan
              </Button>
            </div>
            <div className="space-y-3">
              {formData.activities.map((activity, index) => (
                <div key={activity.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <GripVertical className="w-4 h-4" />
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <Input 
                            value={activity.title}
                            onChange={(e) => handleActivityChange(activity.id, "title", e.target.value)}
                            placeholder="Nama kegiatan"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            value={activity.duration}
                            onChange={(e) => handleActivityChange(activity.id, "duration", parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">menit</span>
                        </div>
                      </div>
                      <Textarea 
                        value={activity.description}
                        onChange={(e) => handleActivityChange(activity.id, "description", e.target.value)}
                        placeholder="Deskripsi kegiatan yang harus dilakukan tutor..."
                        rows={2}
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveActivity(activity.id)}
                      disabled={formData.activities.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Alat Peraga & Material
              </Label>
            </div>
            <div className="flex gap-2 mb-2">
              <Input 
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                placeholder="Nama alat/material"
                onKeyDown={(e) => e.key === "Enter" && handleAddMaterial()}
              />
              <Button type="button" variant="outline" onClick={handleAddMaterial}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.materials.filter(m => m).map((material, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {material}
                  <button onClick={() => handleRemoveMaterial(index)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleSaveAsTemplate} className="gap-2">
              <Copy className="w-4 h-4" />
              Simpan sebagai Template
            </Button>
            <Button type="button" className="flex-1 gap-2" onClick={handleSubmit}>
              <Save className="w-4 h-4" />
              Simpan Lesson Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
