
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables for the expense tracking app

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income table
CREATE TABLE IF NOT EXISTS income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  originalAmount DECIMAL(10,2) NOT NULL,
  currentBalance DECIMAL(10,2) NOT NULL,
  interestRate DECIMAL(5,2),
  monthlyPayment DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Debts table (money others owe you)
CREATE TABLE IF NOT EXISTS debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  personName TEXT NOT NULL,
  totalOwed DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Debt transactions table
CREATE TABLE IF NOT EXISTS debt_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for income
CREATE POLICY "Users can view their own income" ON income
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income" ON income
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income" ON income
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income" ON income
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for loans
CREATE POLICY "Users can view their own loans" ON loans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans" ON loans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans" ON loans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans" ON loans
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for loan_payments
CREATE POLICY "Users can view their own loan payments" ON loan_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loan payments" ON loan_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loan payments" ON loan_payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loan payments" ON loan_payments
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for debts
CREATE POLICY "Users can view their own debts" ON debts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts" ON debts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" ON debts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" ON debts
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for debt_transactions
CREATE POLICY "Users can view their own debt transactions" ON debt_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debt transactions" ON debt_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debt transactions" ON debt_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt transactions" ON debt_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS expenses_user_id_date_idx ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS income_user_id_date_idx ON income(user_id, date DESC);
CREATE INDEX IF NOT EXISTS loans_user_id_idx ON loans(user_id);
CREATE INDEX IF NOT EXISTS loan_payments_loan_id_idx ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS loan_payments_user_id_idx ON loan_payments(user_id);
CREATE INDEX IF NOT EXISTS debts_user_id_idx ON debts(user_id);
CREATE INDEX IF NOT EXISTS debt_transactions_debt_id_idx ON debt_transactions(debt_id);
CREATE INDEX IF NOT EXISTS debt_transactions_user_id_idx ON debt_transactions(user_id);
