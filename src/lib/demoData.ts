// Demo data generator for easy management

export interface DemoClass {
  id: string;
  name: string;
  description: string;
  tutorId: string;
  tutorName: string;
  studentsCount: number;
  capacity: number;
  schedule: string;
  location: string;
  ageRange: string;
  price: number;
  tutorFee: number;
  operationalCost: number;
  tutorBonusPercent: number;
  color: string;
}

export interface DemoTutor {
  id: string;
  name: string;
  email: string;
  phone: string;
  className: string;
  classId: string;
  studentsCount: number;
  kpiScore: number;
  status: "active" | "busy" | "offline" | "leave";
  joinDate: string;
  specialization: string;
  leaveStatus?: {
    isOnLeave: boolean;
    startDate?: string;
    endDate?: string;
    substituteId?: string;
  };
}

export interface DemoLeaveRequest {
  id: string;
  tutorId: string;
  tutorName: string;
  type: "sick" | "personal" | "annual" | "emergency";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  substituteId: string;
  substituteName: string;
  createdAt: string;
}

// Pre-populated demo classes
export const demoClasses: DemoClass[] = [
  {
    id: "cls-1",
    name: "Kelas Bunga Matahari",
    description: "Kelas untuk anak usia 3-4 tahun dengan fokus pengembangan motorik",
    tutorId: "tut-1",
    tutorName: "Ibu Sarah Wijaya",
    studentsCount: 15,
    capacity: 18,
    schedule: "Senin - Jumat, 08:00 - 12:00",
    location: "Ruang A1",
    ageRange: "3-4 tahun",
    price: 2500000,
    tutorFee: 800000,
    operationalCost: 500000,
    tutorBonusPercent: 10,
    color: "#f59e0b",
  },
  {
    id: "cls-2",
    name: "Kelas Pelangi",
    description: "Kelas kreatif dengan aktivitas seni dan musik",
    tutorId: "tut-2",
    tutorName: "Ibu Maya Sari",
    studentsCount: 12,
    capacity: 15,
    schedule: "Senin - Jumat, 08:00 - 12:00",
    location: "Ruang A2",
    ageRange: "4-5 tahun",
    price: 2800000,
    tutorFee: 900000,
    operationalCost: 600000,
    tutorBonusPercent: 10,
    color: "#3b82f6",
  },
  {
    id: "cls-3",
    name: "Kelas Bintang",
    description: "Kelas persiapan masuk SD dengan fokus baca tulis",
    tutorId: "tut-3",
    tutorName: "Ibu Dina Permata",
    studentsCount: 10,
    capacity: 12,
    schedule: "Senin - Jumat, 13:00 - 17:00",
    location: "Ruang B1",
    ageRange: "5-6 tahun",
    price: 3000000,
    tutorFee: 1000000,
    operationalCost: 700000,
    tutorBonusPercent: 12,
    color: "#8b5cf6",
  },
  {
    id: "cls-4",
    name: "Kelas Mentari",
    description: "Kelas playgroup untuk anak usia dini",
    tutorId: "tut-4",
    tutorName: "Pak Ahmad Rizki",
    studentsCount: 14,
    capacity: 14,
    schedule: "Senin - Jumat, 08:00 - 11:00",
    location: "Ruang C1",
    ageRange: "2-3 tahun",
    price: 2200000,
    tutorFee: 700000,
    operationalCost: 450000,
    tutorBonusPercent: 8,
    color: "#ef4444",
  },
  {
    id: "cls-5",
    name: "Kelas Ceria",
    description: "Kelas weekend untuk aktivitas tambahan",
    tutorId: "tut-5",
    tutorName: "Ibu Rina Handayani",
    studentsCount: 8,
    capacity: 12,
    schedule: "Sabtu, 09:00 - 12:00",
    location: "Ruang D1",
    ageRange: "3-6 tahun",
    price: 1500000,
    tutorFee: 500000,
    operationalCost: 300000,
    tutorBonusPercent: 10,
    color: "#10b981",
  },
];

