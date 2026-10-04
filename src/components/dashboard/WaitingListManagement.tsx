import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Baby,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  Star,
  Heart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Mock waiting list data
const waitingListData = [
  {
    id: "1",
    childName: "Aisyah Putri",
    parentName: "Ibu Dewi",
    parentPhone: "081234567890",
    parentEmail: "dewi@email.com",
    birthDate: new Date("2021-05-15"),
    program: "playgroup",
    programName: "Playgroup",
    registrationDate: new Date("2024-12-28"),
    status: "waiting",
    notes: "Speech delay",
  },
  {
    id: "2",
    childName: "Raka Pratama",
    parentName: "Bapak Ahmad",
    parentPhone: "081298765432",
    parentEmail: "ahmad@email.com",
    birthDate: new Date("2020-08-22"),
    program: "kindergarten",
    programName: "TK A & B",
    registrationDate: new Date("2024-12-27"),
    status: "waiting",
    notes: "",
  },
  {
    id: "3",
    childName: "Keisha Azzahra",
    parentName: "Ibu Sarah",
    parentPhone: "081345678901",
    parentEmail: "sarah@email.com",
    birthDate: new Date("2022-01-10"),
    program: "toddler",
    programName: "Program Toddler",
    registrationDate: new Date("2024-12-26"),
    status: "waiting",
    notes: "Alergi kacang",
  },
  {
    id: "4",
    childName: "Arjuna Wijaya",
    parentName: "Ibu Ratna",
    parentPhone: "081456789012",
    parentEmail: "ratna@email.com",
    birthDate: new Date("2019-11-05"),
    program: "daycare",
    programName: "Daycare Full Day",
    registrationDate: new Date("2024-12-25"),
    status: "waiting",
    notes: "",
  },
];

// Available classes to assign
const availableClasses = [
  { id: "bunga-matahari", name: "Kelas Bunga Matahari", program: "playgroup", capacity: 20, enrolled: 15 },
  { id: "melati", name: "Kelas Melati", program: "playgroup", capacity: 20, enrolled: 18 },
  { id: "mawar", name: "Kelas Mawar", program: "toddler", capacity: 15, enrolled: 12 },
  { id: "anggrek", name: "Kelas Anggrek", program: "kindergarten", capacity: 25, enrolled: 20 },
  { id: "dahlia", name: "Kelas Dahlia", program: "kindergarten", capacity: 25, enrolled: 22 },
  { id: "teratai", name: "Kelas Teratai", program: "daycare", capacity: 15, enrolled: 10 },
];

const programIcons = {
  toddler: Baby,
  playgroup: Star,
  kindergarten: GraduationCap,
  daycare: Heart,
};

interface WaitingListManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitingListManagement({ isOpen, onClose }: WaitingListManagementProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChild, setSelectedChild] = useState<typeof waitingListData[0] | null>(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [waitingList, setWaitingList] = useState(waitingListData);

  const filteredList = waitingList.filter(item =>
    item.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.programName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClasses = selectedChild 
    ? availableClasses.filter(c => c.program === selectedChild.program)
    : [];

  const handleAssignToClass = async () => {
    if (!selectedChild || !selectedClass) return;

    setIsAssigning(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Remove from waiting list
    setWaitingList(prev => prev.filter(item => item.id !== selectedChild.id));
    
    const className = availableClasses.find(c => c.id === selectedClass)?.name;
    
    toast({
      title: "Berhasil!",
      description: `${selectedChild.childName} telah dimasukkan ke ${className}`,
    });

    setSelectedChild(null);
    setSelectedClass("");
    setIsAssigning(false);
  };

  const handleReject = async (child: typeof waitingListData[0]) => {
    setWaitingList(prev => prev.filter(item => item.id !== child.id));
    toast({
      title: "Pendaftaran Ditolak",
      description: `Pendaftaran ${child.childName} telah ditolak`,
      variant: "destructive",
    });
  };

  const getAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Kelola Waiting List
            </DialogTitle>
            <DialogDescription>
              Kelola pendaftaran dan assign siswa ke kelas yang tersedia
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama anak atau wali..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-warning/10 border-warning/20">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-warning">{waitingList.length}</p>
                  <p className="text-xs text-muted-foreground">Menunggu</p>
                </CardContent>
              </Card>
              <Card className="bg-success/10 border-success/20">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-success">12</p>
                  <p className="text-xs text-muted-foreground">Diterima</p>
                </CardContent>
              </Card>
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-destructive">2</p>
                  <p className="text-xs text-muted-foreground">Ditolak</p>
                </CardContent>
              </Card>
            </div>

            {/* Waiting List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Tidak ada data di waiting list</p>
                  </div>
                ) : (
                  filteredList.map((item) => {
                    const ProgramIcon = programIcons[item.program as keyof typeof programIcons] || Users;
                    return (
                      <Card key={item.id} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {item.childName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold">{item.childName}</h4>
                                <Badge variant="outline" className="text-xs gap-1">
                                  <ProgramIcon className="h-3 w-3" />
                                  {item.programName}
                                </Badge>
                              </div>
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {getAge(item.birthDate)} tahun
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(item.registrationDate, "d MMM yyyy", { locale: idLocale })}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {item.parentName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {item.parentPhone}
                                </span>
                              </div>

                              {item.notes && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <AlertCircle className="h-3.5 w-3.5 text-warning" />
                                  <span className="text-xs text-warning font-medium">{item.notes}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                className="gap-1"
                                onClick={() => setSelectedChild(item)}
                              >
                                <ArrowRight className="h-3 w-3" />
                                Assign
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleReject(item)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign to Class Dialog */}
      <Dialog open={!!selectedChild} onOpenChange={() => setSelectedChild(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign ke Kelas</DialogTitle>
            <DialogDescription>
              Pilih kelas untuk {selectedChild?.childName}
            </DialogDescription>
          </DialogHeader>

          {selectedChild && (
            <div className="space-y-4">
              {/* Child Info */}
              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedChild.childName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{selectedChild.childName}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedChild.programName} • {getAge(selectedChild.birthDate)} tahun
                      </p>
                    </div>
                  </div>
                  {selectedChild.notes && (
                    <div className="mt-3 flex items-center gap-1.5 p-2 rounded-md bg-warning/10">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm text-warning">{selectedChild.notes}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Class Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pilih Kelas</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas yang tersedia" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClasses.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Tidak ada kelas untuk program ini
                      </div>
                    ) : (
                      filteredClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{cls.name}</span>
                            <Badge variant={cls.enrolled >= cls.capacity ? "destructive" : "secondary"} className="text-xs">
                              {cls.enrolled}/{cls.capacity}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedClass && (
                  <p className="text-xs text-muted-foreground">
                    Kapasitas tersisa: {
                      availableClasses.find(c => c.id === selectedClass)!.capacity - 
                      availableClasses.find(c => c.id === selectedClass)!.enrolled
                    } siswa
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedChild(null)}>
              Batal
            </Button>
            <Button 
              onClick={handleAssignToClass} 
              disabled={!selectedClass || isAssigning}
              className="gap-2"
            >
              {isAssigning ? (
                "Menyimpan..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Konfirmasi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
