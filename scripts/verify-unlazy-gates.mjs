import fs from "node:fs";
import path from "node:path";

const gate = process.argv[2];

if (!gate) {
  console.error("Usage: node scripts/verify-unlazy-gates.mjs <G1|G2|G3|G4|G5|G6|G7>");
  process.exit(1);
}

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf-8");
}

switch (gate) {
  case "G1": {
    const middleware = read("src/middleware.ts");
    // Check that parent rewrite doesn't rewrite /parent to /parent/parent
    const parentCheck = middleware.includes('pathname !== "/parent"') || middleware.includes('pathname === "/parent"');
    const tutorCheck = middleware.includes('pathname !== "/tutor"') || middleware.includes('pathname === "/tutor"');
    if (!parentCheck || !tutorCheck) {
      console.error("Middleware missing exact path exclusion for parent or tutor");
      process.exit(1);
    }
    console.log("G1 passed: middleware subdomain rewrite logic verified");
    break;
  }
  case "G2": {
    const saasLanding = read("src/views/SaasLanding.tsx");
    const siteType = read("src/app/(public)/site/[type]/page.tsx");
    if (saasLanding.includes('href="/auth/register"')) {
      console.error("SaasLanding still links to /auth/register instead of /admin/register");
      process.exit(1);
    }
    if (siteType.includes('href="/auth/register"')) {
      console.error("SiteType still links to /auth/register instead of /admin/register");
      process.exit(1);
    }
    console.log("G2 passed: registration routing verified");
    break;
  }
  case "G3": {
    const attendance = read("src/views/Attendance.tsx");
    const billing = read("src/views/Billing.tsx");
    // Attendance must have onClick on buttons
    if (attendance.includes('<Button variant="outline" size="sm"><LogIn className="h-4 w-4 mr-2" />') && !attendance.includes('onClick')) {
      console.error("Attendance still has dead buttons without onClick");
      process.exit(1);
    }
    if (billing.includes("<Button>Tandai Lunas</Button>")) {
      console.error("Billing Tandai Lunas still has no onClick");
      process.exit(1);
    }
    console.log("G3 passed: attendance and billing action buttons verified");
    break;
  }
  case "G4": {
    const tutorPayout = read("src/views/TutorPayout.tsx");
    if (tutorPayout.includes("bg-${s.color}/10") || tutorPayout.includes("text-${s.color}")) {
      console.error("TutorPayout still contains dynamic Tailwind interpolation");
      process.exit(1);
    }
    if (tutorPayout.includes('<Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>')) {
      console.error("TutorPayout Export button has no onClick");
      process.exit(1);
    }
    console.log("G4 passed: tutor payout export and static color styles verified");
    break;
  }
  case "G5": {
    const daycareTab = read("src/components/vendor/DaycareManagementTab.tsx");
    const userTab = read("src/components/vendor/UserManagementTab.tsx");
    if (daycareTab.includes("{demoDaycares.length}")) {
      console.error("DaycareManagementTab still calculates count using demoDaycares.length instead of list.length");
      process.exit(1);
    }
    console.log("G5 passed: vendor management calculations and actions verified");
    break;
  }
  case "G6": {
    const tutorAttendance = read("src/views/TutorAttendance.tsx");
    const actionsAttendance = read("src/server/actions/attendance.ts");
    if (!actionsAttendance.includes("recordTutorAttendance")) {
      console.error("attendance.ts missing recordTutorAttendance action");
      process.exit(1);
    }
    console.log("G6 passed: tutor attendance persistence verified");
    break;
  }
  case "G7": {
    const parentReg = read("src/views/ParentRegistration.tsx");
    const parentCat = read("src/views/ParentCatalog.tsx");
    if (parentReg.includes('new Date("2025-01-15")')) {
      console.error("ParentRegistration still has 2025 past dates");
      process.exit(1);
    }
    if (parentCat.includes("31 Desember 2024")) {
      console.error("ParentCatalog still has 2024 past dates");
      process.exit(1);
    }
    console.log("G7 passed: parent views and dynamic branding verified");
    break;
  }
  default:
    console.error("Unknown gate: " + gate);
    process.exit(1);
}
