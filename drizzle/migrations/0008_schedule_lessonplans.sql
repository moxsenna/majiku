CREATE TYPE "public"."plan_status" AS ENUM('draft', 'upcoming', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."schedule_type" AS ENUM('class', 'activity', 'event', 'holiday');--> statement-breakpoint
CREATE TABLE "class_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text,
	"title" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"location" text,
	"type" "schedule_type" DEFAULT 'class' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lesson_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text,
	"tutor_user_id" text,
	"title" text NOT NULL,
	"subject" text,
	"plan_date" date NOT NULL,
	"time_range" text,
	"objectives" jsonb DEFAULT '[]'::jsonb,
	"activities" jsonb DEFAULT '[]'::jsonb,
	"materials" jsonb DEFAULT '[]'::jsonb,
	"status" "plan_status" DEFAULT 'upcoming' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_tutor_user_id_user_id_fk" FOREIGN KEY ("tutor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;