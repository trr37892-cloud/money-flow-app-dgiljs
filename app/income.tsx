
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { useFinancialData } from '../hooks/useFinancialData';
import Icon from '../components/Icon';
import SimpleBottomSheet from '../components/BottomSheet';

const IncomeScreen: React.FC = () => {
  const { income, addIncome, getCurrentMonthData } = useFinancialData();
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');

  const monthlyData = getCurrentMonthData();

  const handleAddIncome = () => {
    if (!amount || !source) {
      Alert.alert('Error', 'Please fill in amount and source');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    addIncome({
      amount: numAmount,
      source,
      description,
      date: new Date().toISOString().split('T')[0],
    });

    // Reset form
    setAmount('');
    setSource('');
    setDescription('');
    setIsAddingIncome(false);
  };

  const sources = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Bonus', 'Other'];

  return (
    <View style={styles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>Income</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingIncome(true)}
        >
          <Icon name="add" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Month</Text>
          <Text style={[styles.summaryAmount, { color: colors.success }]}>
            ${monthlyData.totalIncome.toFixed(2)}
          </Text>
          <Text style={styles.summarySubtitle}>
            {monthlyData.income.length} transactions
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Income</Text>
        
        {monthlyData.income.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="trending-up-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No income recorded this month</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first income</Text>
          </View>
        ) : (
          monthlyData.income
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((incomeItem) => (
              <View key={incomeItem.id} style={styles.incomeCard}>
                <View style={styles.incomeHeader}>
                  <View style={styles.incomeInfo}>
                    <Text style={styles.incomeSource}>{incomeItem.source}</Text>
                    <Text style={styles.incomeDescription}>{incomeItem.description}</Text>
                    <Text style={styles.incomeDate}>
                      {new Date(incomeItem.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.incomeAmount, { color: colors.success }]}>
                    +${incomeItem.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
        )}
      </ScrollView>

      <SimpleBottomSheet
        isVisible={isAddingIncome}
        onClose={() => setIsAddingIncome(false)}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Add Income</Text>
          
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
            placeholder="Source"
            value={source}
            onChangeText={setSource}
            placeholderTextColor={colors.textSecondary}
          />
          
          <View style={styles.sourceGrid}>
            {sources.map((src) => (
              <TouchableOpacity
                key={src}
                style={[
                  styles.sourceChip,
                  source === src && styles.sourceChipSelected
                ]}
                onPress={() => setSource(src)}
              >
                <Text style={[
                  styles.sourceChipText,
                  source === src && styles.sourceChipTextSelected
                ]}>
                  {src}
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
          
          <TouchableOpacity style={commonStyles.button} onPress={handleAddIncome}>
            <Text style={commonStyles.buttonText}>Add Income</Text>
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
    backgroundColor: colors.success,
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
  incomeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  incomeInfo: {
    flex: 1,
  },
  incomeSource: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  incomeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  incomeDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  incomeAmount: {
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
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  sourceChip: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourceChipSelected: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  sourceChipText: {
    fontSize: 14,
    color: colors.text,
  },
  sourceChipTextSelected: {
    color: colors.background,
  },
});

export default IncomeScreen;
