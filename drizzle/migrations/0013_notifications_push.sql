-- 0013: notifikasi in-app + langganan Web Push. Idempoten.

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  tenant_id text,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON notifications (user_id, read_at);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON notifications (user_id, created_at);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions (user_id);
