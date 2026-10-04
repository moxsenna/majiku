import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Plus,
  Search,
  Users,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  MapPin,
  DollarSign,
  Calculator,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface ClassData {
  id: string;
  name: string;
  description: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar?: string;
  studentsCount: number;
  capacity: number;
  color: string;
  schedule: string;
  location: string;
  ageRange: string;
  // Pricing & Cost
  price: number;
  tutorFee: number;
  operationalCost: number;
  tutorBonusPercent: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const initialClasses: ClassData[] = [
  {
    id: "1",
    name: "Kelas Bunga Matahari",
    description: "Kelas untuk anak usia 3-4 tahun dengan fokus pengembangan motorik",
    tutorId: "1",
    tutorName: "Ibu Sarah",
    tutorAvatar: "",
    studentsCount: 15,
    capacity: 18,
    color: "#f59e0b",
    schedule: "Senin - Jumat, 08:00 - 12:00",
    location: "Ruang A1",
    ageRange: "3-4 tahun",
    price: 2500000,
    tutorFee: 800000,
    operationalCost: 500000,
    tutorBonusPercent: 10,
  },
  {
    id: "2",
    name: "Kelas Pelangi",
    description: "Kelas kreatif dengan aktivitas seni dan musik",
    tutorId: "2",
    tutorName: "Ibu Maya",
    tutorAvatar: "",
    studentsCount: 12,
    capacity: 15,
    color: "#3b82f6",
    schedule: "Senin - Jumat, 08:00 - 12:00",
    location: "Ruang A2",
    ageRange: "4-5 tahun",
    price: 2800000,
    tutorFee: 900000,
    operationalCost: 600000,
    tutorBonusPercent: 10,
  },
  {
    id: "3",
    name: "Kelas Bintang",
    description: "Kelas persiapan masuk SD dengan fokus baca tulis",
    tutorId: "3",
    tutorName: "Ibu Dina",
    tutorAvatar: "",
    studentsCount: 10,
    capacity: 12,
    color: "#8b5cf6",
    schedule: "Senin - Jumat, 13:00 - 17:00",
    location: "Ruang B1",
    ageRange: "5-6 tahun",
    price: 3000000,
    tutorFee: 1000000,
    operationalCost: 700000,
    tutorBonusPercent: 12,
  },
  {
    id: "4",
    name: "Kelas Mentari",
    description: "Kelas playgroup untuk anak usia dini",
    tutorId: "4",
    tutorName: "Pak Ahmad",
    tutorAvatar: "",
    studentsCount: 14,
    capacity: 14,
    color: "#ef4444",
    schedule: "Senin - Jumat, 08:00 - 11:00",
    location: "Ruang C1",
    ageRange: "2-3 tahun",
    price: 2200000,
    tutorFee: 700000,
    operationalCost: 450000,
    tutorBonusPercent: 8,
  },
];

const tutorOptions = [
  { id: "1", name: "Ibu Sarah" },
  { id: "2", name: "Ibu Maya" },
  { id: "3", name: "Ibu Dina" },
  { id: "4", name: "Pak Ahmad" },
  { id: "5", name: "Ibu Rina" },
];

export default function Classes() {
  const [classes, setClasses] = useState<ClassData[]>(initialClasses);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassData | null>(null);
  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    tutorId: "",
    capacity: "",
    location: "",
    ageRange: "",
    schedule: "",
    color: "#f59e0b",
    price: "",
    tutorFee: "",
    operationalCost: "",
    tutorBonusPercent: "",
  });

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.tutorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStudents = classes.reduce((acc, cls) => acc + cls.studentsCount, 0);
  const totalCapacity = classes.reduce((acc, cls) => acc + cls.capacity, 0);
  const totalRevenue = classes.reduce((acc, cls) => acc + (cls.price * cls.studentsCount), 0);
  const totalProfit = classes.reduce((acc, cls) => {
    const revenue = cls.price * cls.studentsCount;
    const tutorBonus = (revenue * cls.tutorBonusPercent) / 100;
    return acc + (revenue - cls.tutorFee - cls.operationalCost - tutorBonus);
  }, 0);

  const calculateClassProfit = (cls: ClassData) => {
    const revenue = cls.price * cls.studentsCount;
    const tutorBonus = (revenue * cls.tutorBonusPercent) / 100;
    const totalCost = cls.tutorFee + cls.operationalCost + tutorBonus;
    return revenue - totalCost;
  };

  const handleAddClass = () => {
    const tutor = tutorOptions.find((t) => t.id === newClass.tutorId);
    const newClassData: ClassData = {
      id: String(classes.length + 1),
      name: newClass.name,
      description: newClass.description,
      tutorId: newClass.tutorId,
      tutorName: tutor?.name || "",
      studentsCount: 0,
      capacity: parseInt(newClass.capacity) || 15,
      color: newClass.color,
      schedule: newClass.schedule,
      location: newClass.location,
      ageRange: newClass.ageRange,
      price: parseInt(newClass.price) || 0,
      tutorFee: parseInt(newClass.tutorFee) || 0,
      operationalCost: parseInt(newClass.operationalCost) || 0,
      tutorBonusPercent: parseInt(newClass.tutorBonusPercent) || 0,
    };
    setClasses([...classes, newClassData]);
    setIsAddDialogOpen(false);
    setNewClass({
      name: "",
      description: "",
      tutorId: "",
      capacity: "",
      location: "",
      ageRange: "",
      schedule: "",
      color: "#f59e0b",
      price: "",
      tutorFee: "",
      operationalCost: "",
      tutorBonusPercent: "",
    });
  };

  const handleDeleteClass = (id: string) => {
    setClasses(classes.filter((cls) => cls.id !== id));
  };

  return (
    <DashboardLayout
      title="Kelola Kelas"
      subtitle="Manajemen kelas, harga, dan perhitungan modal"
    >
      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-xs text-muted-foreground">Total Kelas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Siswa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Total Pendapatan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(totalProfit)}</p>
                <p className="text-xs text-muted-foreground">Total Profit</p>
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
            placeholder="Cari kelas atau tutor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Kelas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Kelas Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label>Nama Kelas</Label>
                <Input
                  placeholder="Contoh: Kelas Ceria"
                  value={newClass.name}
                  onChange={(e) =>
                    setNewClass({ ...newClass, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input
                  placeholder="Deskripsi singkat kelas"
                  value={newClass.description}
                  onChange={(e) =>
                    setNewClass({ ...newClass, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tutor</Label>
                  <Select
                    value={newClass.tutorId}
                    onValueChange={(value) =>
                      setNewClass({ ...newClass, tutorId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tutor" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {tutorOptions.map((tutor) => (
                        <SelectItem key={tutor.id} value={tutor.id}>
                          {tutor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Kapasitas</Label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={newClass.capacity}
                    onChange={(e) =>
                      setNewClass({ ...newClass, capacity: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Input
                    placeholder="Ruang A1"
                    value={newClass.location}
                    onChange={(e) =>
                      setNewClass({ ...newClass, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rentang Usia</Label>
                  <Input
                    placeholder="3-4 tahun"
                    value={newClass.ageRange}
                    onChange={(e) =>
                      setNewClass({ ...newClass, ageRange: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jadwal</Label>
                <Input
                  placeholder="Senin - Jumat, 08:00 - 12:00"
                  value={newClass.schedule}
                  onChange={(e) =>
                    setNewClass({ ...newClass, schedule: e.target.value })
                  }
                />
              </div>

              <Separator />

              {/* Pricing Section */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Harga & Komponen Biaya
                </h4>
                
                <div className="space-y-2">
                  <Label>Harga per Bulan (Rp)</Label>
                  <Input
                    type="number"
                    placeholder="2500000"
                    value={newClass.price}
                    onChange={(e) =>
                      setNewClass({ ...newClass, price: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fee Guru (Rp/bulan)</Label>
                    <Input
                      type="number"
                      placeholder="800000"
                      value={newClass.tutorFee}
                      onChange={(e) =>
                        setNewClass({ ...newClass, tutorFee: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Biaya Operasional (Rp)</Label>
                    <Input
                      type="number"
                      placeholder="500000"
                      value={newClass.operationalCost}
                      onChange={(e) =>
                        setNewClass({ ...newClass, operationalCost: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bonus Guru (%)</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={newClass.tutorBonusPercent}
                    onChange={(e) =>
                      setNewClass({ ...newClass, tutorBonusPercent: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Persentase dari total pendapatan kelas untuk bonus guru
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Warna Kelas</Label>
                <div className="flex gap-2">
                  {["#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#10b981", "#ec4899"].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          newClass.color === color
                            ? "border-foreground scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewClass({ ...newClass, color })}
                      />
                    )
                  )}
                </div>
              </div>
              <Button className="w-full" onClick={handleAddClass}>
                Simpan Kelas
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => (
          <Card
            key={cls.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedClassDetail(cls)}
          >
            <div
              className="h-2"
              style={{ backgroundColor: cls.color }}
            />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cls.color}20` }}
                  >
                    <GraduationCap
                      className="w-6 h-6"
                      style={{ color: cls.color }}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base">{cls.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {cls.ageRange}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                    <DropdownMenuItem className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Kelas
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(cls.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus Kelas
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {cls.description}
              </p>

              {/* Price Badge */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-semibold">
                  {formatCurrency(cls.price)}/bulan
                </Badge>
                <Badge variant={calculateClassProfit(cls) > 0 ? "success" : "destructive"} className="text-xs">
                  Profit: {formatCurrency(calculateClassProfit(cls))}
                </Badge>
              </div>

              {/* Tutor */}
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={cls.tutorAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {cls.tutorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{cls.tutorName}</p>
                  <p className="text-xs text-muted-foreground">Tutor</p>
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Kapasitas</span>
                  <span className="font-medium">
                    {cls.studentsCount}/{cls.capacity} siswa
                  </span>
                </div>
                <Progress
                  value={(cls.studentsCount / cls.capacity) * 100}
                  className="h-2"
                />
                {cls.studentsCount >= cls.capacity && (
                  <Badge variant="destructive" className="text-xs">
                    Kelas Penuh
                  </Badge>
                )}
              </div>

              {/* Schedule & Location */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{cls.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            Tidak ada kelas ditemukan
          </h3>
          <p className="text-sm text-muted-foreground">
            Coba ubah kata kunci pencarian atau tambah kelas baru
          </p>
        </div>
      )}

      {/* Class Detail Modal */}
      <Dialog open={!!selectedClassDetail} onOpenChange={() => setSelectedClassDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Detail Perhitungan Modal - {selectedClassDetail?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedClassDetail && (
            <div className="space-y-4 py-4">
              {/* Revenue */}
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <span className="font-medium">Total Pendapatan</span>
                    </div>
                    <span className="text-xl font-bold text-success">
                      {formatCurrency(selectedClassDetail.price * selectedClassDetail.studentsCount)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(selectedClassDetail.price)} × {selectedClassDetail.studentsCount} siswa
                  </p>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Rincian Biaya
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Fee Guru (Gaji Pokok)</span>
                    <span className="font-medium text-destructive">
                      -{formatCurrency(selectedClassDetail.tutorFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Biaya Operasional</span>
                    <span className="font-medium text-destructive">
                      -{formatCurrency(selectedClassDetail.operationalCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <span className="text-sm text-muted-foreground">Bonus Guru ({selectedClassDetail.tutorBonusPercent}%)</span>
                      <p className="text-xs text-muted-foreground">
                        {selectedClassDetail.tutorBonusPercent}% × {formatCurrency(selectedClassDetail.price * selectedClassDetail.studentsCount)}
                      </p>
                    </div>
                    <span className="font-medium text-destructive">
                      -{formatCurrency((selectedClassDetail.price * selectedClassDetail.studentsCount * selectedClassDetail.tutorBonusPercent) / 100)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-semibold">Total Biaya</span>
                    <span className="font-bold text-destructive">
                      -{formatCurrency(
                        selectedClassDetail.tutorFee + 
                        selectedClassDetail.operationalCost + 
                        (selectedClassDetail.price * selectedClassDetail.studentsCount * selectedClassDetail.tutorBonusPercent) / 100
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Net Profit */}
              <Card className={calculateClassProfit(selectedClassDetail) > 0 ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      <span className="font-semibold">Profit Bersih</span>
                    </div>
                    <span className={`text-2xl font-bold ${calculateClassProfit(selectedClassDetail) > 0 ? "text-success" : "text-destructive"}`}>
                      {formatCurrency(calculateClassProfit(selectedClassDetail))}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Tutor Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Penghasilan Tutor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedClassDetail.tutorName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{selectedClassDetail.tutorName}</p>
                      <p className="text-sm text-muted-foreground">
                        Gaji: {formatCurrency(selectedClassDetail.tutorFee)} + Bonus: {formatCurrency((selectedClassDetail.price * selectedClassDetail.studentsCount * selectedClassDetail.tutorBonusPercent) / 100)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(
                          selectedClassDetail.tutorFee + 
                          (selectedClassDetail.price * selectedClassDetail.studentsCount * selectedClassDetail.tutorBonusPercent) / 100
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">Total/bulan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
