"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import {
  aliasedTable,
  and,
  asc,
  desc,
  eq,
  isNotNull,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import {
  classes,
  conversations,
  messages,
  studentEnrollments,
  students,
  tutorClassAssignments,
  tutors,
  user,
} from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";

export interface ConversationSummary {
  id: string;
  partnerName: string;
  partnerUserId: string;
  studentName: string | null;
  lastMessageBody: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
}

export interface ChatPartner {
  userId: string;
  name: string;
  role: "tutor" | "parent";
  contextName: string;
}

export interface ChatMessage {
  id: string;
  senderUserId: string;
  senderName: string;
  body: string;
  createdAt: Date | null;
  readAt: Date | null;
  isMine: boolean;
}

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

export async function listMyConversations(): Promise<ConversationSummary[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isParent = roles.includes("parent") || roles.includes("admin");
  const isTutor = roles.includes("tutor") || roles.includes("admin");

  if (!isParent && !isTutor) return [];

  const parentUser = aliasedTable(user, "parent_user");
  const tutorUser = aliasedTable(user, "tutor_user");

  let condition;
  if (isParent && isTutor) {
    condition = or(
      eq(conversations.parentUserId, session.user.id),
      eq(conversations.tutorUserId, session.user.id)
    );
  } else if (isParent) {
    condition = eq(conversations.parentUserId, session.user.id);
  } else {
    condition = eq(conversations.tutorUserId, session.user.id);
  }

  const partnerNameExpr = sql<string>`CASE WHEN ${conversations.parentUserId} = ${session.user.id} THEN ${tutorUser.name} ELSE ${parentUser.name} END`;
  const partnerUserIdExpr = sql<string>`CASE WHEN ${conversations.parentUserId} = ${session.user.id} THEN ${conversations.tutorUserId} ELSE ${conversations.parentUserId} END`;

  const lastMessageBodyExpr = sql<string | null>`(
    SELECT ${messages.body}
    FROM ${messages}
    WHERE ${messages.conversationId} = ${conversations.id}
    ORDER BY ${messages.createdAt} DESC
    LIMIT 1
  )`;

  const unreadCountExpr = sql<number>`(
    SELECT count(*)::int
    FROM ${messages}
    WHERE ${messages.conversationId} = ${conversations.id}
      AND ${messages.senderUserId} != ${session.user.id}
      AND ${messages.readAt} IS NULL
  )`.mapWith(Number);

  const rows = await db
    .select({
      id: conversations.id,
      partnerName: partnerNameExpr,
      partnerUserId: partnerUserIdExpr,
      studentName: students.name,
      lastMessageBody: lastMessageBodyExpr,
      lastMessageAt: conversations.lastMessageAt,
      unreadCount: unreadCountExpr,
    })
    .from(conversations)
    .innerJoin(parentUser, eq(conversations.parentUserId, parentUser.id))
    .innerJoin(tutorUser, eq(conversations.tutorUserId, tutorUser.id))
    .leftJoin(students, eq(conversations.studentId, students.id))
    .where(condition)
    .orderBy(
      sql`${conversations.lastMessageAt} DESC NULLS LAST`,
      desc(conversations.createdAt)
    );

  return rows.map((r) => ({
    id: r.id,
    partnerName: r.partnerName,
    partnerUserId: r.partnerUserId,
    studentName: r.studentName,
    lastMessageBody: r.lastMessageBody,
    lastMessageAt: r.lastMessageAt,
    unreadCount: Number(r.unreadCount) || 0,
  }));
}

