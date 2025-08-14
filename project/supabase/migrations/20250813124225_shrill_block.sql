/*
  # IBS Care AI - Initial Database Schema

  1. New Tables
    - `profiles` - User profile information and settings
    - `daily_logs` - Daily symptom and health tracking data
    - `chat_messages` - AI chat conversation history
    - `user_embeddings` - Vector embeddings for personalized AI responses

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Cascade deletes to maintain data integrity

  3. Extensions
    - Enable pgvector extension for embeddings (optional but recommended)

  4. Indexes
    - Add performance indexes for common queries
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  timezone text DEFAULT 'Asia/Kolkata',
  created_at timestamptz DEFAULT now()
);

-- Daily logs for symptom tracking
CREATE TABLE IF NOT EXISTS daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  log_date date NOT NULL,
  mood text,                    -- 'great', 'good', 'okay', 'bad', 'terrible'
  energy integer CHECK (energy >= 0 AND energy <= 10),
  symptom_severity integer CHECK (symptom_severity >= 0 AND symptom_severity <= 10),
  symptoms jsonb DEFAULT '[]'::jsonb,  -- array of {name: string, severity: number}
  sleep_hours numeric CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  water_ml integer CHECK (water_ml >= 0),
  meals text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- Chat messages for AI conversations
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,  -- sources, recommendations, etc.
  created_at timestamptz DEFAULT now()
);

-- User embeddings for personalized AI responses
CREATE TABLE IF NOT EXISTS user_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  embedding vector(1536),  -- Gemini embedding dimension
  doc jsonb NOT NULL,      -- reference document (log summary, chat context)
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_embeddings_user ON user_embeddings(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for daily_logs
CREATE POLICY "Users can manage their logs"
  ON daily_logs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for chat_messages
CREATE POLICY "Users can manage their messages"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_embeddings
CREATE POLICY "Users can manage their embeddings"
  ON user_embeddings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for daily_logs updated_at
CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();