
import { useState, useEffect } from 'react';
import { Expense, Income, Loan, Debt, MonthlyData, LoanPayment, DebtTransaction } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase, TABLES } from '../config/supabase';

export const useFinancialData = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setExpenses([]);
      setIncome([]);
      setLoans([]);
      setDebts([]);
      setLoading(false);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Loading financial data for user:', user.username);

      // Load all data in parallel
      const [expensesResult, incomeResult, loansResult, debtsResult] = await Promise.all([
        supabase.from(TABLES.EXPENSES).select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from(TABLES.INCOME).select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from(TABLES.LOANS).select(`
          *,
          loan_payments (*)
        `).eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from(TABLES.DEBTS).select(`
          *,
          debt_transactions (*)
        `).eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      if (expensesResult.error) console.log('Error loading expenses:', expensesResult.error);
      else setExpenses(expensesResult.data || []);

      if (incomeResult.error) console.log('Error loading income:', incomeResult.error);
      else setIncome(incomeResult.data || []);

      if (loansResult.error) console.log('Error loading loans:', loansResult.error);
      else {
        const loansWithPayments = (loansResult.data || []).map(loan => ({
          ...loan,
          payments: loan.loan_payments || [],
        }));
        setLoans(loansWithPayments);
      }

      if (debtsResult.error) console.log('Error loading debts:', debtsResult.error);
      else {
        const debtsWithTransactions = (debtsResult.data || []).map(debt => ({
          ...debt,
          transactions: debt.debt_transactions || [],
        }));
        setDebts(debtsWithTransactions);
      }

      console.log('Financial data loaded successfully');
    } catch (error) {
      console.log('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getCurrentMonthData = (): MonthlyData => {
    const currentMonth = getCurrentMonth();
    const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    const monthIncome = income.filter(i => i.date.startsWith(currentMonth));
    
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = monthIncome.reduce((sum, i) => sum + i.amount, 0);
    
    return {
      month: currentMonth,
      expenses: monthExpenses,
      income: monthIncome,
      totalExpenses,
      totalIncome,
      netIncome: totalIncome - totalExpenses,
    };
  };

  const getTotalLoanBalance = () => {
    return loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  };

  const getTotalDebtBalance = () => {
    return debts.reduce((sum, debt) => sum + debt.totalOwed, 0);
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;

    try {
      const newExpense = {
        ...expense,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(TABLES.EXPENSES)
        .insert([newExpense])
        .select()
        .single();

      if (error) {
        console.log('Error adding expense:', error);
        return;
      }

      setExpenses(prev => [data, ...prev]);
      console.log('Expense added successfully');
    } catch (error) {
      console.log('Error adding expense:', error);
    }
  };

  const addIncome = async (incomeItem: Omit<Income, 'id'>) => {
    if (!user) return;

    try {
      const newIncome = {
        ...incomeItem,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(TABLES.INCOME)
        .insert([newIncome])
        .select()
        .single();

      if (error) {
        console.log('Error adding income:', error);
        return;
      }

      setIncome(prev => [data, ...prev]);
      console.log('Income added successfully');
    } catch (error) {
      console.log('Error adding income:', error);
    }
  };

  const addLoan = async (loan: Omit<Loan, 'id' | 'payments'>) => {
    if (!user) return;

    try {
      const newLoan = {
        ...loan,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(TABLES.LOANS)
        .insert([newLoan])
        .select()
        .single();

      if (error) {
        console.log('Error adding loan:', error);
        return;
      }

      const loanWithPayments = { ...data, payments: [] };
      setLoans(prev => [loanWithPayments, ...prev]);
      console.log('Loan added successfully');
    } catch (error) {
      console.log('Error adding loan:', error);
    }
  };

  const addLoanPayment = async (loanId: string, amount: number, description?: string) => {
    if (!user) return;

    try {
      // First, add the payment record
      const payment = {
        loan_id: loanId,
        amount,
        date: new Date().toISOString().split('T')[0],
        description,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      const { data: paymentData, error: paymentError } = await supabase
        .from(TABLES.LOAN_PAYMENTS)
        .insert([payment])
        .select()
        .single();

      if (paymentError) {
        console.log('Error adding loan payment:', paymentError);
        return;
      }

      // Update the loan's current balance
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return;

      const newBalance = Math.max(0, loan.currentBalance - amount);
      
      const { error: updateError } = await supabase
        .from(TABLES.LOANS)
        .update({ currentBalance: newBalance })
        .eq('id', loanId);

      if (updateError) {
        console.log('Error updating loan balance:', updateError);
        return;
      }

      // Update local state
      setLoans(prev => prev.map(l => {
        if (l.id === loanId) {
          return {
            ...l,
            currentBalance: newBalance,
            payments: [...l.payments, paymentData],
          };
        }
        return l;
      }));

      console.log('Loan payment added successfully');
    } catch (error) {
      console.log('Error adding loan payment:', error);
    }
  };

  const addDebt = async (personName: string) => {
    if (!user) return;

    try {
      const newDebt = {
        personName,
        totalOwed: 0,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(TABLES.DEBTS)
        .insert([newDebt])
        .select()
        .single();

      if (error) {
        console.log('Error adding debt:', error);
        return;
      }

      const debtWithTransactions = { ...data, transactions: [] };
      setDebts(prev => [debtWithTransactions, ...prev]);
      console.log('Debt added successfully');
    } catch (error) {
      console.log('Error adding debt:', error);
    }
  };

  const addDebtTransaction = async (debtId: string, amount: number, description: string) => {
    if (!user) return;

    try {
      // First, add the transaction record
      const transaction = {
        debt_id: debtId,
        amount,
        date: new Date().toISOString().split('T')[0],
        description,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      const { data: transactionData, error: transactionError } = await supabase
        .from(TABLES.DEBT_TRANSACTIONS)
        .insert([transaction])
        .select()
        .single();

      if (transactionError) {
        console.log('Error adding debt transaction:', transactionError);
        return;
      }

      // Update the debt's total owed
      const debt = debts.find(d => d.id === debtId);
      if (!debt) return;

      const newTotal = debt.totalOwed + amount;
      
      const { error: updateError } = await supabase
        .from(TABLES.DEBTS)
        .update({ totalOwed: newTotal })
        .eq('id', debtId);

      if (updateError) {
        console.log('Error updating debt total:', updateError);
        return;
      }

      // Update local state
      setDebts(prev => prev.map(d => {
        if (d.id === debtId) {
          return {
            ...d,
            totalOwed: newTotal,
            transactions: [...d.transactions, transactionData],
          };
        }
        return d;
      }));

      console.log('Debt transaction added successfully');
    } catch (error) {
      console.log('Error adding debt transaction:', error);
    }
  };

  return {
    expenses,
    income,
    loans,
    debts,
    loading,
    getCurrentMonthData,
    getTotalLoanBalance,
    getTotalDebtBalance,
    addExpense,
    addIncome,
    addLoan,
    addLoanPayment,
    addDebt,
    addDebtTransaction,
  };
};
