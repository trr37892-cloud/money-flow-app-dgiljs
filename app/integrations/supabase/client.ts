import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://exunnqpgrlqcxfjpupwm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dW5ucXBncmxxY3hmanB1cHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDAwNDcsImV4cCI6MjA3MzM3NjA0N30.-zJkljH30RpZEWg3rBMsAXDOBZmMi-Am-C_b06lyjCU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
