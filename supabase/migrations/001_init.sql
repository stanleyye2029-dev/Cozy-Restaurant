-- supabase/migrations/001_init.sql
-- Initial example table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "notes" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  inserted_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS) and create a basic policy allowing owners
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes" ON "notes"
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
