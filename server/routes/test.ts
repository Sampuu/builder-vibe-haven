import { RequestHandler } from "express";
import { supabase } from "../lib/supabase";

export const handleSupabaseTest: RequestHandler = async (req, res) => {
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getUser();
    
    res.status(200).json({
      connected: true,
      error: error?.message || null,
      projectUrl: process.env.SUPABASE_URL,
      hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Supabase connection test error:', error);
    res.status(500).json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      projectUrl: process.env.SUPABASE_URL,
      hasAnonKey: !!process.env.SUPABASE_ANON_KEY
    });
  }
};

export const handleSupabaseAuthTest: RequestHandler = async (req, res) => {
  try {
    // Test auth functionality with a simple email format
    const { data, error } = await supabase.auth.signUp({
      email: 'user@demo.com',
      password: 'testpassword123'
    });

    res.status(200).json({
      authEndpointWorking: true,
      error: error?.message || null,
      data: data ? 'Success' : 'No data returned',
      needsEmailConfirmation: data?.user && !data.session
    });

  } catch (error) {
    console.error('Supabase auth test error:', error);
    res.status(500).json({
      authEndpointWorking: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
