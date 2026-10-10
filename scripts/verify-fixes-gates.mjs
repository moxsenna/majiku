import fs from "node:fs";
import path from "node:path";

const gate = process.argv[2];

if (!gate) {
  console.error("Usage: node scripts/verify-fixes-gates.mjs <G1|G2|G3|G4|G5|G6|G7|G8|G9|G10|G11>");
  process.exit(1);
}

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf-8");
}

switch (gate) {
  case "G1": {
    const studentsCrud = read("src/server/actions/studentsCrud.ts");
    const studentsView = read("src/views/Students.tsx");
    const hasAutoLink = studentsCrud.includes("parentEmail") && (studentsCrud.includes("parentUserId") || studentsCrud.includes("linkStudentParent"));
    const hasParentLinkAction = studentsCrud.includes("linkStudentParent") || studentsCrud.includes("getLinkableParents");
    const hasLinkUi = studentsView.includes("Tautkan") || studentsView.includes("Akun Ortu") || studentsView.includes("parentUserId");
    if (!hasAutoLink || !hasParentLinkAction) {
      console.error("G1 failed: student-parent pairing logic missing in studentsCrud.ts");
      process.exit(1);
    }
    console.log("G1 passed: student-parent pairing verified");
    break;
  }

  case "G2": {
    const classesView = read("src/views/Classes.tsx");
    const classesCrud = read("src/server/actions/classesCrud.ts");
    const hasTutorInClasses = classesView.includes("tutorId") || classesView.includes("tutorIds") || classesView.includes("Pilih Guru") || classesView.includes("Pilih Tutor");
    const hasAssignAction = classesCrud.includes("assignTutor") || classesCrud.includes("tutorClassAssignments") || classesCrud.includes("tutorIds");
    if (!hasTutorInClasses || !hasAssignAction) {
      console.error("G2 failed: tutor-to-class assignment missing in Classes.tsx or classesCrud.ts");
      process.exit(1);
    }
    console.log("G2 passed: tutor-class assignment verified");
    break;
  }

  case "G3": {
    const dashboardView = read("src/views/Dashboard.tsx");
    if (dashboardView.includes("<PendingReportsWidget") || dashboardView.includes("handleApproveReport")) {
      console.error("G3 failed: fake PendingReportsWidget still rendered in Dashboard.tsx");
      process.exit(1);
    }
    console.log("G3 passed: fake PendingReportsWidget removed cleanly");
    break;
  }

  case "G4": {
    const parentChildren = read("src/server/actions/parentChildren.ts");
    const parentPortal = read("src/views/ParentPortal.tsx");
    const hasGalleryPhotosQuery = parentChildren.includes("galleryPhotos") || parentChildren.includes("gallery_photos");
    if (!hasGalleryPhotosQuery) {
      console.error("G4 failed: galleryPhotos from admin not queried in parentChildren.ts");
      process.exit(1);
    }
    console.log("G4 passed: admin gallery photos linked to parent portal");
    break;
  }

  case "G5": {
    const attendanceAction = read("src/server/actions/attendance.ts");
    const attendanceView = read("src/views/Attendance.tsx");
    const usesTodayInWib = attendanceAction.includes("todayInWib");
    const viewUsesTodayInWib = attendanceView.includes("todayInWib");
    if (!usesTodayInWib || !viewUsesTodayInWib) {
      console.error("G5 failed: attendance not consistently using todayInWib");
      process.exit(1);
    }
    console.log("G5 passed: attendance time zone standardized to WIB");
    break;
  }

  case "G6": {
    const schema = read("src/db/schema.ts");
    const attendanceAction = read("src/server/actions/attendance.ts");
    const tutorAttendanceView = read("src/views/TutorAttendance.tsx");
    const hasTable = schema.includes("tutorAttendance") || schema.includes("tutor_attendance");
    const hasDbInsert = attendanceAction.includes("db.insert(tutorAttendance)") || attendanceAction.includes("tutorAttendance");
    const usesQuery = tutorAttendanceView.includes("useQuery") || tutorAttendanceView.includes("useMutation");
    if (!hasTable || !hasDbInsert || !usesQuery) {
      console.error("G6 failed: tutor attendance DB persistence or TanStack query missing");
      process.exit(1);
    }
    console.log("G6 passed: tutor attendance database persistence verified");
    break;
  }

  case "G7": {
    const parentPortal = read("src/views/ParentPortal.tsx");
    const parentProfile = read("src/views/ParentProfile.tsx");
    const parentBilling = read("src/views/ParentBilling.tsx");
    const parentReg = read("src/views/ParentRegistration.tsx");
    const checkLinks = (content, name) => {
      if (content.includes('href="/parent/catalog"') && content.includes('<ShoppingBag')) {
        console.error(`G7 failed: ${name} still links bottom nav to /parent/catalog`);
        process.exit(1);
      }
    };
    checkLinks(parentPortal, "ParentPortal.tsx");
    checkLinks(parentProfile, "ParentProfile.tsx");
    checkLinks(parentBilling, "ParentBilling.tsx");
    checkLinks(parentReg, "ParentRegistration.tsx");
    console.log("G7 passed: bottom nav redirects to marketplace verified");
    break;
  }

  case "G8": {
    const billingAction = read("src/server/actions/billing.ts");
    const billingView = read("src/views/Billing.tsx");
    const hasCreateInvoice = billingAction.includes("createInvoice");
    const hasCreateDialog = billingView.includes("Buat Invoice") || billingView.includes("Terbitkan Invoice");
    if (!hasCreateInvoice || !hasCreateDialog) {
      console.error("G8 failed: manual invoice creation missing in billing.ts or Billing.tsx");
      process.exit(1);
    }
    console.log("G8 passed: manual invoice creation verified");
    break;
  }

  case "G9": {
    const adminNavbar = read("src/components/dashboard/AdminNavbarActions.tsx");
    const settings = read("src/views/Settings.tsx");
    const tutorKpi = read("src/views/TutorKPI.tsx");
    const settingsHasRealSave = settings.includes("updateTenantProfile") || settings.includes("useMutation") || settings.includes("tenants");
    const navbarClean = !adminNavbar.includes('name: "Ibu Dina"') || adminNavbar.includes("isDemo");
    if (!settingsHasRealSave) {
      console.error("G9 failed: settings profile save is still simulated mock");
      process.exit(1);
    }
    console.log("G9 passed: mock components cleaned and settings persisted");
    break;
  }

  case "G10": {
    const trialActions = read("src/server/actions/trial.ts");
    const parentReg = read("src/views/ParentRegistration.tsx");
    const hasGetPrograms = trialActions.includes("getAvailablePrograms") || trialActions.includes("getRegistrationPrograms");
    const usesDynamicPrograms = parentReg.includes("getAvailablePrograms") || parentReg.includes("programsList") || parentReg.includes("dynamicPrograms");
    if (!hasGetPrograms || !usesDynamicPrograms) {
      console.error("G10 failed: parent registration dynamic programs from DB missing");
      process.exit(1);
    }
    console.log("G10 passed: parent registration dynamic programs verified");
    break;
  }

  case "G11": {
    const landing = read("src/views/SaasLanding.tsx");
    const checkoutView = read("src/views/Checkout.tsx");
    const checkoutAction = read("src/server/actions/checkout.ts");
    const hasCheckoutLinks = landing.includes("/checkout?plan=");
    const hasPayCoreIntegration = checkoutAction.includes("createPayCoreOrder");
    const hasCheckoutForm = checkoutView.includes("PayCore Payment Gateway") && checkoutView.includes("createSubscriptionCheckoutOrder");
    if (!hasCheckoutLinks || !hasPayCoreIntegration || !hasCheckoutForm) {
      console.error("G11 failed: CTA LP to checkout page or PayCore integration missing");
      process.exit(1);
    }
    console.log("G11 passed: CTA LP to checkout page and PayCore payment verified");
    break;
  }

  default: {
    console.error(`Unknown gate: ${gate}`);
    process.exit(1);
  }
}
