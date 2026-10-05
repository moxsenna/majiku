"use server";

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { students, studentEnrollments, classes } from "@/db/schema";
import { auth } from "@/server/auth";
import { getMyRoles, type AppRole } from "@/server/actions/roles";
import { todayInWib, isValidDateString } from "@/lib/datetime";

export interface BirthdayEntry {
  id: string;
  name: string;
  className: string | null;
  birthDate: string;
  turningAge: number;
  daysUntil: number;
  parentName: string | null;
  parentPhone: string | null;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getBirthdayInYear(
  birthMonth: number,
  birthDay: number,
  year: number
): { month: number; day: number } {
  if (birthMonth === 2 && birthDay === 29 && !isLeapYear(year)) {
    return { month: 3, day: 1 };
  }
  return { month: birthMonth, day: birthDay };
}

function computeBirthdayDetails(
  birthDateStr: string,
  todayStr: string
): { daysUntil: number; turningAge: number } | null {
  if (!birthDateStr || !isValidDateString(birthDateStr)) return null;

  const [birthYear, birthMonth, birthDay] = birthDateStr.split("-").map(Number);
  const [todayYear, todayMonth, todayDay] = todayStr.split("-").map(Number);

  if (!birthYear || !birthMonth || !birthDay || !todayYear || !todayMonth || !todayDay) {
    return null;
  }

  const thisYearBday = getBirthdayInYear(birthMonth, birthDay, todayYear);
  const hasPassed =
    thisYearBday.month < todayMonth ||
    (thisYearBday.month === todayMonth && thisYearBday.day < todayDay);

  const targetYear = hasPassed ? todayYear + 1 : todayYear;
  const targetBday = getBirthdayInYear(birthMonth, birthDay, targetYear);

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const targetUtc = Date.UTC(targetYear, targetBday.month - 1, targetBday.day);
  const todayUtc = Date.UTC(todayYear, todayMonth - 1, todayDay);
  const diffDays = Math.round((targetUtc - todayUtc) / MS_PER_DAY);

  const turningAge = targetYear - birthYear;

  return {
    daysUntil: diffDays,
    turningAge,
  };
}

async function getSessionSafely() {
  try {
    const h = await headers();
    return await auth.api.getSession({ headers: h });
  } catch {
    return null;
  }
}

export async function getUpcomingBirthdays(refDateStr?: string): Promise<BirthdayEntry[]> {
  const session = await getSessionSafely();
  if (!session) return [];

  const roles: AppRole[] = await getMyRoles().catch(() => []);
  if (!roles.includes("admin") && !roles.includes("moderator")) return [];

  const todayStr =
    refDateStr && isValidDateString(refDateStr) ? refDateStr : todayInWib();

  const rows = await db
    .select({
      id: students.id,
      name: students.name,
      dateOfBirth: students.dateOfBirth,
      parentName: students.parentName,
      parentPhone: students.parentPhone,
      className: classes.name,
    })
    .from(students)
    .leftJoin(
      studentEnrollments,
      and(
        eq(students.id, studentEnrollments.studentId),
        eq(studentEnrollments.isActive, true)
      )
    )
    .leftJoin(
      classes,
      and(
        eq(studentEnrollments.classId, classes.id),
        eq(classes.isActive, true)
      )
    )
    .where(eq(students.isActive, true));

  interface AggregatedStudent {
    id: string;
    name: string;
    dateOfBirth: string | null;
    parentName: string | null;
    parentPhone: string | null;
    classNames: Set<string>;
  }

  const studentMap = new Map<string, AggregatedStudent>();
  for (const row of rows) {
    let student = studentMap.get(row.id);
    if (!student) {
      student = {
        id: row.id,
        name: row.name,
        dateOfBirth: row.dateOfBirth,
        parentName: row.parentName,
        parentPhone: row.parentPhone,
        classNames: new Set<string>(),
      };
      studentMap.set(row.id, student);
    }
    if (row.className && row.className.trim()) {
      student.classNames.add(row.className.trim());
    }
  }

  const entries: BirthdayEntry[] = [];

  for (const student of studentMap.values()) {
    if (!student.dateOfBirth) continue;

    const details = computeBirthdayDetails(student.dateOfBirth, todayStr);
    if (!details) continue;

    if (details.daysUntil >= 0 && details.daysUntil <= 30) {
      const className =
        student.classNames.size > 0
          ? Array.from(student.classNames).join(", ")
          : null;

      entries.push({
        id: student.id,
        name: student.name,
        className,
        birthDate: student.dateOfBirth,
        turningAge: details.turningAge,
        daysUntil: details.daysUntil,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
      });
    }
  }

  entries.sort((a, b) => {
    if (a.daysUntil !== b.daysUntil) {
      return a.daysUntil - b.daysUntil;
    }
    return a.name.localeCompare(b.name, "id");
  });

  return entries;
}
