"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  Grid,
  List,
  Image as ImageIcon,
  Trash2,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  type GalleryPhotoRow,
  type GalleryOptionItem,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
} from "@/server/actions/gallery";

export interface GalleryProps {
  initialPhotos: GalleryPhotoRow[];
  studentOptions: GalleryOptionItem[];
  classOptions: GalleryOptionItem[];
  canDelete?: boolean;
  canUpload?: boolean;
}

export default function Gallery({
  initialPhotos,
  studentOptions = [],
  classOptions = [],
  canDelete = false,
  canUpload = false,
}: GalleryProps) {
  const router = useRouter();

  // View & Filter states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  // Upload dialog state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
  const [isUploadingR2, setIsUploadingR2] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("none");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhotoRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered photos
  const filteredPhotos = initialPhotos.filter((photo) => {
    if (filterClass !== "all" && photo.classId !== filterClass) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const captionMatch = photo.caption?.toLowerCase().includes(q);
      const studentMatch = photo.studentName?.toLowerCase().includes(q);
      const classMatch = photo.className?.toLowerCase().includes(q);
      const uploaderMatch = photo.uploaderName?.toLowerCase().includes(q);
      if (!captionMatch && !studentMatch && !classMatch && !uploaderMatch) {
        return false;
      }
    }
    return true;
  });

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const fileArray = Array.from(files);

    if (uploadedKeys.length + fileArray.length > 10) {
      toast.error("Maksimal 10 foto per unggahan");
      return;
    }

    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Format file "${file.name}" harus JPG/PNG/WebP`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Ukuran file "${file.name}" melebihi batas 5MB`);
        return;
      }
    }

    setIsUploadingR2(true);
    try {
      const formData = new FormData();
      formData.append("prefix", "gallery");
      for (const file of fileArray) {
        formData.append("files", file);
      }

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah foto");
      }

      if (Array.isArray(data.keys)) {
        setUploadedKeys((prev) => [...prev, ...data.keys]);
        toast.success(`${data.keys.length} foto siap diunggah`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto";
      toast.error(msg);
    } finally {
      setIsUploadingR2(false);
      e.target.value = "";
    }
  };

  const removeUploadedKey = (keyToRemove: string) => {
    setUploadedKeys((prev) => prev.filter((k) => k !== keyToRemove));
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmitUpload = async () => {
    if (uploadedKeys.length === 0) {
      toast.error("Pilih dan unggah minimal 1 foto");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await uploadGalleryPhotos({
        photoKeys: uploadedKeys,
        studentIds: selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
        classId: selectedClassId && selectedClassId !== "none" ? selectedClassId : undefined,
        caption: caption.trim() || undefined,
      });

      toast.success(`Berhasil menambahkan ${res.created} foto ke galeri`);
      setIsUploadOpen(false);
      setUploadedKeys([]);
      setSelectedStudentIds([]);
      setSelectedClassId("none");
      setCaption("");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan foto ke galeri";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteGalleryPhoto(photoToDelete.id);
      toast.success("Foto berhasil dihapus");
      setPhotoToDelete(null);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus foto";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Galeri Foto" subtitle="Foto aktivitas anak-anak di Majiku">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon-sm"
              onClick={() => setViewMode("grid")}
              title="Tampilan Grid"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon-sm"
              onClick={() => setViewMode("list")}
              title="Tampilan List"
            >
              <List className="h-4 w-4" />
            </Button>

            {/* Filter by class */}
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {classOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari keterangan / siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs w-[180px] sm:w-[220px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {canUpload && (
            <Button
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="self-start sm:self-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Foto
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {initialPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <ImageIcon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Belum Ada Foto di Galeri</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Foto kegiatan harian anak-anak akan tampil di sini setelah diunggah oleh staf atau tutor.
          </p>
          {canUpload && (
            <Button onClick={() => setIsUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Unggah Foto Pertama
            </Button>
          )}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
          <p className="text-sm text-muted-foreground">
            Tidak ada foto yang cocok dengan pencarian atau filter yang dipilih.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden group">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={`/api/photos/${photo.photoKey}`}
                  alt={photo.caption || "Foto galeri"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  {photo.className && (
                    <Badge variant="secondary" className="bg-background/85 backdrop-blur-sm text-xs font-medium">
                      {photo.className}
                    </Badge>
                  )}
                  {canDelete && (
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      className="h-7 w-7 bg-red-600/85 hover:bg-red-600 text-white backdrop-blur-sm"
                      onClick={() => setPhotoToDelete(photo)}
                      title="Hapus foto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <CardContent className="p-4">
                <p className="text-sm text-foreground mb-3 line-clamp-2">
                  {photo.caption || "Tanpa keterangan"}
                </p>

                {photo.studentName && (
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6 border border-border">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                        {photo.studentName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-foreground truncate">
                      {photo.studentName}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                  <span className="truncate max-w-[130px]" title={photo.uploaderName || "Staf"}>
                    {photo.uploaderName || "Staf"}
                  </span>
                  <span>
                    {photo.createdAt
                      ? format(new Date(photo.createdAt), "d MMM yyyy, HH:mm", { locale: idLocale })
                      : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3 max-w-4xl">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                <div className="relative w-full sm:w-44 h-44 shrink-0 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={`/api/photos/${photo.photoKey}`}
                    alt={photo.caption || "Foto galeri"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {photo.className && (
                          <Badge variant="secondary">{photo.className}</Badge>
                        )}
                        {photo.studentName && (
                          <Badge variant="outline" className="text-primary border-primary/30">
                            {photo.studentName}
                          </Badge>
                        )}
                      </div>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 h-8 px-2"
                          onClick={() => setPhotoToDelete(photo)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hapus
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-foreground mb-3">{photo.caption || "Tanpa keterangan"}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                    <span>
                      Diunggah oleh <strong className="text-foreground">{photo.uploaderName || "Staf"}</strong>
                    </span>
                    <span>
                      {photo.createdAt
                        ? format(new Date(photo.createdAt), "d MMMM yyyy, HH:mm", { locale: idLocale })
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Unggah Foto Galeri</DialogTitle>
            <DialogDescription>
              Unggah foto aktivitas anak, tentukan kelas dan tag siswa (opsional), serta masukkan keterangan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* File Upload Input & Previews */}
            <div className="space-y-2">
              <Label>Foto Kegiatan (Maks. 10 foto, JPG/PNG/WebP maks. 5MB)</Label>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs font-medium text-foreground">
                  {isUploadingR2 ? "Mengunggah foto..." : "Klik untuk memilih foto"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Bisa pilih beberapa foto sekaligus
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isUploadingR2 || isSubmitting}
                  onChange={handleFilesSelected}
                />
              </label>

              {isUploadingR2 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sedang mengunggah foto ke penyimpanan...</span>
                </div>
              )}

              {uploadedKeys.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-2">
                  {uploadedKeys.map((key) => (
                    <div
                      key={key}
                      className="relative aspect-square rounded-md overflow-hidden border border-border group bg-muted"
                    >
                      <img
                        src={`/api/photos/${key}`}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeUploadedKey(key)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                        title="Hapus foto ini"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
              <Label htmlFor="classSelect">Kelas (Opsional)</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger id="classSelect">
                  <SelectValue placeholder="Pilih Kelas (Opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Tanpa Kelas --</SelectItem>
                  {classOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Student Selection (Multiple, Optional) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tag Siswa (Opsional)</Label>
                {selectedStudentIds.length > 0 && (
                  <span className="text-xs text-primary font-medium">
                    {selectedStudentIds.length} siswa dipilih
                  </span>
                )}
              </div>
              {studentOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">Belum ada data siswa aktif.</p>
              ) : (
                <ScrollArea className="h-36 rounded-md border border-border p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {studentOptions.map((student) => {
                      const checked = selectedStudentIds.includes(student.id);
                      return (
                        <label
                          key={student.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer text-xs"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                          <span className="truncate">{student.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="captionInput">Keterangan / Caption</Label>
              <Textarea
                id="captionInput"
                placeholder="Misal: Kegiatan mewarnai bersama di kelas hari ini..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsUploadOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitUpload}
              disabled={uploadedKeys.length === 0 || isUploadingR2 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Simpan Foto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!photoToDelete}
        onOpenChange={(open) => !open && setPhotoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Foto Galeri?</AlertDialogTitle>
            <AlertDialogDescription>
              Foto ini akan dihapus dari galeri dan berkas penyimpanan R2. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? "Menghapus..." : "Hapus Foto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
