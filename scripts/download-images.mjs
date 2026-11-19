import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const downloads = [
  // Avatars & Reports
  { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80', dest: 'public/images/avatars/parent-rina.webp' },
  { url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80', dest: 'public/images/reports/report-art-activity.webp' },
  
  // Daycare Sunshine Kids
  { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80', dest: 'public/images/daycare/daycare-nap.webp' },
  { url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80', dest: 'public/images/daycare/daycare-meal.webp' },
  { url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80', dest: 'public/images/daycare/daycare-music.webp' },
  { url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80', dest: 'public/images/daycare/daycare-features.webp' },
  { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80', dest: 'public/images/daycare/daycare-uniform.webp' },
  { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', dest: 'public/images/daycare/daycare-supplies.webp' },
  { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&q=80', dest: 'public/images/daycare/daycare-photo-package.webp' },

  // Bimbel Ganesha Prestasi
  { url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80', dest: 'public/images/bimbel/bimbel-tryout.webp' },
  { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80', dest: 'public/images/bimbel/bimbel-graduation.webp' },
  { url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80', dest: 'public/images/bimbel/bimbel-consultation.webp' },
  { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', dest: 'public/images/bimbel/bimbel-groupstudy.webp' },
  { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80', dest: 'public/images/bimbel/bimbel-features.webp' },
  { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80', dest: 'public/images/bimbel/bimbel-book-sd.webp' },
  { url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80', dest: 'public/images/bimbel/bimbel-book-smp.webp' },
  { url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500&q=80', dest: 'public/images/bimbel/bimbel-online-video.webp' },

  // Promo & Catalog
  { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80', dest: 'public/images/promo/promo-buku.webp' },
  { url: 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=800&q=80', dest: 'public/images/promo/promo-snack.webp' },
  { url: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80', dest: 'public/images/promo/promo-family-day.webp' },
  { url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80', dest: 'public/images/promo/promo-mainan.webp' },
  { url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80', dest: 'public/images/promo/promo-perlengkapan.webp' },

  // Marketplace Daycare & Tenants
  { url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80', dest: 'public/images/marketplace/marketplace-bright-kids.webp' },
  { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', dest: 'public/images/marketplace/marketplace-bright-kids-2.webp' },
  { url: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&q=80', dest: 'public/images/marketplace/marketplace-bright-kids-3.webp' },
  { url: 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80', dest: 'public/images/marketplace/marketplace-little-stars.webp' },
  { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', dest: 'public/images/marketplace/marketplace-little-stars-2.webp' },
  { url: 'https://images.unsplash.com/photo-1564429238535-45095e0c8f7a?w=800&q=80', dest: 'public/images/marketplace/marketplace-happy-garden.webp' },
  { url: 'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=800&q=80', dest: 'public/images/marketplace/marketplace-ceria-kids.webp' },
  { url: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&q=80', dest: 'public/images/marketplace/marketplace-rainbow-learning.webp' },
  { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', dest: 'public/images/marketplace/tenant-lentera-kecil.webp' },
  { url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80', dest: 'public/images/marketplace/tenant-bintang-prestasi.webp' },
  { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80', dest: 'public/images/marketplace/tenant-tunas-harapan.webp' },
  { url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80', dest: 'public/images/marketplace/tenant-mentari-preschool.webp' },
  { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80', dest: 'public/images/marketplace/tenant-cerdas-ceria.webp' },
  { url: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=800&q=80', dest: 'public/images/marketplace/tenant-kasih-bunda.webp' },
  { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80', dest: 'public/images/marketplace/tenant-pelangi-preschool.webp' },
  { url: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=800&q=80', dest: 'public/images/marketplace/tenant-al-falah.webp' },
  { url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80', dest: 'public/images/marketplace/tenant-sahabat-kecil.webp' },

  // Landing Page Hero
  { url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=1200&q=80', dest: 'public/images/landing-hero.webp' }
];

async function downloadFile(url, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Saved: ${dest}`);
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  for (const item of downloads) {
    if (fs.existsSync(item.dest)) {
      console.log(`Already exists: ${item.dest}`);
      continue;
    }
    try {
      await downloadFile(item.url, item.dest);
    } catch (err) {
      console.error(`Error downloading ${item.dest}:`, err.message);
    }
  }
  console.log('All downloads completed!');
}

main();
