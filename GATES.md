# Gates: Comprehensive UI/UX Logic Fixes

OWNS: src/db/schema.ts, src/server/actions/**, src/views/**, src/components/**

Scope: Fix all 10 UI/UX logic errors across Admin, Parent, Tutor, and Vendor roles.

- [x] G1: Pairing Siswa ke Parent (auto-link by email & action link)
  CHECK: node scripts/verify-fixes-gates.mjs G1
  EXPECT: G1 passed: student-parent pairing verified
  EVIDENCE: verified exit 0, matched "G1 passed: student-parent pairing verified"

- [x] G2: Penugasan Guru ke Kelas (assignment di Classes & Tutors)
  CHECK: node scripts/verify-fixes-gates.mjs G2
  EXPECT: G2 passed: tutor-class assignment verified
  EVIDENCE: verified exit 0, matched "G2 passed: tutor-class assignment verified"

- [x] G3: Pembersihan PendingReportsWidget palsu dari Dashboard Admin
  CHECK: node scripts/verify-fixes-gates.mjs G3
  EXPECT: G3 passed: fake PendingReportsWidget removed cleanly
  EVIDENCE: verified exit 0, matched "G3 passed: fake PendingReportsWidget removed cleanly"

- [x] G4: Integrasi Foto Galeri Admin ke Portal Orang Tua
  CHECK: node scripts/verify-fixes-gates.mjs G4
  EXPECT: G4 passed: admin gallery photos linked to parent portal
  EVIDENCE: verified exit 0, matched "G4 passed: admin gallery photos linked to parent portal"

- [x] G5: Standarisasi Waktu Absensi ke Asia/Jakarta (WIB)
  CHECK: node scripts/verify-fixes-gates.mjs G5
  EXPECT: G5 passed: attendance time zone standardized to WIB
  EVIDENCE: verified exit 0, matched "G5 passed: attendance time zone standardized to WIB"

- [x] G6: Persistensi Absensi Guru ke Database
  CHECK: node scripts/verify-fixes-gates.mjs G6
  EXPECT: G6 passed: tutor attendance database persistence verified
  EVIDENCE: verified exit 0, matched "G6 passed: tutor attendance database persistence verified"

- [x] G7: Navigasi Bawah Parent mengarah ke Marketplace
  CHECK: node scripts/verify-fixes-gates.mjs G7
  EXPECT: G7 passed: bottom nav redirects to marketplace verified
  EVIDENCE: verified exit 0, matched "G7 passed: bottom nav redirects to marketplace verified"

- [x] G8: Penerbitan Invoice SPP Manual oleh Admin
  CHECK: node scripts/verify-fixes-gates.mjs G8
  EXPECT: G8 passed: manual invoice creation verified
  EVIDENCE: verified exit 0, matched "G8 passed: manual invoice creation verified"

- [x] G9: Pembersihan Komponen Mock di Navbar/Messages/Settings
  CHECK: node scripts/verify-fixes-gates.mjs G9
  EXPECT: G9 passed: mock components cleaned and settings persisted
  EVIDENCE: verified exit 0, matched "G9 passed: mock components cleaned and settings persisted"

- [x] G10: Pendaftaran Program Parent Mengambil Data Kelas Dinamis dari DB
  CHECK: node scripts/verify-fixes-gates.mjs G10
  EXPECT: G10 passed: parent registration dynamic programs verified
  EVIDENCE: verified exit 0, matched "G10 passed: parent registration dynamic programs verified"