export async function getChatPartners(): Promise<ChatPartner[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isParent = roles.includes("parent") || roles.includes("admin");
  const isTutor = roles.includes("tutor") || roles.includes("admin");

  if (!isParent && !isTutor) return [];

  const partners: ChatPartner[] = [];

  if (isParent) {
    const tutorRows = await db
      .select({
        tutorUserId: tutors.userId,
        tutorName: tutors.name,
        userName: user.name,
        className: classes.name,
      })
      .from(students)
      .innerJoin(
        studentEnrollments,
        and(
          eq(studentEnrollments.studentId, students.id),
          eq(studentEnrollments.isActive, true)
        )
      )
      .innerJoin(
        classes,
        and(
          eq(classes.id, studentEnrollments.classId),
          eq(classes.isActive, true)
        )
      )
      .innerJoin(
        tutorClassAssignments,
        and(
          eq(tutorClassAssignments.classId, classes.id),
          eq(tutorClassAssignments.isActive, true)
        )
      )
      .innerJoin(
        tutors,
        and(
          eq(tutors.id, tutorClassAssignments.tutorId),
          eq(tutors.isActive, true)
        )
      )
      .innerJoin(user, eq(user.id, tutors.userId))
      .where(
        and(
          session.user.email
            ? or(
                eq(students.parentUserId, session.user.id),
                eq(students.parentEmail, session.user.email)
              )
            : eq(students.parentUserId, session.user.id),
          eq(students.isActive, true),
          isNotNull(tutors.userId),
          ne(tutors.userId, session.user.id)
        )
      );

    const tutorMap = new Map<
      string,
      { userId: string; name: string; classes: Set<string> }
    >();

    for (const row of tutorRows) {
      if (!row.tutorUserId) continue;
      const existing = tutorMap.get(row.tutorUserId);
      if (!existing) {
        tutorMap.set(row.tutorUserId, {
          userId: row.tutorUserId,
          name: row.userName || row.tutorName,
          classes: new Set([row.className]),
        });
      } else {
        existing.classes.add(row.className);
      }
    }

    for (const t of tutorMap.values()) {
      partners.push({
        userId: t.userId,
        name: t.name,
        role: "tutor",
        contextName: Array.from(t.classes).join(", "),
      });
    }
  }

  if (isTutor) {
    const tutorProfile = await db
      .select({ id: tutors.id })
      .from(tutors)
      .where(
        and(
          session.user.email
            ? or(eq(tutors.userId, session.user.id), eq(tutors.email, session.user.email))
            : eq(tutors.userId, session.user.id),
          eq(tutors.isActive, true)
        )
      )
      .limit(1);

    if (tutorProfile.length > 0) {
      const parentRows = await db
        .select({
          parentUserId: students.parentUserId,
          parentName: user.name,
          studentName: students.name,
          className: classes.name,
        })
        .from(tutorClassAssignments)
        .innerJoin(
          classes,
          and(
            eq(classes.id, tutorClassAssignments.classId),
            eq(classes.isActive, true)
          )
        )
        .innerJoin(
          studentEnrollments,
          and(
            eq(studentEnrollments.classId, classes.id),
            eq(studentEnrollments.isActive, true)
          )
        )
        .innerJoin(
          students,
          and(
            eq(students.id, studentEnrollments.studentId),
            eq(students.isActive, true),
            isNotNull(students.parentUserId)
          )
        )
        .innerJoin(user, eq(user.id, students.parentUserId))
        .where(
          and(
            eq(tutorClassAssignments.tutorId, tutorProfile[0].id),
            eq(tutorClassAssignments.isActive, true),
            ne(students.parentUserId, session.user.id)
          )
        );

      const parentMap = new Map<
        string,
        { userId: string; name: string; contexts: Set<string> }
      >();

      for (const row of parentRows) {
        if (!row.parentUserId) continue;
        const existing = parentMap.get(row.parentUserId);
        const contextItem = `${row.studentName} (${row.className})`;
        if (!existing) {
          parentMap.set(row.parentUserId, {
            userId: row.parentUserId,
            name: row.parentName || "Orang Tua",
            contexts: new Set([contextItem]),
          });
        } else {
          existing.contexts.add(contextItem);
        }
      }

      for (const p of parentMap.values()) {
        if (!partners.some((existing) => existing.userId === p.userId)) {
          partners.push({
            userId: p.userId,
            name: p.name,
            role: "parent",
            contextName: Array.from(p.contexts).join(", "),
          });
        }
      }
    }
  }

  return partners;
}

