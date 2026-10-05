CREATE TABLE "gallery_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text,
	"class_id" text,
	"photo_key" text NOT NULL,
	"caption" text,
	"uploaded_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_uploaded_by_user_id_user_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;