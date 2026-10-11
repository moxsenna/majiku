"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MoreVertical,
  Cake,
  Users,
  GraduationCap,
  Edit,
  Power,
  UserCheck,
  UserX,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createStudent,
  updateStudent,
  toggleStudentActive,
  linkStudentParent,
  type StudentRecord,
  type StudentWithEnrollments,
  type CreateStudentInput,
  type UpdateStudentInput,
} from "@/server/actions/studentsCrud";
import { moveStudentClass } from "@/server/actions/enrollments";
import type { ClassRecord } from "@/server/actions/classesCrud";

interface StudentsProps {
  initialData: StudentWithEnrollments[];
  availableClasses: ClassRecord[];
  linkableParents?: Array<{ id: string; name: string; email: string }>;
}

function calculateAge(dobStr: string | null | undefined): number | null {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default function Students({ initialData, availableClasses, linkableParents = [] }: StudentsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [dataList, setDataList] = useState<StudentWithEnrollments[]>(initialData);
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [editingStudentOldClassId, setEditingStudentOldClassId] = useState<string>("none");

  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkingStudent, setLinkingStudent] = useState<StudentRecord | null>(null);
  const [selectedParentUserId, setSelectedParentUserId] = useState<string>("none");

  const [createForm, setCreateForm] = useState({
    name: "",
    dateOfBirth: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    classId: "",
    sessionsQuota: "12",
    billingDay: "1",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    dateOfBirth: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    classId: "none",
  });

  useEffect(() => {
    setDataList(initialData);
  }, [initialData]);

  useEffect(() => {
    if (qParam) {
      setSearchQuery(qParam);
    }
  }, [qParam]);

  const filteredData = dataList.filter(({ student, enrollments }) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      student.name.toLowerCase().includes(q) ||
      (student.parentName && student.parentName.toLowerCase().includes(q)) ||
      (student.parentPhone && student.parentPhone.includes(q)) ||
      (student.parentEmail && student.parentEmail.toLowerCase().includes(q));

    const matchesClass =
      selectedClassFilter === "all" ||
      enrollments.some((e) => e.classId === selectedClassFilter);

    return matchesSearch && matchesClass;
  });

  const totalStudents = dataList.length;
  const activeStudents = dataList.filter((d) => d.student.isActive).length;
  const enrolledStudents = dataList.filter((d) => d.enrollments.length > 0).length;
  const unenrolledStudents = dataList.filter((d) => d.enrollments.length === 0).length;

  const openAddDialog = () => {
    setCreateForm({
      name: "",
      dateOfBirth: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      classId: "",
      sessionsQuota: "12",
      billingDay: "1",
    });
    setIsAddOpen(true);
  };

  const openEditDialog = (student: StudentRecord) => {
    const entry = dataList.find((d) => d.student.id === student.id);
    const existingClassId = entry?.enrollments[0]?.classId || "none";
    setEditingStudent(student);
    setEditingStudentOldClassId(existingClassId);
    setEditForm({
      name: student.name || "",
      dateOfBirth: student.dateOfBirth ? String(student.dateOfBirth).slice(0, 10) : "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      parentEmail: student.parentEmail || "",
      classId: existingClassId,
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast({
        title: "Validasi gagal",
        description: "Nama siswa wajib diisi",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const input: CreateStudentInput = {
          name: createForm.name.trim(),
          dateOfBirth: createForm.dateOfBirth.trim() || undefined,
          parentName: createForm.parentName.trim() || undefined,
          parentPhone: createForm.parentPhone.trim() || undefined,
          parentEmail: createForm.parentEmail.trim() || undefined,
          classId: createForm.classId && createForm.classId !== "none" ? createForm.classId : undefined,
          sessionsQuota:
            createForm.classId && createForm.classId !== "none" && createForm.sessionsQuota
              ? Number(createForm.sessionsQuota)
              : undefined,
          billingDay:
            createForm.classId && createForm.classId !== "none" && createForm.billingDay
              ? Number(createForm.billingDay)
              : undefined,
        };

        await createStudent(input);
        toast({
          title: "Berhasil",
          description: `Siswa "${input.name}" berhasil ditambahkan`,
        });
        setIsAddOpen(false);
        router.refresh();
      } catch (err) {
        toast({
          title: "Gagal menambahkan siswa",
          description: err instanceof Error ? err.message : "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (!editForm.name.trim()) {
      toast({
        title: "Validasi gagal",
        description: "Nama siswa wajib diisi",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const partial: UpdateStudentInput = {
          name: editForm.name.trim(),
          dateOfBirth: editForm.dateOfBirth.trim() || null,
          parentName: editForm.parentName.trim(),
          parentPhone: editForm.parentPhone.trim(),
          parentEmail: editForm.parentEmail.trim(),
        };

        await updateStudent(editingStudent.id, partial);

        if (editForm.classId && editForm.classId !== "none" && editForm.classId !== editingStudentOldClassId) {
          await moveStudentClass({
            studentId: editingStudent.id,
            fromClassId: editingStudentOldClassId !== "none" ? editingStudentOldClassId : null,
            toClassId: editForm.classId,
          });
        }

        toast({
          title: "Berhasil",
          description: `Data siswa "${editForm.name}" berhasil diperbarui`,
        });
        setIsEditOpen(false);
        setEditingStudent(null);
        router.refresh();
      } catch (err) {
        toast({
          title: "Gagal memperbarui siswa",
          description: err instanceof Error ? err.message : "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  };

  const handleToggleActive = (student: StudentRecord) => {
    const nextStatus = !student.isActive;
    startTransition(async () => {
      try {
        await toggleStudentActive(student.id, nextStatus);
        toast({
          title: "Status diperbarui",
          description: `Siswa "${student.name}" kini ${nextStatus ? "aktif" : "nonaktif"}`,
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

  const openLinkParentDialog = (student: StudentRecord) => {
    setLinkingStudent(student);
    setSelectedParentUserId(student.parentUserId || "none");
    setIsLinkOpen(true);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingStudent) return;
    startTransition(async () => {
      try {
        const targetUserId = selectedParentUserId !== "none" ? selectedParentUserId : null;
        await linkStudentParent(linkingStudent.id, targetUserId);
        toast({
          title: "Tautan Berhasil ✓",
          description: targetUserId
            ? `Siswa "${linkingStudent.name}" berhasil ditautkan ke akun orang tua.`
            : `Tautan akun orang tua untuk "${linkingStudent.name}" telah dilepas.`,
        });
        setIsLinkOpen(false);
        setLinkingStudent(null);
        router.refresh();
      } catch (err) {
        toast({
          title: "Gagal Menautkan Akun",
          description: err instanceof Error ? err.message : "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <DashboardLayout
      title="Siswa & Enrollment"
      subtitle="Kelola data lengkap siswa, pendaftaran kelas, kuota sesi, dan kontak orang tua"
    >
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari siswa atau orang tua..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="all">Semua Kelas</SelectItem>
              {availableClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Siswa
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
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
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeStudents}</p>
                <p className="text-xs text-muted-foreground">Siswa Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrolledStudents}</p>
                <p className="text-xs text-muted-foreground">Terdaftar Kelas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <UserX className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unenrolledStudents}</p>
                <p className="text-xs text-muted-foreground">Belum Masuk Kelas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map(({ student, enrollments }) => {
          const age = calculateAge(student.dateOfBirth);

          return (
            <Card
              key={student.id}
              className={`overflow-hidden transition-shadow hover:shadow-md ${
                !student.isActive ? "opacity-75 bg-muted/30" : ""
              }`}
            >
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.photoUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {student.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold leading-tight">{student.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge
                          variant={student.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {student.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                        {age !== null && (
                          <Badge variant="outline" className="text-xs">
                            {age} tahun
                          </Badge>
                        )}
                        {student.parentUserId ? (
                          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300 bg-emerald-50/50">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Akun Ortu Terhubung
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">
                            <UserX className="w-3 h-3 mr-1" />
                            Belum Terhubung
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => openLinkParentDialog(student)}
                      >
                        <UserCheck className="h-4 w-4" />
                        Tautkan Akun Ortu
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => openEditDialog(student)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit Data Siswa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => handleToggleActive(student)}
                      >
                        <Power className="h-4 w-4" />
                        {student.isActive ? "Nonaktifkan Siswa" : "Aktifkan Siswa"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Detail Info */}
                <div className="space-y-2 mb-4 text-xs">
                  {student.dateOfBirth && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Cake className="h-3.5 w-3.5 shrink-0" />
                      <span>Lahir: {formatDate(student.dateOfBirth)}</span>
                    </div>
                  )}
                  {student.parentName && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>Orang Tua: {student.parentName}</span>
                    </div>
                  )}
                  {student.parentPhone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{student.parentPhone}</span>
                    </div>
                  )}
                  {student.parentEmail && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{student.parentEmail}</span>
                    </div>
                  )}
                </div>

                {/* Enrollments Section */}
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      Kelas & Kuota Sesi
                    </span>
                  </div>
                  {enrollments.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Belum terdaftar di kelas manapun
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {enrollments.map((enr) => (
                        <div
                          key={enr.enrollmentId}
                          className="flex items-center justify-between text-xs bg-muted/50 px-2.5 py-1.5 rounded-md"
                        >
                          <span className="font-medium truncate mr-2">
                            {enr.className || "Kelas Tanpa Nama"}
                          </span>
                          <span className="text-muted-foreground shrink-0">
                            {enr.sessionsUsed ?? 0} / {enr.sessionsQuota ?? "∞"} sesi
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            {searchQuery || selectedClassFilter !== "all"
              ? "Tidak ada siswa yang cocok"
              : "Belum ada data siswa"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery || selectedClassFilter !== "all"
              ? "Coba ubah filter atau kata kunci pencarian"
              : "Klik tombol 'Tambah Siswa' untuk menambahkan murid baru"}
          </p>
        </div>
      )}

      {/* Dialog Create */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Tambah Siswa Baru</DialogTitle>
              <DialogDescription>
                Lengkapi identitas siswa dan enrollment kelas awal (opsional).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-student-name">
                  Nama Lengkap Siswa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-student-name"
                  placeholder="Contoh: Aisyah Putri"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-dob">Tanggal Lahir</Label>
                <Input
                  id="create-dob"
                  type="date"
                  value={createForm.dateOfBirth}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, dateOfBirth: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-parent-name">Nama Orang Tua / Wali</Label>
                <Input
                  id="create-parent-name"
                  placeholder="Contoh: Ibu Sari Putri"
                  value={createForm.parentName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, parentName: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-parent-phone">No. Telepon Orang Tua</Label>
                  <Input
                    id="create-parent-phone"
                    placeholder="Contoh: 08123456789"
                    value={createForm.parentPhone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, parentPhone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-parent-email">Email Orang Tua</Label>
                  <Input
                    id="create-parent-email"
                    type="email"
                    placeholder="Contoh: sari@email.com"
                    value={createForm.parentEmail}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, parentEmail: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-2 border-t space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  Pendaftaran Kelas Awal (Opsional)
                </h4>

                <div className="space-y-2">
                  <Label>Pilih Kelas</Label>
                  <Select
                    value={createForm.classId}
                    onValueChange={(val) =>
                      setCreateForm({ ...createForm, classId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas (opsional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="none">-- Tanpa Kelas --</SelectItem>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {createForm.classId && createForm.classId !== "none" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-quota">Kuota Sesi</Label>
                      <Input
                        id="create-quota"
                        type="number"
                        min="1"
                        placeholder="Contoh: 12"
                        value={createForm.sessionsQuota}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, sessionsQuota: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-billing-day">Tanggal Tagihan (1-31)</Label>
                      <Input
                        id="create-billing-day"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Contoh: 1"
                        value={createForm.billingDay}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, billingDay: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
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
                Simpan Siswa
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
              <DialogTitle>Edit Data Siswa</DialogTitle>
              <DialogDescription>
                Perbarui identitas dan data kontak orang tua.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-student-name">
                  Nama Lengkap Siswa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-student-name"
                  placeholder="Contoh: Aisyah Putri"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dob">Tanggal Lahir</Label>
                <Input
                  id="edit-dob"
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dateOfBirth: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-parent-name">Nama Orang Tua / Wali</Label>
                <Input
                  id="edit-parent-name"
                  placeholder="Contoh: Ibu Sari Putri"
                  value={editForm.parentName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, parentName: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-parent-phone">No. Telepon Orang Tua</Label>
                  <Input
                    id="edit-parent-phone"
                    placeholder="Contoh: 08123456789"
                    value={editForm.parentPhone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, parentPhone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-parent-email">Email Orang Tua</Label>
                  <Input
                    id="edit-parent-email"
                    type="email"
                    placeholder="Contoh: sari@email.com"
                    value={editForm.parentEmail}
                    onChange={(e) =>
                      setEditForm({ ...editForm, parentEmail: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="edit-student-class">Pindah / Tetapkan Kelas</Label>
                <Select
                  value={editForm.classId}
                  onValueChange={(val) =>
                    setEditForm({ ...editForm, classId: val })
                  }
                >
                  <SelectTrigger id="edit-student-class">
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="none">-- Tanpa Kelas --</SelectItem>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Mengubah kelas akan memindahkan pendaftaran aktif siswa ke kelas baru.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingStudent(null);
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

      {/* Dialog Tautkan Akun Ortu */}
      <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleLinkSubmit}>
            <DialogHeader>
              <DialogTitle>Tautkan Akun Orang Tua</DialogTitle>
              <DialogDescription>
                Pilih akun orang tua yang terdaftar untuk siswa &ldquo;{linkingStudent?.name}&rdquo; agar dapat memantau laporan dan tagihan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="link-parent-user">Pilih Akun Orang Tua</Label>
                <Select
                  value={selectedParentUserId}
                  onValueChange={setSelectedParentUserId}
                >
                  <SelectTrigger id="link-parent-user">
                    <SelectValue placeholder="Pilih akun ortu terdaftar" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="none">-- Jangan tautkan akun (Lepas tautan) --</SelectItem>
                    {linkableParents.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name || p.email} ({p.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {linkableParents.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Belum ada akun orang tua yang mendaftar. Orang tua dapat mendaftar mandiri via portal ortu dengan email yang sama.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsLinkOpen(false);
                  setLinkingStudent(null);
                }}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Tautan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
