
import { createClient } from '@supabase/supabase-js';

// These will be provided by the Supabase integration in Natively
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  USERS: 'users',
  EXPENSES: 'expenses',
  INCOME: 'income',
  LOANS: 'loans',
  LOAN_PAYMENTS: 'loan_payments',
  DEBTS: 'debts',
  DEBT_TRANSACTIONS: 'debt_transactions',
} as const;
