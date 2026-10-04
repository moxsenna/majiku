import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Upload,
  Grid,
  List,
  Heart,
  MessageCircle,
  Download,
  MoreVertical,
  Image as ImageIcon,
  Video,
  Filter,
} from "lucide-react";

interface GalleryItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  caption: string;
  taggedStudents: { id: string; name: string; avatar?: string }[];
  uploadedBy: string;
  uploadedAt: string;
  likes: number;
  comments: number;
}

const galleryItems: GalleryItem[] = [
  {
    id: "1",
    type: "image",
    url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
    caption: "Kegiatan melukis di kelas Bintang hari ini! 🎨",
    taggedStudents: [
      { id: "1", name: "Keisha Azzahra", avatar: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=100" },
      { id: "2", name: "Aisyah Putri", avatar: "https://images.unsplash.com/photo-1595454223600-91d7bf17b165?w=100" },
    ],
    uploadedBy: "Ibu Dina",
    uploadedAt: "2 jam lalu",
    likes: 15,
    comments: 5,
  },
  {
    id: "2",
    type: "image",
    url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800",
    caption: "Bermain di playground bersama teman-teman! ⛲",
    taggedStudents: [
      { id: "3", name: "Raka Pratama", avatar: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=100" },
    ],
    uploadedBy: "Pak Ahmad",
    uploadedAt: "4 jam lalu",
    likes: 23,
    comments: 8,
  },
  {
    id: "3",
    type: "image",
    url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800",
    caption: "Belajar menulis huruf di kelas Bunga Matahari 📝",
    taggedStudents: [
      { id: "4", name: "Arjuna Wijaya", avatar: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=100" },
    ],
    uploadedBy: "Ibu Sarah",
    uploadedAt: "Kemarin",
    likes: 12,
    comments: 3,
  },
  {
    id: "4",
    type: "image",
    url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800",
    caption: "Makan siang bersama! Anak-anak makan dengan lahap 🍚",
    taggedStudents: [
      { id: "1", name: "Keisha Azzahra", avatar: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=100" },
      { id: "2", name: "Aisyah Putri", avatar: "https://images.unsplash.com/photo-1595454223600-91d7bf17b165?w=100" },
      { id: "3", name: "Raka Pratama", avatar: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=100" },
    ],
    uploadedBy: "Ibu Maya",
    uploadedAt: "Kemarin",
    likes: 18,
    comments: 6,
  },
];

export default function Gallery() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <DashboardLayout title="Galeri Foto" subtitle="Foto dan video aktivitas anak-anak">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="ml-2">
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>

        <Button variant="hero" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Upload Foto/Video</span>
          <span className="sm:hidden">Upload</span>
        </Button>
      </div>

      {/* Gallery Grid */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
        : "space-y-4 max-w-3xl"
      }>
        {galleryItems.map((item) => (
          <Card key={item.id} variant="interactive" className="overflow-hidden">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={item.url}
                alt={item.caption}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  {item.type === "image" ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              {/* Caption */}
              <p className="text-sm text-foreground mb-3 line-clamp-2">{item.caption}</p>

              {/* Tagged Students */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-2">
                  {item.taggedStudents.slice(0, 3).map((student) => (
                    <Avatar key={student.id} size="xs" className="border-2 border-background">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.taggedStudents.length > 3
                    ? `+${item.taggedStudents.length - 3} lainnya`
                    : item.taggedStudents.map((s) => s.name.split(" ")[0]).join(", ")}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">{item.uploadedBy}</span> • {item.uploadedAt}
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="h-3 w-3" />
                    <span>{item.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="h-3 w-3" />
                    <span>{item.comments}</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
