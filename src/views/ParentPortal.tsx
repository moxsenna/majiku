import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Home,
  Bell,
  MessageCircle,
  User,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
  Search,
  Plus,
  Image as ImageIcon,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Utensils,
  Moon,
  Smile,
  Activity,
  ChevronRight,
  LogOut,
  CreditCard,
  GraduationCap,
} from "lucide-react";
import { PromoBanner } from "@/components/promo/PromoBanner";
import { ParentActivityWidget } from "@/components/dashboard/ParentActivityWidget";
import { ProgramInfoBanner } from "@/components/parent/ProgramInfoBanner";

// Mock data for child
const childData = {
  id: "1",
  name: "Aisyah Putri",
  nickname: "Aisyah",
  avatar: "https://images.unsplash.com/photo-1595454223600-91d7bf17b165?w=200",
  className: "Kelas Bunga Matahari",
  age: 5,
  attendanceToday: true,
  checkInTime: "07:45",
};

// Mock feed data
const feedItems = [
  {
    id: "1",
    type: "photo",
    author: {
      name: "Ibu Dina",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      role: "Guru Kelas",
    },
    content: "Kegiatan melukis hari ini sangat seru! Aisyah menunjukkan kreativitas yang luar biasa dengan memilih warna-warna cerah untuk lukisannya. 🎨",
    images: ["https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800"],
    taggedChildren: ["Aisyah Putri", "Keisha Azzahra"],
    time: "2 jam lalu",
    likes: 24,
    comments: 5,
    liked: true,
    saved: false,
  },
  {
    id: "2",
    type: "update",
    category: "meal",
    author: {
      name: "Ibu Sarah",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
      role: "Guru Kelas",
    },
    content: "Aisyah makan siang dengan lahap! Menghabiskan nasi, sayur bayam, dan ayam goreng. Minum susu satu gelas penuh. 🍚",
    time: "4 jam lalu",
    likes: 12,
    comments: 2,
    liked: false,
    saved: false,
  },
  {
    id: "3",
    type: "photo",
    author: {
      name: "Pak Ahmad",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      role: "Guru Olahraga",
    },
    content: "Bermain di playground! Anak-anak sangat bersemangat bermain bersama teman-teman. Aisyah sangat aktif hari ini! ⛲",
    images: [
      "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800",
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800",
    ],
    taggedChildren: ["Aisyah Putri", "Raka Pratama", "Arjuna Wijaya"],
    time: "Kemarin",
    likes: 45,
    comments: 8,
    liked: true,
    saved: true,
  },
  {
    id: "4",
    type: "update",
    category: "nap",
    author: {
      name: "Ibu Maya",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
      role: "Pengasuh",
    },
    content: "Tidur siang selama 1.5 jam dengan nyenyak. Bangun dengan ceria dan langsung bermain dengan teman-teman! 😴",
    time: "Kemarin",
    likes: 8,
    comments: 1,
    liked: false,
    saved: false,
  },
];

// Progress/milestone data
const progressData = {
  attendance: { current: 22, total: 24, percentage: 92 },
  meals: { good: 18, total: 22, percentage: 82 },
  activities: 15,
  milestones: [
    { id: "1", title: "Bisa menulis nama sendiri", date: "5 Des 2024", icon: "✏️" },
    { id: "2", title: "Menghafal 10 huruf", date: "28 Nov 2024", icon: "📚" },
    { id: "3", title: "Bisa berhitung 1-20", date: "15 Nov 2024", icon: "🔢" },
  ],
};

const categoryIcons = {
  meal: Utensils,
  nap: Moon,
  mood: Smile,
  activity: Activity,
};

const categoryColors = {
  meal: "bg-success/10 text-success",
  nap: "bg-info/10 text-info",
  mood: "bg-highlight/10 text-highlight",
  activity: "bg-primary/10 text-primary",
};

