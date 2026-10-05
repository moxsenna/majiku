"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  Plus,
  Search,
  Users,
  Edit,
  Power,
  MoreVertical,
  Clock,
  MapPin,
  DollarSign,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createClass,
  updateClass,
  toggleClassActive,
  type ClassRecord,
  type CreateClassInput,
  type UpdateClassInput,
} from "@/server/actions/classesCrud";

interface ClassesProps {
  initialClasses: ClassRecord[];
}

const formatCurrency = (amount: number | string | null | undefined) => {
  const num = typeof amount === "number" ? amount : Number(amount) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

export default function Classes({ initialClasses }: ClassesProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [classList, setClassList] = useState<ClassRecord[]>(initialClasses);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    pricePerMonth: "",
    sessionsPerMonth: "",
    schedule: "",
    location: "",
  });

  useEffect(() => {
    setClassList(initialClasses);
  }, [initialClasses]);

  const filteredClasses = classList.filter((cls) => {
    const q = searchQuery.toLowerCase();
    return (
      cls.name.toLowerCase().includes(q) ||
      (cls.description && cls.description.toLowerCase().includes(q)) ||
      (cls.location && cls.location.toLowerCase().includes(q))
    );
  });

  const totalClasses = classList.length;
  const activeClasses = classList.filter((c) => c.isActive).length;
  const totalCapacity = classList.reduce((acc, c) => acc + (c.capacity || 0), 0);

  const openAddDialog = () => {
    setFormData({
      name: "",
      description: "",
      capacity: "",
      pricePerMonth: "",
      sessionsPerMonth: "",
      schedule: "",
      location: "",
    });
    setIsAddOpen(true);
  };

  const openEditDialog = (cls: ClassRecord) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name || "",
      description: cls.description || "",
      capacity: cls.capacity !== null && cls.capacity !== undefined ? String(cls.capacity) : "",
      pricePerMonth: cls.pricePerMonth ? String(cls.pricePerMonth) : "",
      sessionsPerMonth:
        cls.sessionsPerMonth !== null && cls.sessionsPerMonth !== undefined
          ? String(cls.sessionsPerMonth)
          : "",
      schedule: cls.schedule || "",
      location: cls.location || "",
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Validasi gagal",
        description: "Nama kelas wajib diisi",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const input: CreateClassInput = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          capacity: formData.capacity ? Number(formData.capacity) : undefined,
          pricePerMonth: formData.pricePerMonth ? formData.pricePerMonth : undefined,
          sessionsPerMonth: formData.sessionsPerMonth ? Number(formData.sessionsPerMonth) : undefined,
          schedule: formData.schedule.trim() || undefined,
          location: formData.location.trim() || undefined,
        };

        await createClass(input);
        toast({
          title: "Berhasil",
          description: `Kelas "${input.name}" berhasil dibuat`,
        });
        setIsAddOpen(false);
        router.refresh();
      } catch (err) {
        toast({
          title: "Gagal membuat kelas",
          description: err instanceof Error ? err.message : "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    if (!formData.name.trim()) {
      toast({
        title: "Validasi gagal",
        description: "Nama kelas wajib diisi",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const partial: UpdateClassInput = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          capacity: formData.capacity ? Number(formData.capacity) : undefined,
          pricePerMonth: formData.pricePerMonth ? formData.pricePerMonth : undefined,
          sessionsPerMonth: formData.sessionsPerMonth ? Number(formData.sessionsPerMonth) : undefined,
          schedule: formData.schedule.trim() || undefined,
          location: formData.location.trim() || undefined,
        };

        await updateClass(editingClass.id, partial);
        toast({
          title: "Berhasil",
          description: `Kelas "${formData.name}" berhasil diperbarui`,
        });
        setIsEditOpen(false);
        setEditingClass(null);
        router.refresh();
      } catch (err) {
        toast({
          title: "Gagal memperbarui kelas",
          description: err instanceof Error ? err.message : "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  };

  const handleToggleActive = (cls: ClassRecord) => {
    const nextStatus = !cls.isActive;
    startTransition(async () => {
      try {
        await toggleClassActive(cls.id, nextStatus);
        toast({
          title: "Status diperbarui",
          description: `Kelas "${cls.name}" kini ${nextStatus ? "aktif" : "nonaktif"}`,
        });
        router.refresh();
      } catch (err) {
        toast({
          title: "Gagal mengubah status",
          description: err instanceof Error ? err.message : "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <DashboardLayout
      title="Kelola Kelas"
      subtitle="Manajemen data kelas, jadwal, kapasitas, dan biaya bulanan"
    >
      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalClasses}</p>
                <p className="text-xs text-muted-foreground">Total Kelas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Power className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeClasses}</p>
                <p className="text-xs text-muted-foreground">Kelas Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCapacity}</p>
                <p className="text-xs text-muted-foreground">Total Kapasitas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari kelas, deskripsi, atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kelas
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => (
          <Card
            key={cls.id}
            className={`overflow-hidden transition-shadow hover:shadow-md ${
              !cls.isActive ? "opacity-75 bg-muted/30" : ""
            }`}
          >
            <div
              className={`h-2 ${cls.isActive ? "bg-primary" : "bg-muted-foreground/40"}`}
            />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      cls.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base leading-tight">{cls.name}</CardTitle>
                    <div className="mt-1">
                      <Badge variant={cls.isActive ? "default" : "secondary"} className="text-xs">
                        {cls.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEditDialog(cls)}>
                      <Edit className="w-4 h-4" />
                      Edit Kelas
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer"
                      onClick={() => handleToggleActive(cls)}
                    >
                      <Power className="w-4 h-4" />
                      {cls.isActive ? "Nonaktifkan Kelas" : "Aktifkan Kelas"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              {cls.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{cls.description}</p>
              )}

              {/* Price & Capacity Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <Badge variant="outline" className="font-semibold gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatCurrency(cls.pricePerMonth)}/bulan
                </Badge>
                {cls.capacity !== null && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    Kapasitas: {cls.capacity} siswa
                  </Badge>
                )}
              </div>

              {/* Schedule & Location & Sessions */}
              <div className="space-y-2 pt-2 border-t text-xs text-muted-foreground">
                {cls.schedule && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{cls.schedule}</span>
                  </div>
                )}
                {cls.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{cls.location}</span>
                  </div>
                )}
                {cls.sessionsPerMonth !== null && cls.sessionsPerMonth !== undefined && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                    <span>{cls.sessionsPerMonth} sesi / bulan</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            {searchQuery ? "Tidak ada kelas yang cocok" : "Belum ada data kelas"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? "Coba ubah kata kunci pencarian"
              : "Klik tombol 'Tambah Kelas' untuk membuat kelas pertama"}
          </p>
        </div>
      )}

      {/* Dialog Create */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Tambah Kelas Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail kelas baru di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">
                  Nama Kelas <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-name"
                  placeholder="Contoh: Kelas Bunga Matahari"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-desc">Deskripsi</Label>
                <Textarea
                  id="create-desc"
                  placeholder="Deskripsi singkat kegiatan dan tujuan kelas"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-capacity">Kapasitas (siswa)</Label>
                  <Input
                    id="create-capacity"
                    type="number"
                    min="1"
                    placeholder="Contoh: 15"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-sessions">Sesi / Bulan</Label>
                  <Input
                    id="create-sessions"
                    type="number"
                    min="1"
                    placeholder="Contoh: 12"
                    value={formData.sessionsPerMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, sessionsPerMonth: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-price">Biaya per Bulan (Rp)</Label>
                  <Input
                    id="create-price"
                    type="number"
                    placeholder="Contoh: 2500000"
                    value={formData.pricePerMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerMonth: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-location">Lokasi / Ruangan</Label>
                  <Input
                    id="create-location"
                    placeholder="Contoh: Ruang A1"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-schedule">Jadwal</Label>
                <Input
                  id="create-schedule"
                  placeholder="Contoh: Senin - Jumat, 08:00 - 12:00"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Kelas
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Kelas</DialogTitle>
              <DialogDescription>
                Perbarui detail kelas yang dipilih.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Nama Kelas <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  placeholder="Contoh: Kelas Bunga Matahari"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Deskripsi</Label>
                <Textarea
                  id="edit-desc"
                  placeholder="Deskripsi singkat kelas"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Kapasitas (siswa)</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    min="1"
                    placeholder="Contoh: 15"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sessions">Sesi / Bulan</Label>
                  <Input
                    id="edit-sessions"
                    type="number"
                    min="1"
                    placeholder="Contoh: 12"
                    value={formData.sessionsPerMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, sessionsPerMonth: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Biaya per Bulan (Rp)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    placeholder="Contoh: 2500000"
                    value={formData.pricePerMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerMonth: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Lokasi / Ruangan</Label>
                  <Input
                    id="edit-location"
                    placeholder="Contoh: Ruang A1"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-schedule">Jadwal</Label>
                <Input
                  id="edit-schedule"
                  placeholder="Contoh: Senin - Jumat, 08:00 - 12:00"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingClass(null);
                }}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
