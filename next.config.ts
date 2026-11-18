import { withReticle } from '@reticlehq/next';
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    return [
      { source: "/demo", destination: "/vendor", permanent: false },
      { source: "/vendor/dashboard", destination: "/vendor", permanent: true },
      // IA Bunayo: URL lama admin → lokasi barunya (307 sementara agar mudah dibatalkan)
      { source: "/birthdays", destination: "/dashboard", permanent: false },
      { source: "/gallery", destination: "/daily-reports/foto", permanent: false },
      { source: "/tutor-payout", destination: "/billing/honor", permanent: false },
      { source: "/tutors", destination: "/settings/staff", permanent: false },
    ];
  },
};

export default withReticle(nextConfig);
