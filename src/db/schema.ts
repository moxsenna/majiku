import {
  pgEnum,
  pgTable,
  text,
  integer,
  numeric,
  boolean,
  date,
  time,
  timestamp,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";

export const appRole = pgEnum("app_role", ["admin", "moderator", "user", "parent", "tutor"]);
export const attendanceStatus = pgEnum("attendance_status", ["present", "absent", "late", "permit"]);
export const permitType = pgEnum("permit_type", ["sick", "family", "other"]);
export const invoiceStatus = pgEnum("invoice_status", ["unpaid", "paid", "overdue", "partial"]);
export const waitingListStatus = pgEnum("waiting_list_status", ["waiting", "notified", "confirmed", "expired", "cancelled"]);
export const ticketPriority = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"]);
export const ticketStatus = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
export const trialStatus = pgEnum("trial_status", ["submitted", "scheduled", "awaiting_review", "recommended", "repeat_trial", "not_suitable", "admitted"]);
export const trialRecommendation = pgEnum("trial_recommendation", ["suitable", "repeat_trial", "not_suitable"]);
export const tenantType = pgEnum("tenant_type", ["daycare", "preschool", "bimbel"]);
export const reportStatus = pgEnum("report_status", ["draft", "submitted"]);

export interface TenantProgram {
  name: string;
  ageRange: string;
  priceFrom: string;
}

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  type: tenantType("type").notNull().default("daycare"),
  tagline: text("tagline"),
  description: text("description"),
  city: text("city").notNull(),
  address: text("address"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  priceFrom: numeric("price_from").notNull(),
  programs: jsonb("programs").$type<TenantProgram[]>().default([]),
  photos: jsonb("photos").$type<string[]>().default([]),
  whatsapp: text("whatsapp"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type TenantRow = typeof tenants.$inferSelect;

// BetterAuth (skema bawaan better-auth/adapters/drizzle)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Domain (port dari supabase/migrations; parent_user_id dsb. sekarang menunjuk user.id BetterAuth)
export const userRoles = pgTable("user_roles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: appRole("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique("user_roles_user_id_role_key").on(t.userId, t.role)]);

export const classes = pgTable("classes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  capacity: integer("capacity"),
  pricePerMonth: numeric("price_per_month"),
  sessionsPerMonth: integer("sessions_per_month"),
  schedule: text("schedule"),
  location: text("location"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const tutors = pgTable("tutors", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }).unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  photoUrl: text("photo_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const tutorClassAssignments = pgTable("tutor_class_assignments", {
  id: text("id").primaryKey(),
  tutorId: text("tutor_id").notNull().references(() => tutors.id, { onDelete: "cascade" }),
  classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  ratePerSession: numeric("rate_per_session"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => [unique("tutor_class_assignments_tutor_id_class_id_key").on(t.tutorId, t.classId)]);

export const tutorBonuses = pgTable("tutor_bonuses", {
  id: text("id").primaryKey(),
  tutorId: text("tutor_id").notNull().references(() => tutors.id, { onDelete: "cascade" }),
  amount: numeric("amount").notNull(),
  description: text("description"),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const students = pgTable("students", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  dateOfBirth: date("date_of_birth"),
  parentUserId: text("parent_user_id").references(() => user.id, { onDelete: "set null" }),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
  parentEmail: text("parent_email"),
  photoUrl: text("photo_url"),
  registrationDate: date("registration_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const studentEnrollments = pgTable("student_enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  sessionsQuota: integer("sessions_quota"),
  sessionsUsed: integer("sessions_used").default(0),
  freePermitsAllowed: integer("free_permits_allowed").default(0),
  freePermitsUsed: integer("free_permits_used").default(0),
  enrollmentDate: date("enrollment_date"),
  billingDay: integer("billing_day"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => [unique("student_enrollments_student_id_class_id_key").on(t.studentId, t.classId)]);

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  enrollmentId: text("enrollment_id").references(() => studentEnrollments.id, { onDelete: "set null" }),
  date: date("date").notNull(),
  status: attendanceStatus("status").notNull(),
  checkInTime: time("check_in_time"),
  checkOutTime: time("check_out_time"),
  permitType: permitType("permit_type"),
  permitReason: text("permit_reason"),
  isFreePermit: boolean("is_free_permit").default(false),
  checkedInBy: text("checked_in_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  enrollmentId: text("enrollment_id").references(() => studentEnrollments.id, { onDelete: "set null" }),
  amount: numeric("amount").notNull(),
  discount: numeric("discount").default("0"),
  total: numeric("total").notNull(),
  status: invoiceStatus("status").notNull().default("unpaid"),
  billingPeriodStart: date("billing_period_start"),
  billingPeriodEnd: date("billing_period_end"),
  dueDate: date("due_date"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const waitingList = pgTable("waiting_list", {
  id: text("id").primaryKey(),
  studentName: text("student_name").notNull(),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
  parentEmail: text("parent_email"),
  parentUserId: text("parent_user_id").references(() => user.id, { onDelete: "set null" }),
  classId: text("class_id").references(() => classes.id, { onDelete: "set null" }),
  status: waitingListStatus("status").notNull().default("waiting"),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  priority: integer("priority").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const trialApplications = pgTable("trial_applications", {
  id: text("id").primaryKey(),
  parentUserId: text("parent_user_id").references(() => user.id, { onDelete: "set null" }),
  programKey: text("program_key"),
  classId: text("class_id").references(() => classes.id, { onDelete: "set null" }),
  tutorId: text("tutor_id").references(() => tutors.id, { onDelete: "set null" }),
  childName: text("child_name").notNull(),
  childNickname: text("child_nickname"),
  childBirthDate: date("child_birth_date"),
  childGender: text("child_gender"),
  allergies: text("allergies"),
  medicalNotes: text("medical_notes"),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
  parentEmail: text("parent_email"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  requestedStartDate: date("requested_start_date"),
  parentNotes: text("parent_notes"),
  trialScheduledAt: timestamp("trial_scheduled_at", { withTimezone: true }),
  trialCompletedAt: timestamp("trial_completed_at", { withTimezone: true }),
  status: trialStatus("status").notNull().default("submitted"),
  recommendation: trialRecommendation("recommendation"),
  observationNotes: text("observation_notes"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  admittedAt: timestamp("admitted_at", { withTimezone: true }),
  admittedStudentId: text("admitted_student_id").references(() => students.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const dailyReports = pgTable("daily_reports", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  classId: text("class_id").references(() => classes.id, { onDelete: "set null" }),
  tutorUserId: text("tutor_user_id").references(() => user.id, { onDelete: "set null" }),
  reportDate: date("report_date").notNull(),
  mood: text("mood"),
  meals: text("meals"),
  nap: text("nap"),
  activities: text("activities"),
  notes: text("notes"),
  photos: jsonb("photos").$type<string[]>().default([]),
  status: reportStatus("status").notNull().default("submitted"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type DailyReportRow = typeof dailyReports.$inferSelect;

export const galleryPhotos = pgTable("gallery_photos", {
  id: text("id").primaryKey(),
  studentId: text("student_id").references(() => students.id, { onDelete: "set null" }),
  classId: text("class_id").references(() => classes.id, { onDelete: "set null" }),
  photoKey: text("photo_key").notNull(),
  caption: text("caption"),
  uploadedByUserId: text("uploaded_by_user_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type GalleryPhoto = typeof galleryPhotos.$inferSelect;