// Pre-populated demo tutors
export const demoTutors: DemoTutor[] = [
  {
    id: "tut-1",
    name: "Ibu Sarah Wijaya",
    email: "sarah@majiku.com",
    phone: "081234567890",
    className: "Kelas Bunga Matahari",
    classId: "cls-1",
    studentsCount: 15,
    kpiScore: 95,
    status: "active",
    joinDate: "Jan 2023",
    specialization: "Pengembangan Motorik",
  },
  {
    id: "tut-2",
    name: "Ibu Maya Sari",
    email: "maya@majiku.com",
    phone: "081234567891",
    className: "Kelas Pelangi",
    classId: "cls-2",
    studentsCount: 12,
    kpiScore: 88,
    status: "active",
    joinDate: "Mar 2023",
    specialization: "Seni & Kreativitas",
  },
  {
    id: "tut-3",
    name: "Ibu Dina Permata",
    email: "dina@majiku.com",
    phone: "081234567892",
    className: "Kelas Bintang",
    classId: "cls-3",
    studentsCount: 10,
    kpiScore: 92,
    status: "leave",
    joinDate: "Jun 2023",
    specialization: "Persiapan SD",
    leaveStatus: {
      isOnLeave: true,
      startDate: "2024-12-16",
      endDate: "2024-12-20",
      substituteId: "admin",
    },
  },
  {
    id: "tut-4",
    name: "Pak Ahmad Rizki",
    email: "ahmad@majiku.com",
    phone: "081234567893",
    className: "Kelas Mentari",
    classId: "cls-4",
    studentsCount: 14,
    kpiScore: 85,
    status: "active",
    joinDate: "Sep 2023",
    specialization: "Playgroup",
  },
  {
    id: "tut-5",
    name: "Ibu Rina Handayani",
    email: "rina@majiku.com",
    phone: "081234567894",
    className: "Kelas Ceria",
    classId: "cls-5",
    studentsCount: 8,
    kpiScore: 90,
    status: "busy",
    joinDate: "Oct 2023",
    specialization: "Aktivitas Weekend",
  },
];

// Pre-populated leave requests
export const demoLeaveRequests: DemoLeaveRequest[] = [
  {
    id: "leave-1",
    tutorId: "tut-3",
    tutorName: "Ibu Dina Permata",
    type: "sick",
    startDate: "2024-12-16",
    endDate: "2024-12-20",
    reason: "Sakit flu dan demam, perlu istirahat total",
    status: "approved",
    substituteId: "admin",
    substituteName: "Admin",
    createdAt: "2024-12-15",
  },
  {
    id: "leave-2",
    tutorId: "tut-1",
    tutorName: "Ibu Sarah Wijaya",
    type: "annual",
    startDate: "2024-12-23",
    endDate: "2024-12-27",
    reason: "Cuti tahunan untuk liburan keluarga",
    status: "pending",
    substituteId: "tut-2",
    substituteName: "Ibu Maya Sari",
    createdAt: "2024-12-18",
  },
];

// Utility functions
export const getTutorById = (id: string) => demoTutors.find((t) => t.id === id);
export const getClassById = (id: string) => demoClasses.find((c) => c.id === id);
export const getTutorByClassId = (classId: string) => demoTutors.find((t) => t.classId === classId);

