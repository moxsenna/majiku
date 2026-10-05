CREATE TYPE "public"."report_status" AS ENUM('draft', 'submitted');--> statement-breakpoint
CREATE TABLE "daily_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"class_id" text,
	"tutor_user_id" text,
	"report_date" date NOT NULL,
	"mood" text,
	"meals" text,
	"nap" text,
	"activities" text,
	"notes" text,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"status" "report_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_tutor_user_id_user_id_fk" FOREIGN KEY ("tutor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;