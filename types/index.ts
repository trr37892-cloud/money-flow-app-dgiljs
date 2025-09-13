
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  description: string;
  date: string;
}

export interface Loan {
  id: string;
  name: string;
  originalAmount: number;
  currentBalance: number;
  interestRate?: number;
  monthlyPayment?: number;
  payments: LoanPayment[];
}

export interface LoanPayment {
  id: string;
  amount: number;
  date: string;
  description?: string;
}

export interface Debt {
  id: string;
  personName: string;
  totalOwed: number;
  transactions: DebtTransaction[];
}

export interface DebtTransaction {
  id: string;
  amount: number; // positive for money lent, negative for payments received
  date: string;
  description: string;
}

export interface MonthlyData {
  month: string; // YYYY-MM format
  expenses: Expense[];
  income: Income[];
  totalExpenses: number;
  totalIncome: number;
  netIncome: number;
}
