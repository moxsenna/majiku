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
    ];
  },
};

export default withReticle(nextConfig);
