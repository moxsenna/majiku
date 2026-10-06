CREATE TABLE "paycore_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"paycore_order_id" text NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now(),
	"raw_payload" jsonb,
	CONSTRAINT "paycore_events_paycore_order_id_unique" UNIQUE("paycore_order_id")
);
--> statement-breakpoint
CREATE TABLE "payment_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"parent_user_id" text,
	"external_order_id" text NOT NULL,
	"paycore_order_id" text,
	"product_key" text DEFAULT 'spp_invoice' NOT NULL,
	"amount" numeric NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"checkout_url" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "payment_orders_external_order_id_unique" UNIQUE("external_order_id"),
	CONSTRAINT "payment_orders_paycore_order_id_unique" UNIQUE("paycore_order_id")
);
--> statement-breakpoint
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_parent_user_id_user_id_fk" FOREIGN KEY ("parent_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;