export async function startOrGetConversation(
  partnerUserId: string,
  studentId?: string
): Promise<{ id: string }> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login");
  }

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  const isAllowedRole = roles.some((r) =>
    ["parent", "tutor", "admin"].includes(r)
  );
  if (!isAllowedRole) {
    throw new Error("Hanya parent, tutor, atau admin yang dapat memulai percakapan");
  }

  const partners = await getChatPartners();
  const validPartner = partners.find((p) => p.userId === partnerUserId);
  if (!validPartner) {
    throw new Error("Tidak dapat memulai percakapan dengan pengguna ini");
  }

  let parentUserId: string;
  let tutorUserId: string;

  if (validPartner.role === "tutor") {
    parentUserId = session.user.id;
    tutorUserId = validPartner.userId;
  } else {
    parentUserId = validPartner.userId;
    tutorUserId = session.user.id;
  }

  const existing = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.parentUserId, parentUserId),
        eq(conversations.tutorUserId, tutorUserId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { id: existing[0].id };
  }

  const newId = randomUUID();
  const now = new Date();

  try {
    await db.insert(conversations).values({
      id: newId,
      parentUserId,
      tutorUserId,
      studentId: studentId ?? null,
      createdAt: now,
      updatedAt: now,
    });
    return { id: newId };
  } catch {
    const fallback = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.parentUserId, parentUserId),
          eq(conversations.tutorUserId, tutorUserId)
        )
      )
      .limit(1);

    if (fallback.length > 0) {
      return { id: fallback[0].id };
    }
    throw new Error("Gagal memulai percakapan");
  }
}

export async function getMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login");
  }

  const conv = await db
    .select({
      id: conversations.id,
      parentUserId: conversations.parentUserId,
      tutorUserId: conversations.tutorUserId,
    })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (conv.length === 0) {
    throw new Error("Percakapan tidak ditemukan");
  }

  const c = conv[0];
  if (c.parentUserId !== session.user.id && c.tutorUserId !== session.user.id) {
    throw new Error("Percakapan tidak ditemukan");
  }

  const rows = await db
    .select({
      id: messages.id,
      senderUserId: messages.senderUserId,
      senderName: user.name,
      body: messages.body,
      createdAt: messages.createdAt,
      readAt: messages.readAt,
    })
    .from(messages)
    .innerJoin(user, eq(messages.senderUserId, user.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  return rows.map((r) => ({
    id: r.id,
    senderUserId: r.senderUserId,
    senderName: r.senderName || "Pengguna",
    body: r.body,
    createdAt: r.createdAt,
    readAt: r.readAt,
    isMine: r.senderUserId === session.user.id,
  }));
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<{ id: string }> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login");
  }

  const trimmed = (body ?? "").trim();
  if (trimmed.length === 0) {
    throw new Error("Pesan tidak boleh kosong");
  }
  if (trimmed.length > 2000) {
    throw new Error("Pesan maksimal 2000 karakter");
  }

  const conv = await db
    .select({
      id: conversations.id,
      parentUserId: conversations.parentUserId,
      tutorUserId: conversations.tutorUserId,
    })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (
    conv.length === 0 ||
    (conv[0].parentUserId !== session.user.id &&
      conv[0].tutorUserId !== session.user.id)
  ) {
    throw new Error("Percakapan tidak ditemukan");
  }

  const messageId = randomUUID();
  const now = new Date();

  await db.insert(messages).values({
    id: messageId,
    conversationId,
    senderUserId: session.user.id,
    body: trimmed,
    createdAt: now,
  });

  await db
    .update(conversations)
    .set({
      lastMessageAt: now,
      updatedAt: now,
    })
    .where(eq(conversations.id, conversationId));

  return { id: messageId };
}

export async function markConversationRead(
  conversationId: string
): Promise<void> {
  const session = await getSessionSafely();
  if (!session) {
    throw new Error("Unauthorized: Anda harus login");
  }

  const conv = await db
    .select({
      id: conversations.id,
      parentUserId: conversations.parentUserId,
      tutorUserId: conversations.tutorUserId,
    })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (
    conv.length === 0 ||
    (conv[0].parentUserId !== session.user.id &&
      conv[0].tutorUserId !== session.user.id)
  ) {
    throw new Error("Percakapan tidak ditemukan");
  }

  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        ne(messages.senderUserId, session.user.id),
        isNull(messages.readAt)
      )
    );
}
