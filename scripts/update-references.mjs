import fs from 'node:fs';
import path from 'node:path';

const files = [
  'src/app/(admin)/layout.tsx',
  'src/components/parent/ProgramInfoBanner.tsx',
  'src/lib/demoData.ts',
  'src/server/actions/adminDashboard.ts',
  'src/server/actions/laporanHarian.ts',
  'src/server/actions/parentChildren.ts',
  'src/server/actions/tutorDashboard.ts',
  'src/views/DaycareMarketplace.tsx',
  'src/views/ParentProfile.tsx',
  'src/views/TutorDashboard.tsx',
  'src/views/TutorSaya.tsx',
  'src/views/VendorSite.tsx',
  'scripts/seed-bunayo-demo.ts',
  'scripts/verify-bunayo-demo-sync.ts',
  'scripts/seed.ts',
  'scripts/download-images.mjs',
];

for (const file of files) {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  // Replace /images/... .jpg with .webp
  const updated = content.replace(/(\/images\/[^"'\s]+)\.jpg/g, '$1.webp');

  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Updated: ${file}`);
  }
}
