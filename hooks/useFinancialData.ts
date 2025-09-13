
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Income, Loan, Debt, MonthlyData } from '../types';
import { useAuth } from '../contexts/AuthContext';

const getStorageKeys = (userId: string) => ({
  EXPENSES: `expenses_${userId}`,
  INCOME: `income_${userId}`,
  LOANS: `loans_${userId}`,
  DEBTS: `debts_${userId}`,
});

export const useFinancialData = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from storage when user changes
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
      const STORAGE_KEYS = getStorageKeys(user.id);
      const [expensesData, incomeData, loansData, debtsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
        AsyncStorage.getItem(STORAGE_KEYS.INCOME),
        AsyncStorage.getItem(STORAGE_KEYS.LOANS),
        AsyncStorage.getItem(STORAGE_KEYS.DEBTS),
      ]);

      if (expensesData) setExpenses(JSON.parse(expensesData));
      if (incomeData) setIncome(JSON.parse(incomeData));
      if (loansData) setLoans(JSON.parse(loansData));
      if (debtsData) setDebts(JSON.parse(debtsData));
      
      console.log('Financial data loaded for user:', user.username);
    } catch (error) {
      console.log('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    if (!user) return;
    
    try {
      const STORAGE_KEYS = getStorageKeys(user.id);
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));
      setExpenses(newExpenses);
    } catch (error) {
      console.log('Error saving expenses:', error);
    }
  };

  const saveIncome = async (newIncome: Income[]) => {
    if (!user) return;
    
    try {
      const STORAGE_KEYS = getStorageKeys(user.id);
      await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(newIncome));
      setIncome(newIncome);
    } catch (error) {
      console.log('Error saving income:', error);
    }
  };

  const saveLoans = async (newLoans: Loan[]) => {
    if (!user) return;
    
    try {
      const STORAGE_KEYS = getStorageKeys(user.id);
      await AsyncStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(newLoans));
      setLoans(newLoans);
    } catch (error) {
      console.log('Error saving loans:', error);
    }
  };

  const saveDebts = async (newDebts: Debt[]) => {
    if (!user) return;
    
    try {
      const STORAGE_KEYS = getStorageKeys(user.id);
      await AsyncStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(newDebts));
      setDebts(newDebts);
    } catch (error) {
      console.log('Error saving debts:', error);
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

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    const updatedExpenses = [...expenses, newExpense];
    saveExpenses(updatedExpenses);
  };

  const addIncome = (incomeItem: Omit<Income, 'id'>) => {
    const newIncome: Income = {
      ...incomeItem,
      id: Date.now().toString(),
    };
    const updatedIncome = [...income, newIncome];
    saveIncome(updatedIncome);
  };

  const addLoan = (loan: Omit<Loan, 'id' | 'payments'>) => {
    const newLoan: Loan = {
      ...loan,
      id: Date.now().toString(),
      payments: [],
    };
    const updatedLoans = [...loans, newLoan];
    saveLoans(updatedLoans);
  };

  const addLoanPayment = (loanId: string, amount: number, description?: string) => {
    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId) {
        const payment = {
          id: Date.now().toString(),
          amount,
          date: new Date().toISOString().split('T')[0],
          description,
        };
        return {
          ...loan,
          currentBalance: Math.max(0, loan.currentBalance - amount),
          payments: [...loan.payments, payment],
        };
      }
      return loan;
    });
    saveLoans(updatedLoans);
  };

  const addDebt = (personName: string) => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      personName,
      totalOwed: 0,
      transactions: [],
    };
    const updatedDebts = [...debts, newDebt];
    saveDebts(updatedDebts);
  };

  const addDebtTransaction = (debtId: string, amount: number, description: string) => {
    const updatedDebts = debts.map(debt => {
      if (debt.id === debtId) {
        const transaction = {
          id: Date.now().toString(),
          amount,
          date: new Date().toISOString().split('T')[0],
          description,
        };
        return {
          ...debt,
          totalOwed: debt.totalOwed + amount,
          transactions: [...debt.transactions, transaction],
        };
      }
      return debt;
    });
    saveDebts(updatedDebts);
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
