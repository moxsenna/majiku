import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { db } from "../src/db";
import { conversations, messages } from "../src/db/schema";

async function main() {
  console.log("Memulai seeding demo chat...");

  const now = new Date();
  const t1 = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 jam lalu
  const t1Read = new Date(now.getTime() - 3.9 * 60 * 60 * 1000);
  const t2 = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 jam lalu
  const t2Read = new Date(now.getTime() - 2.9 * 60 * 60 * 1000);
  const t3 = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 jam lalu
  const t4 = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 jam lalu
  const t5 = new Date(now.getTime() - 15 * 60 * 1000);     // 15 menit lalu

  // 1. Percakapan Demo conv1
  const convResult = await db
    .insert(conversations)
    .values([
      {
        id: "conv1",
        parentUserId: "usr_parent",
        tutorUserId: "usr_tutor",
        studentId: "stu_1",
        lastMessageAt: t5,
        createdAt: t1,
        updatedAt: t5,
      },
    ])
    .onConflictDoNothing()
    .returning();

  console.log(`Conversations inserted: ${convResult.length}`);

  // 2. 5 Pesan Demo
  const msgResult = await db
    .insert(messages)
    .values([
      {
        id: "msg1",
        conversationId: "conv1",
        senderUserId: "usr_tutor",
        body: "Selamat pagi Bu, anaknya hari ini senang sekali bermain",
        readAt: t1Read,
        createdAt: t1,
      },
      {
        id: "msg2",
        conversationId: "conv1",
        senderUserId: "usr_parent",
        body: "Terang Bu Rina, terima kasih update-nya",
        readAt: t2Read,
        createdAt: t2,
      },
      {
        id: "msg3",
        conversationId: "conv1",
        senderUserId: "usr_tutor",
        body: "Besok ada kegiatan melukis, mohon siapkan baju ganti ya",
        readAt: null,
        createdAt: t3,
      },
      {
        id: "msg4",
        conversationId: "conv1",
        senderUserId: "usr_parent",
        body: "Siap Bu, sudah disiapkan",
        readAt: null,
        createdAt: t4,
      },
      {
        id: "msg5",
        conversationId: "conv1",
        senderUserId: "usr_tutor",
        body: "Baik, terima kasih Bu",
        readAt: null,
        createdAt: t5,
      },
    ])
    .onConflictDoNothing()
    .returning();

  console.log(`Messages inserted: ${msgResult.length}`);

  // Query verifikasi total rows dan unread count
  const allConvs = await db.select({ count: sql<number>`count(*)::int` }).from(conversations);
  const allMsgs = await db.select({ count: sql<number>`count(*)::int` }).from(messages);

  const parentUnread = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messages)
    .where(
      sql`${messages.conversationId} = 'conv1' AND ${messages.senderUserId} != 'usr_parent' AND ${messages.readAt} IS NULL`
    );

  const tutorUnread = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messages)
    .where(
      sql`${messages.conversationId} = 'conv1' AND ${messages.senderUserId} != 'usr_tutor' AND ${messages.readAt} IS NULL`
    );

  console.log("Status database saat ini:");
  console.log(`- Total percakapan: ${allConvs[0].count}`);
  console.log(`- Total pesan: ${allMsgs[0].count}`);
  console.log(`- Unread untuk usr_parent: ${parentUnread[0].count} (ekspektasi: 2 - msg3 & msg5)`);
  console.log(`- Unread untuk usr_tutor: ${tutorUnread[0].count} (ekspektasi: 1 - msg4)`);
}

main()
  .then(() => {
    console.log("Seeding chat selesai.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Gagal seeding chat:", err);
    process.exit(1);
  });
