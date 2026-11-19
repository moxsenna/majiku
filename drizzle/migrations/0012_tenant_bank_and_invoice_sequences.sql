-- 0012: rekening lembaga (instruksi pembayaran manual) + sekuens nomor invoice per tenant.
-- Idempoten: aman dijalankan berulang.

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bank_account_number text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS bank_account_holder text;

CREATE TABLE IF NOT EXISTS invoice_sequences (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  period text NOT NULL,
  last integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);
-- Buat constraint unik hanya bila belum ada (guard manual karena IF NOT EXISTS
-- tidak didukung untuk ADD CONSTRAINT di Postgres lama).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoice_sequences_tenant_id_period_key'
  ) THEN
    ALTER TABLE invoice_sequences
      ADD CONSTRAINT invoice_sequences_tenant_id_period_key UNIQUE (tenant_id, period);
  END IF;
END $$;
