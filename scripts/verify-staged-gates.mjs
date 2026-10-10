import fs from "node:fs";
import path from "node:path";

const gate = process.argv[2];

if (!gate) {
  console.error("Usage: node scripts/verify-staged-gates.mjs <G1|G2|G3|G4|G5|G6|G7>");
  process.exit(1);
}

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf-8");
}

switch (gate) {
  case "G1": {
    const wrangler = read("wrangler.jsonc");
    if (!wrangler.includes('"binding": "PHOTOS_BUCKET"')) {
      console.error("wrangler.jsonc missing PHOTOS_BUCKET binding");
      process.exit(1);
    }
    console.log("G1 passed: wrangler.jsonc R2 bucket binding verified");
    break;
  }
  case "G2": {
    if (!fs.existsSync(path.join(root, "src/app/error.tsx"))) {
      console.error("src/app/error.tsx does not exist");
      process.exit(1);
    }
    const errorPage = read("src/app/error.tsx");
    if (!errorPage.includes("reset") || !errorPage.includes("use client")) {
      console.error("src/app/error.tsx missing reset or use client");
      process.exit(1);
    }
    console.log("G2 passed: global error boundary verified");
    break;
  }
  case "G3": {
    const notFound = read("src/views/NotFound.tsx");
    if (notFound.includes("Oops! Page not found")) {
      console.error("NotFound.tsx still in English");
      process.exit(1);
    }
    console.log("G3 passed: localized 404 page verified");
    break;
  }
  case "G4": {
    const auth = read("src/server/auth.ts");
    if (!auth.includes("rateLimit")) {
      console.error("auth.ts missing rateLimit configuration");
      process.exit(1);
    }
    console.log("G4 passed: auth rate limiting verified");
    break;
  }
  case "G5": {
    const bottomNav = read("src/components/dashboard/AdminBottomNav.tsx");
    if (bottomNav.includes('demoUnpaidBilling') || bottomNav.includes('onClick: () => setBillingOpen(true)')) {
      console.error("AdminBottomNav still uses fake demo sheet popups");
      process.exit(1);
    }
    console.log("G5 passed: mobile admin navigation routes verified");
    break;
  }
  case "G6": {
    const authReg = read("src/server/actions/authRegistration.ts");
    if (!authReg.includes("tenants") || !authReg.includes("insert(tenants)")) {
      console.error("authRegistration.ts does not insert into tenants table");
      process.exit(1);
    }
    console.log("G6 passed: tenant creation upon admin registration verified");
    break;
  }
  case "G7": {
    const pkg = JSON.parse(read("package.json"));
    if (pkg.name !== "majiku") {
      console.error("package.json name is not majiku");
      process.exit(1);
    }
    if (!fs.existsSync(path.join(root, ".env.example"))) {
      console.error(".env.example does not exist");
      process.exit(1);
    }
    console.log("G7 passed: package metadata and env template verified");
    break;
  }
  default:
    console.error("Unknown gate: " + gate);
    process.exit(1);
}
