import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  Clock,
  Lightbulb,
  Bug,
  HelpCircle,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const feedbackData = [
  { 
    id: 1, 
    vendor: "TK Ceria Mandiri", 
    type: "feature", 
    message: "Mohon tambahkan fitur untuk tracking progress belajar siswa secara real-time", 
    status: "new",
    date: "18 Des 2024",
    votes: 12
  },
  { 
    id: 2, 
    vendor: "Bimbel Prestasi", 
    type: "bug", 
    message: "Laporan keuangan bulan November tidak bisa di-export ke PDF", 
    status: "in_progress",
    date: "17 Des 2024",
    votes: 5
  },
  { 
    id: 3, 
    vendor: "Daycare Happy Kids", 
    type: "question", 
    message: "Bagaimana cara mengintegrasikan dengan sistem pembayaran QRIS?", 
    status: "resolved",
    date: "16 Des 2024",
    votes: 8
  },
  { 
    id: 4, 
    vendor: "PAUD Tunas Bangsa", 
    type: "feature", 
    message: "Request fitur notifikasi WhatsApp untuk orang tua", 
    status: "new",
    date: "15 Des 2024",
    votes: 24
  },
  { 
    id: 5, 
    vendor: "Kursus ABC English", 
    type: "feature", 
    message: "Tambahkan fitur jadwal online meeting untuk kelas virtual", 
    status: "planned",
    date: "14 Des 2024",
    votes: 18
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "feature": return <Lightbulb className="w-4 h-4 text-primary" />;
    case "bug": return <Bug className="w-4 h-4 text-destructive" />;
    case "question": return <HelpCircle className="w-4 h-4 text-info" />;
    default: return <MessageSquare className="w-4 h-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "new": return <Badge variant="secondary">Baru</Badge>;
    case "in_progress": return <Badge className="bg-warning/10 text-warning border-warning/20">Diproses</Badge>;
    case "planned": return <Badge className="bg-info/10 text-info border-info/20">Direncanakan</Badge>;
    case "resolved": return <Badge className="bg-success/10 text-success border-success/20">Selesai</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function FeedbackWidget() {
  const { toast } = useToast();
  const [reply, setReply] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<number | null>(null);

  const handleReply = (feedbackId: number) => {
    if (!reply.trim()) return;
    toast({
      title: "Balasan Terkirim",
      description: "Feedback telah dibalas dan vendor akan mendapat notifikasi",
    });
    setReply("");
    setSelectedFeedback(null);
  };

  const handleStatusChange = (feedbackId: number, newStatus: string) => {
    toast({
      title: "Status Diperbarui",
      description: `Feedback telah diubah ke status: ${newStatus}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">48</p>
                <p className="text-xs text-muted-foreground">Total Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Menunggu</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">28</p>
                <p className="text-xs text-muted-foreground">Feature Request</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">36</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feedback & Request Terbaru</CardTitle>
          <CardDescription>Masukan dan permintaan dari vendor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedbackData.map((feedback) => (
              <div key={feedback.id} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {feedback.vendor.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{feedback.vendor}</p>
                      <p className="text-xs text-muted-foreground">{feedback.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(feedback.type)}
                    {getStatusBadge(feedback.status)}
                  </div>
                </div>
                
                <p className="text-sm text-foreground mb-3">{feedback.message}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      {feedback.votes} votes
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedFeedback(selectedFeedback === feedback.id ? null : feedback.id)}
                    >
                      Balas
                    </Button>
                    {feedback.status === "new" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(feedback.id, "in_progress")}
                      >
                        Proses
                      </Button>
                    )}
                  </div>
                </div>

                {selectedFeedback === feedback.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Textarea 
                      placeholder="Tulis balasan..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedFeedback(null)}>
                        Batal
                      </Button>
                      <Button size="sm" onClick={() => handleReply(feedback.id)}>
                        <Send className="w-4 h-4 mr-1" />
                        Kirim
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
