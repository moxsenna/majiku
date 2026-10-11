import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  // Origin tepercaya untuk validasi CSRF/origin di subdomain produksi
  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? [
          "https://majiku.web.id",
          "https://www.majiku.web.id",
          "https://admin.majiku.web.id",
          "https://parent.majiku.web.id",
          "https://tutor.majiku.web.id",
          "https://vendor.majiku.web.id",
          "https://majiku.moxsenna.workers.dev",
        ]
      : undefined,
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === "production" ? ".majiku.web.id" : undefined,
    },
  },
});