export const calculateClassProfit = (cls: DemoClass) => {
  const revenue = cls.price * cls.studentsCount;
  const tutorBonus = (revenue * cls.tutorBonusPercent) / 100;
  return revenue - cls.tutorFee - cls.operationalCost - tutorBonus;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyShort = (amount: number) => {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`;
  }
  return `Rp ${(amount / 1000).toFixed(0)}K`;
};

// Dashboard Stats
export interface DemoStatsCard {
  title: string;
  value: string | number;
  description: string;
  iconName: "users" | "clipboard" | "creditcard" | "message";
  trend?: { value: number; isPositive: boolean };
  variant: "primary" | "success" | "info" | "warning";
}

export const demoStatsData: DemoStatsCard[] = [
  {
    title: "Total Siswa",
    value: 156,
    description: "dari 180 kapasitas",
    iconName: "users",
    trend: { value: 5, isPositive: true },
    variant: "primary",
  },
  {
    title: "Kehadiran Hari Ini",
    value: "94%",
    description: "147 siswa hadir",
    iconName: "clipboard",
    trend: { value: 2, isPositive: true },
    variant: "success",
  },
  {
    title: "Pendapatan Bulan Ini",
    value: "Rp 234M",
    description: "dari target Rp 250M",
    iconName: "creditcard",
    trend: { value: 12, isPositive: true },
    variant: "info",
  },
  {
    title: "Pesan Belum Dibaca",
    value: 23,
    description: "8 dari orang tua",
    iconName: "message",
    variant: "warning",
  },
];

// Daily Reports
export interface DemoDailyReport {
  id: string;
  studentName: string;
  studentAvatar: string;
  className: string;
  time: string;
  type: "meal" | "nap" | "mood" | "incident" | "activity" | "photo";
  title: string;
  description: string;
  imageUrl?: string;
  staffName: string;
}

export const demoDailyReports: DemoDailyReport[] = [
  {
    id: "1",
    studentName: "Aisyah Putri",
    studentAvatar: "https://images.unsplash.com/photo-1595454223600-91d7bf17b165?w=100",
    className: "Kelas Bunga Matahari",
    time: "10:30",
    type: "meal",
    title: "Makan Siang",
    description: "Aisyah makan dengan lahap hari ini! Menghabiskan nasi, sayur bayam, dan ayam goreng. 🍚",
    staffName: "Ibu Sarah",
  },
  {
    id: "2",
    studentName: "Raka Pratama",
    studentAvatar: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=100",
    className: "Kelas Pelangi",
    time: "12:15",
    type: "nap",
    title: "Tidur Siang",
    description: "Raka tidur selama 1.5 jam dengan nyenyak. Bangun dengan ceria! 😴",
    staffName: "Ibu Maya",
  },
  {
    id: "3",
    studentName: "Keisha Azzahra",
    studentAvatar: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=100",
    className: "Kelas Bintang",
    time: "14:00",
    type: "activity",
    title: "Aktivitas Seni",
    description: "Keisha sangat antusias saat melukis dengan cat air. Hasil karyanya sangat bagus!",
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400",
    staffName: "Ibu Dina",
  },
  {
    id: "4",
    studentName: "Arjuna Wijaya",
    studentAvatar: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=100",
    className: "Kelas Bunga Matahari",
    time: "09:45",
    type: "mood",
    title: "Mood Ceria",
    description: "Arjuna datang dengan mood yang sangat baik hari ini. Sangat aktif bermain dengan teman-teman! 😊",
    staffName: "Pak Ahmad",
  },
];

// Attendance
export interface DemoAttendanceEntry {
  id: string;
  studentName: string;
  studentAvatar: string;
  className: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: "present" | "absent" | "late" | "pending";
}

export const demoAttendanceEntries: DemoAttendanceEntry[] = [
  {
    id: "1",
    studentName: "Aisyah Putri",
    studentAvatar: "https://images.unsplash.com/photo-1595454223600-91d7bf17b165?w=100",
    className: "Kelas Bunga Matahari",
    checkInTime: "07:45",
    status: "present",
  },
  {
    id: "2",
    studentName: "Raka Pratama",
    studentAvatar: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=100",
    className: "Kelas Pelangi",
    checkInTime: "08:15",
    status: "late",
  },
  {
    id: "3",
    studentName: "Keisha Azzahra",
    studentAvatar: "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=100",
    className: "Kelas Bintang",
    checkInTime: "07:30",
    checkOutTime: "15:00",
    status: "present",
  },
  {
    id: "4",
    studentName: "Arjuna Wijaya",
    studentAvatar: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=100",
    className: "Kelas Bunga Matahari",
    status: "pending",
  },
];

// Birthdays
export interface DemoBirthday {
  id: string;
  name: string;
  avatar: string;
  className: string;
  birthDate: string;
  age: number;
  daysUntil: number;
}

export const demoBirthdays: DemoBirthday[] = [
  {
    id: "1",
    name: "Aisyah Putri",
    avatar: "https://images.unsplash.com/photo-1595454223600-91d7bf17b165?w=100",
    className: "Kelas Bunga Matahari",
    birthDate: "15 Desember",
    age: 5,
    daysUntil: 0,
  },
  {
    id: "2",
    name: "Raka Pratama",
    avatar: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=100",
    className: "Kelas Pelangi",
    birthDate: "18 Desember",
    age: 4,
    daysUntil: 3,
  },
];

// Billing
export interface DemoBillingItem {
  id: string;
  parentName: string;
  studentName: string;
  amount: number;
  dueDate: string;
  status: "paid" | "unpaid" | "overdue";
}

export const demoBillingItems: DemoBillingItem[] = [
  {
    id: "1",
    parentName: "Bpk. Ahmad Wijaya",
    studentName: "Arjuna Wijaya",
    amount: 2500000,
    dueDate: "15 Des 2024",
    status: "paid",
  },
  {
    id: "2",
    parentName: "Ibu Sari Putri",
    studentName: "Aisyah Putri",
    amount: 2500000,
    dueDate: "10 Des 2024",
    status: "overdue",
  },
  {
    id: "3",
    parentName: "Bpk. Rudi Pratama",
    studentName: "Raka Pratama",
    amount: 3000000,
    dueDate: "20 Des 2024",
    status: "unpaid",
  },
];

// Pending Reports
export interface DemoPendingReport {
  id: string;
  studentName: string;
  studentAvatar: string;
  tutorName: string;
  className: string;
  submittedAt: string;
  type: "meal" | "nap" | "activity" | "mood" | "incident";
}

export const demoPendingReports: DemoPendingReport[] = [
  { id: "1", studentName: "Ahmad Rizki", studentAvatar: "", tutorName: "Ibu Sarah", className: "Kelas Bunga Matahari", submittedAt: "10 menit lalu", type: "meal" },
  { id: "2", studentName: "Siti Aisyah", studentAvatar: "", tutorName: "Ibu Maya", className: "Kelas Pelangi", submittedAt: "25 menit lalu", type: "activity" },
  { id: "3", studentName: "Budi Santoso", studentAvatar: "", tutorName: "Ibu Dina", className: "Kelas Bintang", submittedAt: "1 jam lalu", type: "nap" },
];

// Class revenue for widgets
export const getDemoClassRevenues = () => {
  return demoClasses.map(c => ({
    id: c.id,
    className: c.name,
    revenue: c.price * c.studentsCount,
    studentsCount: c.studentsCount,
    capacity: c.capacity,
    color: c.color,
  }));
};

// Tutor widget data
export const getDemoTutorsForWidget = () => {
  return demoTutors.map(t => ({
    id: t.id,
    name: t.name,
    avatar: "",
    className: t.className,
    kpiScore: t.kpiScore,
    studentsCount: t.studentsCount,
    status: t.status === "leave" ? "busy" as const : t.status as "active" | "busy" | "offline",
  }));
};

// Class widget data
export const getDemoClassesForWidget = () => {
  return demoClasses.map(c => ({
    id: c.id,
    name: c.name,
    tutorName: c.tutorName,
    studentsCount: c.studentsCount,
    capacity: c.capacity,
    color: c.color,
  }));
};
