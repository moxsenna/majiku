CREATE TYPE "public"."tenant_type" AS ENUM('daycare', 'preschool', 'bimbel');--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"type" "tenant_type" DEFAULT 'daycare' NOT NULL,
	"tagline" text,
	"description" text,
	"city" text NOT NULL,
	"address" text,
	"latitude" numeric,
	"longitude" numeric,
	"price_from" numeric NOT NULL,
	"programs" jsonb DEFAULT '[]'::jsonb,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"whatsapp" text,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
