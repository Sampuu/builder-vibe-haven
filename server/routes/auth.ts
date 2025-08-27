import { RequestHandler } from "express";
import { supabase, UserRole } from "../lib/supabase";
import { z } from "zod";

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['user', 'police', 'fire', 'ambulance', 'hospital', 'admin'] as const)
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['user', 'police', 'fire', 'ambulance', 'hospital', 'admin'] as const)
});

export const handleSignup: RequestHandler = async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const { email, password, name, role } = validatedData;

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (authError) {
      return res.status(400).json({ 
        error: authError.message 
      });
    }

    if (!authData.user) {
      return res.status(400).json({ 
        error: "Failed to create user account" 
      });
    }

    // Try to create user profile in our custom table (optional)
    let profileData = null;
    try {
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: authData.user.id,
            email,
            name,
            role
          }
        ])
        .select()
        .single();
      
      if (!profileError) {
        profileData = data;
      } else {
        console.warn('Profile creation failed (table may not exist):', profileError.message);
      }
    } catch (profileError) {
      console.warn('Profile table not available:', profileError);
    }

    // Return user data and session (works with or without profile table)
    res.status(201).json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || name,
        role: authData.user.user_metadata?.role || role
      },
      session: authData.session,
      profileCreated: !!profileData
    });

  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid input data",
        details: error.errors
      });
    }
    res.status(500).json({ 
      error: "Internal server error" 
    });
  }
};

export const handleSignin: RequestHandler = async (req, res) => {
  try {
    const validatedData = signinSchema.parse(req.body);
    const { email, password, role } = validatedData;

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ 
        error: authError.message 
      });
    }

    if (!authData.user || !authData.session) {
      return res.status(401).json({ 
        error: "Invalid credentials" 
      });
    }

    // Try to get user profile from our custom table (optional)
    let profileData = null;
    try {
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (!profileError) {
        profileData = data;
      } else {
        console.warn('Profile fetch failed (table may not exist):', profileError.message);
      }
    } catch (profileError) {
      console.warn('Profile table not available:', profileError);
    }

    const userRole = profileData?.role || authData.user.user_metadata?.role || 'user';

    // Verify role matches (optional security check)
    if (userRole !== role) {
      return res.status(403).json({ 
        error: `Access denied. Expected role: ${role}, actual role: ${userRole}` 
      });
    }

    // Return user data and session
    res.status(200).json({
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
        name: profileData?.name || authData.user.user_metadata?.name || 'User',
        role: userRole
      },
      session: authData.session
    });

  } catch (error) {
    console.error('Signin error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid input data",
        details: error.errors
      });
    }
    res.status(500).json({ 
      error: "Internal server error" 
    });
  }
};

export const handleSignout: RequestHandler = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ 
        error: error.message 
      });
    }

    res.status(200).json({ 
      message: "Signed out successfully" 
    });

  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ 
      error: "Internal server error" 
    });
  }
};

export const handleGetUser: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: "No authorization token provided" 
      });
    }

    const token = authHeader.substring(7);
    
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({ 
        error: "Invalid or expired token" 
      });
    }

    // Try to get user profile (optional)
    let profileData = null;
    try {
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (!profileError) {
        profileData = data;
      }
    } catch (profileError) {
      console.warn('Profile table not available:', profileError);
    }

    res.status(200).json({
      user: {
        id: userData.user.id,
        email: userData.user.email,
        name: profileData?.name || userData.user.user_metadata?.name || 'User',
        role: profileData?.role || userData.user.user_metadata?.role || 'user'
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: "Internal server error" 
    });
  }
};
