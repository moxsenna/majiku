import { isDemoEmail } from "../src/lib/demo";

const cases = [
  { email: "admin@majiku.test", expected: true },
  { email: "rina@majiku.test", expected: true },
  { email: "parent@majiku.test", expected: true },
  { email: "demo@majiku.id", expected: true },
  { email: "demo+trial@gmail.com", expected: true },
  { email: "moxsenna@gmail.com", expected: false },
  { email: "budi@daycare.com", expected: false },
  { email: undefined, expected: false },
  { email: null, expected: false },
];

let failed = 0;
for (const c of cases) {
  const result = isDemoEmail(c.email);
  if (result !== c.expected) {
    console.error(`FAIL: ${c.email} -> got ${result}, expected ${c.expected}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed.`);
  process.exit(1);
}

console.log("PASS: isDemoEmail test suite passed 100%");
