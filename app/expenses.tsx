
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { useFinancialData } from '../hooks/useFinancialData';
import Icon from '../components/Icon';
import SimpleBottomSheet from '../components/BottomSheet';

const ExpensesScreen: React.FC = () => {
  const { expenses, addExpense, getCurrentMonthData } = useFinancialData();
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const monthlyData = getCurrentMonthData();

  const handleAddExpense = () => {
    if (!amount || !category) {
      Alert.alert('Error', 'Please fill in amount and category');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    addExpense({
      amount: numAmount,
      category,
      description,
      date: new Date().toISOString().split('T')[0],
    });

    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setIsAddingExpense(false);
  };

  const categories = ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other'];

  return (
    <View style={styles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>Expenses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingExpense(true)}
        >
          <Icon name="add" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Month</Text>
          <Text style={[styles.summaryAmount, { color: colors.danger }]}>
            ${monthlyData.totalExpenses.toFixed(2)}
          </Text>
          <Text style={styles.summarySubtitle}>
            {monthlyData.expenses.length} transactions
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        
        {monthlyData.expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="receipt-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No expenses recorded this month</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first expense</Text>
          </View>
        ) : (
          monthlyData.expenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => (
              <View key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseCategory}>{expense.category}</Text>
                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                    <Text style={styles.expenseDate}>
                      {new Date(expense.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.expenseAmount, { color: colors.danger }]}>
                    -${expense.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
        )}
      </ScrollView>

      <SimpleBottomSheet
        isVisible={isAddingExpense}
        onClose={() => setIsAddingExpense(false)}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Add Expense</Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
            placeholderTextColor={colors.textSecondary}
          />
          
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextSelected
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={colors.textSecondary}
          />
          
          <TouchableOpacity style={commonStyles.button} onPress={handleAddExpense}>
            <Text style={commonStyles.buttonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  expenseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.text,
  },
  categoryChipTextSelected: {
    color: colors.background,
  },
});

export default ExpensesScreen;
