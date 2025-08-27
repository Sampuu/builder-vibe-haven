import { RequestHandler } from "express";
import { supabase } from "../lib/supabase";

export const handleDatabaseSetup: RequestHandler = async (req, res) => {
  try {
    // Check if user_profiles table exists and create it if not
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, provide setup instructions
      return res.status(200).json({
        message: "Database setup required",
        instructions: {
          step1: "Go to your Supabase dashboard",
          step2: "Navigate to the SQL Editor",
          step3: "Run the following SQL command:",
          sql: `
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'police', 'fire', 'ambulance', 'hospital', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Anyone can insert profiles" 
ON user_profiles FOR INSERT 
WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
BEFORE UPDATE ON user_profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
          `,
          step4: "After running the SQL, try the authentication endpoints again"
        }
      });
    } else if (error) {
      console.error('Database check error:', error);
      return res.status(500).json({
        error: "Database connection error",
        details: error.message
      });
    } else {
      // Table exists
      return res.status(200).json({
        message: "Database is properly configured",
        tableExists: true
      });
    }
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
