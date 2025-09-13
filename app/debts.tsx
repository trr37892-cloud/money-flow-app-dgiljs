
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { useFinancialData } from '../hooks/useFinancialData';
import Icon from '../components/Icon';
import SimpleBottomSheet from '../components/BottomSheet';

const DebtsScreen: React.FC = () => {
  const { debts, addDebt, addDebtTransaction, getTotalDebtBalance } = useFinancialData();
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState('');
  
  // Person form state
  const [personName, setPersonName] = useState('');
  
  // Transaction form state
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionType, setTransactionType] = useState<'lent' | 'received'>('lent');

  const handleAddPerson = () => {
    if (!personName.trim()) {
      Alert.alert('Error', 'Please enter a person name');
      return;
    }

    addDebt(personName.trim());
    setPersonName('');
    setIsAddingPerson(false);
  };

  const handleAddTransaction = () => {
    if (!transactionAmount || !transactionDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(transactionAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Positive for money lent, negative for payments received
    const finalAmount = transactionType === 'lent' ? numAmount : -numAmount;
    
    addDebtTransaction(selectedDebtId, finalAmount, transactionDescription.trim());

    // Reset form
    setTransactionAmount('');
    setTransactionDescription('');
    setTransactionType('lent');
    setIsAddingTransaction(false);
    setSelectedDebtId('');
  };

  const openTransactionSheet = (debtId: string) => {
    setSelectedDebtId(debtId);
    setIsAddingTransaction(true);
  };

  const getSelectedDebt = () => {
    return debts.find(debt => debt.id === selectedDebtId);
  };

  return (
    <View style={styles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>Money Owed to Me</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingPerson(true)}
        >
          <Icon name="add" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Owed to Me</Text>
          <Text style={[styles.summaryAmount, { color: colors.primary }]}>
            ${getTotalDebtBalance().toFixed(2)}
          </Text>
          <Text style={styles.summarySubtitle}>
            {debts.length} people
          </Text>
        </View>

        <Text style={styles.sectionTitle}>People Who Owe Me</Text>
        
        {debts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="people-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No debts recorded</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add someone who owes you money</Text>
          </View>
        ) : (
          debts
            .filter(debt => debt.totalOwed !== 0) // Only show debts with non-zero balance
            .sort((a, b) => b.totalOwed - a.totalOwed) // Sort by amount owed (highest first)
            .map((debt) => (
              <View key={debt.id} style={styles.debtCard}>
                <View style={styles.debtHeader}>
                  <View style={styles.debtInfo}>
                    <Text style={styles.personName}>{debt.personName}</Text>
                    <Text style={styles.debtAmount}>
                      Owes: ${debt.totalOwed.toFixed(2)}
                    </Text>
                    <Text style={styles.transactionCount}>
                      {debt.transactions.length} transactions
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.transactionButton}
                    onPress={() => openTransactionSheet(debt.id)}
                  >
                    <Text style={styles.transactionButtonText}>Update</Text>
                  </TouchableOpacity>
                </View>
                
                {debt.transactions.length > 0 && (
                  <View style={styles.recentTransactions}>
                    <Text style={styles.transactionsTitle}>Recent Activity</Text>
                    {debt.transactions.slice(-3).reverse().map((transaction) => (
                      <View key={transaction.id} style={styles.transactionItem}>
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionDescription}>
                            {transaction.description}
                          </Text>
                          <Text style={styles.transactionDate}>
                            {new Date(transaction.date).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={[
                          styles.transactionAmount,
                          { color: transaction.amount > 0 ? colors.primary : colors.success }
                        ]}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
        )}

        {/* Show people with zero balance separately */}
        {debts.filter(debt => debt.totalOwed === 0).length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Settled Debts</Text>
            {debts
              .filter(debt => debt.totalOwed === 0)
              .map((debt) => (
                <View key={debt.id} style={[styles.debtCard, styles.settledDebtCard]}>
                  <View style={styles.debtHeader}>
                    <View style={styles.debtInfo}>
                      <Text style={styles.personName}>{debt.personName}</Text>
                      <Text style={[styles.debtAmount, { color: colors.success }]}>
                        Settled ✓
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.transactionButton}
                      onPress={() => openTransactionSheet(debt.id)}
                    >
                      <Text style={styles.transactionButtonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            }
          </>
        )}
      </ScrollView>

      {/* Add Person Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={isAddingPerson}
        onClose={() => setIsAddingPerson(false)}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Add Person</Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Person's Name"
            value={personName}
            onChangeText={setPersonName}
            placeholderTextColor={colors.textSecondary}
          />
          
          <TouchableOpacity style={commonStyles.button} onPress={handleAddPerson}>
            <Text style={commonStyles.buttonText}>Add Person</Text>
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>

      {/* Add Transaction Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={isAddingTransaction}
        onClose={() => setIsAddingTransaction(false)}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>
            Update Debt - {getSelectedDebt()?.personName}
          </Text>
          
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'lent' && styles.typeButtonSelected
              ]}
              onPress={() => setTransactionType('lent')}
            >
              <Text style={[
                styles.typeButtonText,
                transactionType === 'lent' && styles.typeButtonTextSelected
              ]}>
                Money Lent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'received' && styles.typeButtonSelected
              ]}
              onPress={() => setTransactionType('received')}
            >
              <Text style={[
                styles.typeButtonText,
                transactionType === 'received' && styles.typeButtonTextSelected
              ]}>
                Payment Received
              </Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Amount"
            value={transactionAmount}
            onChangeText={setTransactionAmount}
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Description (what for?)"
            value={transactionDescription}
            onChangeText={setTransactionDescription}
            placeholderTextColor={colors.textSecondary}
          />
          
          <TouchableOpacity style={commonStyles.button} onPress={handleAddTransaction}>
            <Text style={commonStyles.buttonText}>
              {transactionType === 'lent' ? 'Add Debt' : 'Record Payment'}
            </Text>
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
  debtCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settledDebtCard: {
    opacity: 0.7,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  debtInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  transactionCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  transactionButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  recentTransactions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  transactionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
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
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  typeButtonTextSelected: {
    color: colors.background,
  },
});

export default DebtsScreen;
