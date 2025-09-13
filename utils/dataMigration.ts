
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, TABLES } from '../config/supabase';
import { Expense, Income, Loan, Debt } from '../types';

interface MigrationResult {
  success: boolean;
  message: string;
  migratedCounts: {
    expenses: number;
    income: number;
    loans: number;
    debts: number;
  };
}

export const migrateLocalDataToSupabase = async (userId: string): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: false,
    message: '',
    migratedCounts: {
      expenses: 0,
      income: 0,
      loans: 0,
      debts: 0,
    },
  };

  try {
    console.log('Starting data migration for user:', userId);

    // Get local storage keys
    const storageKeys = {
      EXPENSES: `expenses_${userId}`,
      INCOME: `income_${userId}`,
      LOANS: `loans_${userId}`,
      DEBTS: `debts_${userId}`,
    };

    // Load local data
    const [expensesData, incomeData, loansData, debtsData] = await Promise.all([
      AsyncStorage.getItem(storageKeys.EXPENSES),
      AsyncStorage.getItem(storageKeys.INCOME),
      AsyncStorage.getItem(storageKeys.LOANS),
      AsyncStorage.getItem(storageKeys.DEBTS),
    ]);

    // Parse local data
    const expenses: Expense[] = expensesData ? JSON.parse(expensesData) : [];
    const income: Income[] = incomeData ? JSON.parse(incomeData) : [];
    const loans: Loan[] = loansData ? JSON.parse(loansData) : [];
    const debts: Debt[] = debtsData ? JSON.parse(debtsData) : [];

    console.log('Local data found:', {
      expenses: expenses.length,
      income: income.length,
      loans: loans.length,
      debts: debts.length,
    });

    // Migrate expenses
    if (expenses.length > 0) {
      const expensesToMigrate = expenses.map(expense => ({
        ...expense,
        user_id: userId,
        created_at: new Date().toISOString(),
      }));

      const { error: expensesError } = await supabase
        .from(TABLES.EXPENSES)
        .insert(expensesToMigrate);

      if (expensesError) {
        console.log('Error migrating expenses:', expensesError);
      } else {
        result.migratedCounts.expenses = expenses.length;
      }
    }

    // Migrate income
    if (income.length > 0) {
      const incomeToMigrate = income.map(incomeItem => ({
        ...incomeItem,
        user_id: userId,
        created_at: new Date().toISOString(),
      }));

      const { error: incomeError } = await supabase
        .from(TABLES.INCOME)
        .insert(incomeToMigrate);

      if (incomeError) {
        console.log('Error migrating income:', incomeError);
      } else {
        result.migratedCounts.income = income.length;
      }
    }

    // Migrate loans
    if (loans.length > 0) {
      for (const loan of loans) {
        // Insert loan
        const loanToMigrate = {
          id: loan.id,
          name: loan.name,
          originalAmount: loan.originalAmount,
          currentBalance: loan.currentBalance,
          interestRate: loan.interestRate,
          monthlyPayment: loan.monthlyPayment,
          user_id: userId,
          created_at: new Date().toISOString(),
        };

        const { error: loanError } = await supabase
          .from(TABLES.LOANS)
          .insert([loanToMigrate]);

        if (loanError) {
          console.log('Error migrating loan:', loanError);
          continue;
        }

        // Insert loan payments
        if (loan.payments && loan.payments.length > 0) {
          const paymentsToMigrate = loan.payments.map(payment => ({
            ...payment,
            loan_id: loan.id,
            user_id: userId,
            created_at: new Date().toISOString(),
          }));

          const { error: paymentsError } = await supabase
            .from(TABLES.LOAN_PAYMENTS)
            .insert(paymentsToMigrate);

          if (paymentsError) {
            console.log('Error migrating loan payments:', paymentsError);
          }
        }

        result.migratedCounts.loans++;
      }
    }

    // Migrate debts
    if (debts.length > 0) {
      for (const debt of debts) {
        // Insert debt
        const debtToMigrate = {
          id: debt.id,
          personName: debt.personName,
          totalOwed: debt.totalOwed,
          user_id: userId,
          created_at: new Date().toISOString(),
        };

        const { error: debtError } = await supabase
          .from(TABLES.DEBTS)
          .insert([debtToMigrate]);

        if (debtError) {
          console.log('Error migrating debt:', debtError);
          continue;
        }

        // Insert debt transactions
        if (debt.transactions && debt.transactions.length > 0) {
          const transactionsToMigrate = debt.transactions.map(transaction => ({
            ...transaction,
            debt_id: debt.id,
            user_id: userId,
            created_at: new Date().toISOString(),
          }));

          const { error: transactionsError } = await supabase
            .from(TABLES.DEBT_TRANSACTIONS)
            .insert(transactionsToMigrate);

          if (transactionsError) {
            console.log('Error migrating debt transactions:', transactionsError);
          }
        }

        result.migratedCounts.debts++;
      }
    }

    // Clear local storage after successful migration
    await Promise.all([
      AsyncStorage.removeItem(storageKeys.EXPENSES),
      AsyncStorage.removeItem(storageKeys.INCOME),
      AsyncStorage.removeItem(storageKeys.LOANS),
      AsyncStorage.removeItem(storageKeys.DEBTS),
    ]);

    result.success = true;
    result.message = 'Data migration completed successfully';
    console.log('Migration completed:', result.migratedCounts);

  } catch (error) {
    console.log('Migration error:', error);
    result.success = false;
    result.message = 'Migration failed: ' + (error as Error).message;
  }

  return result;
};
