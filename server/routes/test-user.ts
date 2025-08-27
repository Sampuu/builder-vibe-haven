import { RequestHandler } from "express";
import { supabase } from "../lib/supabase";

export const handleCreateTestUser: RequestHandler = async (req, res) => {
  try {
    // Create a test user directly in Supabase Auth using the admin API
    // This bypasses email validation issues
    
    const testUsers = [
      {
        email: 'admin@test.local',
        password: 'admin123456',
        name: 'Test Admin',
        role: 'admin'
      },
      {
        email: 'user@test.local',
        password: 'user123456', 
        name: 'Test User',
        role: 'user'
      },
      {
        email: 'police@test.local',
        password: 'police123456',
        name: 'Test Police',
        role: 'police'
      }
    ];

    const results = [];

    for (const userData of testUsers) {
      try {
        // Try to create the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              role: userData.role
            }
          }
        });

        results.push({
          email: userData.email,
          success: !authError,
          error: authError?.message || null,
          userId: authData?.user?.id || null
        });

      } catch (error) {
        results.push({
          email: userData.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.status(200).json({
      message: "Test user creation attempted",
      results,
      instructions: {
        workaround: "If email validation fails, you can:",
        steps: [
          "1. Go to your Supabase Dashboard",
          "2. Navigate to Authentication > Users", 
          "3. Click 'Add user' to manually create test users",
          "4. Use these credentials to test login:",
          "   - admin@test.local / admin123456",
          "   - user@test.local / user123456",
          "   - police@test.local / police123456"
        ]
      }
    });

  } catch (error) {
    console.error('Test user creation error:', error);
    res.status(500).json({
      error: "Failed to create test users",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