export default function ParentPortal() {
  const [activeTab, setActiveTab] = useState<"feed" | "progress" | "gallery">("feed");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({
    "1": true,
    "3": true,
  });

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">MAJIKU</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                3
              </span>
            </Button>
            <Link href="/parent/chat">
              <Button variant="ghost" size="icon-sm">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Child Profile Bar */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar size="lg" className="ring-2 ring-primary ring-offset-2">
                <AvatarImage src={childData.avatar} />
                <AvatarFallback>{childData.nickname.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center border-2 border-background">
                <span className="text-[10px]">✓</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-foreground">{childData.name}</h2>
              <p className="text-xs text-muted-foreground">{childData.className}</p>
            </div>
            <div className="text-right">
              <Badge variant="success" className="text-xs">Hadir</Badge>
              <p className="text-xs text-muted-foreground mt-1">Check-in: {childData.checkInTime}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto">
          <Link href="/parent/marketplace">
            <Button variant="default" size="sm" className="flex-shrink-0 gap-2">
              <Search className="h-4 w-4" />
              Cari Daycare
            </Button>
          </Link>
          <Link href="/parent/registration">
            <Button variant="outline" size="sm" className="flex-shrink-0 gap-2">
              <Plus className="h-4 w-4" />
              Daftar Program
            </Button>
          </Link>
          <Link href="/parent/billing">
            <Button variant="outline" size="sm" className="flex-shrink-0 gap-2">
              <CreditCard className="h-4 w-4" />
              Lihat Tagihan
            </Button>
          </Link>
          <Link href="/parent/chat">
            <Button variant="outline" size="sm" className="flex-shrink-0 gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat Admin
            </Button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          {[
            { id: "feed", label: "Feed", icon: Home },
            { id: "progress", label: "Progress", icon: TrendingUp },
            { id: "gallery", label: "Galeri", icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {activeTab === "feed" && (
          <div className="max-w-lg mx-auto">
            {/* Stories/Quick Stats */}
            <div className="flex gap-4 p-4 overflow-x-auto">
              {[
                { label: "Hari Ini", value: "Ceria 😊", color: "bg-highlight/10" },
                { label: "Makan", value: "Habis ✓", color: "bg-success/10" },
                { label: "Tidur", value: "1.5 jam", color: "bg-info/10" },
                { label: "Aktivitas", value: "3", color: "bg-primary/10" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-20 h-24 rounded-xl ${stat.color} flex flex-col items-center justify-center p-2 border border-border/50`}
                >
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <span className="text-sm font-bold text-foreground mt-1">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Activity Schedule Widget */}
            <div className="px-4 pb-4">
              <ParentActivityWidget />
            </div>

            {/* Program Info & Testimonials Banner */}
            <div className="px-4 pb-4">
              <ProgramInfoBanner />
            </div>

            {/* Feed */}
            <div className="space-y-4">
              {feedItems.map((item) => (
                <Card key={item.id} className="rounded-none sm:rounded-xl border-x-0 sm:border-x sm:mx-4">
                  <CardContent className="p-0">
                    {/* Post Header */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={item.author.avatar} />
                          <AvatarFallback>{item.author.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{item.author.name}</p>
                          <p className="text-xs text-muted-foreground">{item.author.role} • {item.time}</p>
                        </div>
                      </div>
                      {item.type === "update" && item.category && (
                        <Badge className={categoryColors[item.category as keyof typeof categoryColors]}>
                          {item.category === "meal" && "🍽️ Makan"}
                          {item.category === "nap" && "😴 Tidur"}
                          {item.category === "mood" && "😊 Mood"}
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Images */}
                    {item.images && item.images.length > 0 && (
                      <div className={`relative ${item.images.length > 1 ? "grid grid-cols-2 gap-0.5" : ""}`}>
                        {item.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="w-full aspect-square object-cover"
                          />
                        ))}
                        {item.taggedChildren && item.taggedChildren.length > 0 && (
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                              <User className="h-3 w-3 mr-1" />
                              {item.taggedChildren.length} anak ditandai
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between px-4 py-2">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(item.id)}
                          className="flex items-center gap-1 transition-transform active:scale-125"
                        >
                          <Heart
                            className={`h-6 w-6 ${
                              likedPosts[item.id]
                                ? "fill-red-500 text-red-500"
                                : "text-foreground"
                            }`}
                          />
                        </button>
                        <button className="flex items-center gap-1">
                          <MessageSquare className="h-6 w-6 text-foreground" />
                        </button>
                        <button>
                          <Share2 className="h-6 w-6 text-foreground" />
                        </button>
                      </div>
                      <button>
                        <Bookmark
                          className={`h-6 w-6 ${
                            item.saved ? "fill-foreground text-foreground" : "text-foreground"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Likes */}
                    <div className="px-4">
                      <p className="font-semibold text-sm">{item.likes + (likedPosts[item.id] && !feedItems.find(f => f.id === item.id)?.liked ? 1 : 0)} suka</p>
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-2">
                      <p className="text-sm">
                        <span className="font-semibold">{item.author.name}</span>{" "}
                        {item.content}
                      </p>
                    </div>

                    {/* Tagged Children */}
                    {item.taggedChildren && item.taggedChildren.length > 0 && (
                      <div className="px-4 pb-2">
                        <p className="text-xs text-muted-foreground">
                          Dengan: {item.taggedChildren.join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Comments */}
                    {item.comments > 0 && (
                      <button className="px-4 pb-3 text-sm text-muted-foreground">
                        Lihat semua {item.comments} komentar
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="max-w-lg mx-auto p-4 space-y-4">
            {/* Progress Overview */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-4">Progress Bulan Ini</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="relative h-16 w-16 mx-auto mb-2">
                      <svg className="h-16 w-16 -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-success"
                          strokeDasharray={`${progressData.attendance.percentage * 1.76} 176`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                        {progressData.attendance.percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Kehadiran</p>
                    <p className="text-xs font-medium">{progressData.attendance.current}/{progressData.attendance.total} hari</p>
                  </div>
                  <div className="text-center">
                    <div className="relative h-16 w-16 mx-auto mb-2">
                      <svg className="h-16 w-16 -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-primary"
                          strokeDasharray={`${progressData.meals.percentage * 1.76} 176`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                        {progressData.meals.percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Makan Baik</p>
                    <p className="text-xs font-medium">{progressData.meals.good}/{progressData.meals.total} kali</p>
                  </div>
                  <div className="text-center">
                    <div className="h-16 w-16 mx-auto mb-2 rounded-full bg-highlight/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-highlight">{progressData.activities}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Aktivitas</p>
                    <p className="text-xs font-medium">diikuti</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-4">Pencapaian Terbaru 🏆</h3>
                <div className="space-y-3">
                  {progressData.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                    >
                      <div className="h-10 w-10 rounded-full bg-highlight/10 flex items-center justify-center text-xl">
                        {milestone.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{milestone.title}</p>
                        <p className="text-xs text-muted-foreground">{milestone.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Summary */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-4">Ringkasan Minggu Ini</h3>
                <div className="space-y-3">
                  {[
                    { day: "Senin", mood: "😊", meal: "✓", nap: "✓", activities: 2 },
                    { day: "Selasa", mood: "😊", meal: "✓", nap: "✓", activities: 3 },
                    { day: "Rabu", mood: "😴", meal: "½", nap: "✓", activities: 1 },
                    { day: "Kamis", mood: "😊", meal: "✓", nap: "✓", activities: 2 },
                    { day: "Jumat", mood: "🎉", meal: "✓", nap: "-", activities: 4 },
                  ].map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-medium text-sm w-16">{day.day}</span>
                      <span className="text-lg">{day.mood}</span>
                      <div className="flex items-center gap-1 text-xs">
                        <Utensils className="h-3 w-3 text-muted-foreground" />
                        <span className={day.meal === "✓" ? "text-success" : "text-warning"}>{day.meal}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Moon className="h-3 w-3 text-muted-foreground" />
                        <span className={day.nap === "✓" ? "text-success" : "text-muted-foreground"}>{day.nap}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{day.activities} aktivitas</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-1 max-w-lg mx-auto">
              {[
                "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400",
                "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400",
                "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400",
                "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400",
                "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400",
                "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400",
              ].map((img, index) => (
                <div key={index} className="aspect-square relative group cursor-pointer">
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-4 text-primary-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-5 w-5 fill-current" />
                        <span className="font-bold">{12 + index * 3}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-5 w-5 fill-current" />
                        <span className="font-bold">{2 + index}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === "feed" ? "text-primary" : "text-muted-foreground"}`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs">Beranda</span>
          </button>
          <Link href="/parent/catalog" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs">Katalog</span>
          </Link>
          <Link href="/parent/billing" className="flex flex-col items-center gap-1 p-2 text-muted-foreground">
            <CreditCard className="h-6 w-6" />
            <span className="text-xs">Tagihan</span>
          </Link>
          <Link href="/parent/chat" className="flex flex-col items-center gap-1 p-2 text-muted-foreground relative">
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 right-0 h-4 w-4 bg-primary rounded-full text-[10px] font-bold text-primary-foreground flex items-center justify-center">2</span>
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
