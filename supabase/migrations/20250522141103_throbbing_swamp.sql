/*
  # Authentication System Enhancement
  
  1. New Tables
    - `otps` table for storing one-time passwords
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `code` (text)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `face_data` table for storing facial recognition data
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `descriptor` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create OTP table
CREATE TABLE IF NOT EXISTS otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create face data table
CREATE TABLE IF NOT EXISTS face_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  descriptor JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own OTPs"
  ON otps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own face data"
  ON face_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own face data"
  ON face_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);