"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Search,
  Edit,
  Power,
  MoreVertical,
  Phone,
  Mail,
  GraduationCap,
  DollarSign,
  UserCheck,
  UserX,
  Loader2,
  BookOpen,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createTutor,
  updateTutor,
  toggleTutorActive,
  linkTutorUser,
  unlinkTutorUser,
  type TutorRecord,
  type TutorWithAssignments,
  type CreateTutorInput,
  type UpdateTutorInput,
  type LinkableUser,
} from "@/server/actions/tutorsCrud";

interface TutorsProps {
  initialData: TutorWithAssignments[];
  linkableUsers?: LinkableUser[];
}

const formatCurrency = (amount: number | string | null | undefined) => {
  if (!amount) return "Rp 0";
  const num = typeof amount === "number" ? amount : Number(amount) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

export default function Tutors({ initialData, linkableUsers = [] }: TutorsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [tutorList, setTutorList] = useState<TutorWithAssignments[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<TutorRecord | null>(null);

  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkingTutor, setLinkingTutor] = useState<TutorRecord | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    setTutorList(initialData);
  }, [initialData]);

  const filteredTutors = tutorList.filter(({ tutor, assignments }) => {
    const q = searchQuery.toLowerCase();
    const matchesBasic =
      tutor.name.toLowerCase().includes(q) ||
      (tutor.email && tutor.email.toLowerCase().includes(q)) ||
      (tutor.phone && tutor.phone.includes(q));

    const matchesAssignment = assignments.some(
      (a) => a.className && a.className.toLowerCase().includes(q)
    );

    return matchesBasic || matchesAssignment;
  });

  const totalTutors = tutorList.length;
  const activeTutors = tutorList.filter((t) => t.tutor.isActive).length;
  const assignedTutors = tutorList.filter((t) => t.assignments.length > 0).length;
  const unassignedTutors = tutorList.filter((t) => t.assignments.length === 0).length;

  const openAddDialog = () => {
    setCreateForm({ name: "", email: "", phone: "" });
    setIsAddOpen(true);
  };

  const openEditDialog = (tutor: TutorRecord) => {
    setEditingTutor(tutor);
    setEditForm({
      name: tutor.name || "",
      email: tutor.email || "",
      phone: tutor.phone || "",
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast({
        title: "Validasi gagal",
        description: "Nama tutor wajib diisi",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const input: CreateTutorInput = {
          name: createForm.name.trim(),
          email: createForm.email.trim() || undefined,
          phone: createForm.phone.trim() || undefined,
        };

        await createTutor(input);
        toast({
          title: "Berhasil",
          description: `Tutor "${input.name}" berhasil ditambahkan`,
        });
        setIsAddOpen(false);
        router.refresh();
      } catch (err) {
        toast({
          title: "Gagal menambahkan tutor",
          description: err instanceof Error ? err.message : "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTutor) return;

    if (!editForm.name.trim()) {
      toast({
        title: "Validasi gagal",
        description: "Nama tutor wajib diisi",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const partial: UpdateTutorInput = {
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
        };

        await updateTutor(editingTutor.id, partial);
        toast({
          title: "Berhasil",
          description: `Data tutor "${editForm.name}" berhasil diperbarui`,
        });
        setIsEditOpen(false);
        setEditingTutor(null);
        router.refresh();
      } catch (err) {
        toast({
          title: "Gagal memperbarui tutor",
          description: err instanceof Error ? err.message : "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  };

  const handleToggleActive = (tutor: TutorRecord) => {
    const nextStatus = !tutor.isActive;
    startTransition(async () => {
      try {
        await toggleTutorActive(tutor.id, nextStatus);
        toast({
          title: "Status diperbarui",
          description: `Tutor "${tutor.name}" kini ${nextStatus ? "aktif" : "nonaktif"}`,
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

  const openLinkDialog = (tutor: TutorRecord) => {
    setLinkingTutor(tutor);
    setSelectedUserId(tutor.userId || "");
    setIsLinkOpen(true);
  };

  const handleLinkSubmit = () => {
    if (!linkingTutor || !selectedUserId) return;

    startTransition(async () => {
      try {
        await linkTutorUser(linkingTutor.id, selectedUserId);
        toast({
          title: "Akun berhasil ditautkan",
          description: `Akun berhasil ditautkan ke tutor "${linkingTutor.name}"`,
        });
        setIsLinkOpen(false);
        setLinkingTutor(null);
        setSelectedUserId("");
        router.refresh();
      } catch (err) {
        toast({
          title: "Gagal menautkan akun",
          description: err instanceof Error ? err.message : "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  };

  const handleUnlinkAccount = (tutor: TutorRecord) => {
    startTransition(async () => {
      try {
        await unlinkTutorUser(tutor.id);
        toast({
          title: "Tautan akun dilepas",
          description: `Tautan akun untuk tutor "${tutor.name}" berhasil dilepas`,
        });
        router.refresh();
      } catch (err) {
        toast({
          title: "Gagal melepas tautan",
          description: err instanceof Error ? err.message : "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <DashboardLayout
      title="Kelola Tutor"
      subtitle="Manajemen data pengajar, penugasan kelas, dan rate per sesi"
    >
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari tutor, email, no. telp, atau kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Tutor
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
                <p className="text-2xl font-bold">{totalTutors}</p>
                <p className="text-xs text-muted-foreground">Total Tutor</p>
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
                <p className="text-2xl font-bold">{activeTutors}</p>
                <p className="text-xs text-muted-foreground">Tutor Aktif</p>
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
                <p className="text-2xl font-bold">{assignedTutors}</p>
                <p className="text-xs text-muted-foreground">Mengampu Kelas</p>
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
                <p className="text-2xl font-bold">{unassignedTutors}</p>
                <p className="text-xs text-muted-foreground">Belum Ditugaskan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTutors.map(({ tutor, assignments }) => {
          const linkedAccount = tutor.userId
            ? linkableUsers.find((u) => u.id === tutor.userId)
            : null;
          const linkedEmail = linkedAccount?.email || tutor.userId;

          return (
            <Card
              key={tutor.id}
              className={`overflow-hidden transition-shadow hover:shadow-md ${
                !tutor.isActive ? "opacity-75 bg-muted/30" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tutor.photoUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {tutor.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "TU"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base leading-tight">{tutor.name}</CardTitle>
                      <div className="mt-1">
                        <Badge
                          variant={tutor.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {tutor.isActive ? "Aktif" : "Nonaktif"}
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
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => openEditDialog(tutor)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Data Tutor
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => handleToggleActive(tutor)}
                      >
                        <Power className="w-4 h-4" />
                        {tutor.isActive ? "Nonaktifkan Tutor" : "Aktifkan Tutor"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                {/* Contact Info */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  {tutor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{tutor.email}</span>
                    </div>
                  )}
                  {tutor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{tutor.phone}</span>
                    </div>
                  )}
                  {!tutor.email && !tutor.phone && (
                    <p className="italic">Belum ada kontak terdaftar</p>
                  )}
                </div>

                {/* Account Linking */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        Akun Sistem
                      </span>
                    </div>
                    {tutor.userId ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleUnlinkAccount(tutor)}
                        disabled={isPending}
                      >
                        Lepas Tautan
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => openLinkDialog(tutor)}
                        disabled={isPending}
                      >
                        Tautkan Akun
                      </Button>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    {tutor.userId ? (
                      <span
                        className="truncate font-mono text-[11px] text-muted-foreground"
                        title={linkedEmail || undefined}
                      >
                        {linkedEmail}
                      </span>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] font-normal py-0 px-1.5">
                        Belum tertaut
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Class Assignments */}
              <div className="pt-3 border-t">
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    Kelas Diampu & Honor
                  </span>
                </div>
                {assignments.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    Belum ditugaskan ke kelas manapun
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {assignments.map((asg) => (
                      <div
                        key={asg.assignmentId}
                        className="flex items-center justify-between text-xs bg-muted/50 px-2.5 py-1.5 rounded-md"
                      >
                        <span className="font-medium truncate mr-2">
                          {asg.className || "Kelas Tanpa Nama"}
                        </span>
                        {asg.ratePerSession ? (
                          <Badge variant="outline" className="text-xs shrink-0 font-normal">
                            {formatCurrency(asg.ratePerSession)} / sesi
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground shrink-0">-</span>
                        )}
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

      {filteredTutors.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            {searchQuery ? "Tidak ada tutor yang cocok" : "Belum ada data tutor"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? "Coba ubah kata kunci pencarian"
              : "Klik tombol 'Tambah Tutor' untuk menambahkan pengajar baru"}
          </p>
        </div>
      )}

      {/* Dialog Create */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Tambah Tutor Baru</DialogTitle>
              <DialogDescription>
                Masukkan data profil tutor baru di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-tutor-name">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-tutor-name"
                  placeholder="Contoh: Ibu Sarah Wijaya"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-tutor-email">Email</Label>
                <Input
                  id="create-tutor-email"
                  type="email"
                  placeholder="Contoh: sarah@majiku.com"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-tutor-phone">No. Telepon / WhatsApp</Label>
                <Input
                  id="create-tutor-phone"
                  placeholder="Contoh: 08123456789"
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, phone: e.target.value })
                  }
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
                Simpan Tutor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Data Tutor</DialogTitle>
              <DialogDescription>
                Perbarui profil pengajar yang dipilih.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tutor-name">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-tutor-name"
                  placeholder="Contoh: Ibu Sarah Wijaya"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tutor-email">Email</Label>
                <Input
                  id="edit-tutor-email"
                  type="email"
                  placeholder="Contoh: sarah@majiku.com"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tutor-phone">No. Telepon / WhatsApp</Label>
                <Input
                  id="edit-tutor-phone"
                  placeholder="Contoh: 08123456789"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingTutor(null);
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

      {/* Dialog Tautkan Akun */}
      <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tautkan Akun</DialogTitle>
            <DialogDescription>
              Pilih akun pengguna BetterAuth untuk ditautkan ke pengajar{" "}
              <span className="font-semibold text-foreground">
                {linkingTutor?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-user-select">Pilih Akun Pengguna</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger id="link-user-select" className="w-full">
                  <SelectValue placeholder="Pilih akun pengguna..." />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50 max-h-60">
                  {linkableUsers.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground text-center">
                      Tidak ada akun pengguna yang tersedia
                    </div>
                  ) : (
                    linkableUsers.map((u) => {
                      const isAlreadyLinked = Boolean(u.linkedTutorName);
                      const label = isAlreadyLinked
                        ? `${u.name} — ${u.email} (tertaut ke ${u.linkedTutorName})`
                        : `${u.name} — ${u.email}`;

                      return (
                        <SelectItem
                          key={u.id}
                          value={u.id}
                          disabled={isAlreadyLinked}
                        >
                          {label}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsLinkOpen(false);
                setLinkingTutor(null);
                setSelectedUserId("");
              }}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleLinkSubmit}
              disabled={isPending || !selectedUserId}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tautkan Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
