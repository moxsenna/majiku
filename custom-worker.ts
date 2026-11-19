// Pembungkus worker OpenNext: tambahkan handler cron (N6) tanpa mengubah fetch.
// @ts-ignore — dibangkitkan oleh `opennextjs-cloudflare build`
import { default as handler } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,
  async scheduled(_event: unknown, env: { CRON_SECRET?: string }, ctx: { waitUntil(p: Promise<unknown>): void }) {
    const req = new Request("https://majiku.web.id/api/cron/pengingat-tagihan", {
      method: "POST",
      headers: { "x-cron-secret": env.CRON_SECRET ?? "" },
    });
    ctx.waitUntil(handler.fetch(req, env, ctx));
  },
};

// @ts-ignore
export { DOQueueHandler } from "./.open-next/worker.js";
