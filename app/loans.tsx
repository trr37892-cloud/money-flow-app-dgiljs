
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { useFinancialData } from '../hooks/useFinancialData';
import Icon from '../components/Icon';
import SimpleBottomSheet from '../components/BottomSheet';

const LoansScreen: React.FC = () => {
  const { loans, addLoan, addLoanPayment, getTotalLoanBalance } = useFinancialData();
  const [isAddingLoan, setIsAddingLoan] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  
  // Loan form state
  const [loanName, setLoanName] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  
  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');

  const handleAddLoan = () => {
    if (!loanName || !originalAmount || !currentBalance) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    const numOriginalAmount = parseFloat(originalAmount);
    const numCurrentBalance = parseFloat(currentBalance);
    const numInterestRate = interestRate ? parseFloat(interestRate) : undefined;
    const numMonthlyPayment = monthlyPayment ? parseFloat(monthlyPayment) : undefined;

    if (isNaN(numOriginalAmount) || isNaN(numCurrentBalance)) {
      Alert.alert('Error', 'Please enter valid amounts');
      return;
    }

    addLoan({
      name: loanName,
      originalAmount: numOriginalAmount,
      currentBalance: numCurrentBalance,
      interestRate: numInterestRate,
      monthlyPayment: numMonthlyPayment,
    });

    // Reset form
    setLoanName('');
    setOriginalAmount('');
    setCurrentBalance('');
    setInterestRate('');
    setMonthlyPayment('');
    setIsAddingLoan(false);
  };

  const handleAddPayment = () => {
    if (!paymentAmount || !selectedLoanId) {
      Alert.alert('Error', 'Please enter payment amount');
      return;
    }

    const numPaymentAmount = parseFloat(paymentAmount);
    if (isNaN(numPaymentAmount) || numPaymentAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }

    addLoanPayment(selectedLoanId, numPaymentAmount, paymentDescription);

    // Reset form
    setPaymentAmount('');
    setPaymentDescription('');
    setIsAddingPayment(false);
    setSelectedLoanId('');
  };

  const openPaymentSheet = (loanId: string) => {
    setSelectedLoanId(loanId);
    setIsAddingPayment(true);
  };

  return (
    <View style={styles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>Loans</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingLoan(true)}
        >
          <Icon name="add" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Loan Balance</Text>
          <Text style={[styles.summaryAmount, { color: colors.warning }]}>
            ${getTotalLoanBalance().toFixed(2)}
          </Text>
          <Text style={styles.summarySubtitle}>
            {loans.length} active loans
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Your Loans</Text>
        
        {loans.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="wallet-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No loans recorded</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first loan</Text>
          </View>
        ) : (
          loans.map((loan) => (
            <View key={loan.id} style={styles.loanCard}>
              <View style={styles.loanHeader}>
                <View style={styles.loanInfo}>
                  <Text style={styles.loanName}>{loan.name}</Text>
                  <Text style={styles.loanProgress}>
                    ${loan.currentBalance.toFixed(2)} of ${loan.originalAmount.toFixed(2)} remaining
                  </Text>
                  {loan.monthlyPayment && (
                    <Text style={styles.loanPayment}>
                      Monthly payment: ${loan.monthlyPayment.toFixed(2)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => openPaymentSheet(loan.id)}
                >
                  <Text style={styles.payButtonText}>Pay</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.max(0, ((loan.originalAmount - loan.currentBalance) / loan.originalAmount) * 100)}%` 
                    }
                  ]} 
                />
              </View>
              
              {loan.payments.length > 0 && (
                <View style={styles.recentPayments}>
                  <Text style={styles.paymentsTitle}>Recent Payments</Text>
                  {loan.payments.slice(-3).reverse().map((payment) => (
                    <View key={payment.id} style={styles.paymentItem}>
                      <Text style={styles.paymentDate}>
                        {new Date(payment.date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.paymentAmount}>
                        -${payment.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Loan Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={isAddingLoan}
        onClose={() => setIsAddingLoan(false)}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Add Loan</Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Loan Name"
            value={loanName}
            onChangeText={setLoanName}
            placeholderTextColor={colors.textSecondary}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Original Amount"
            value={originalAmount}
            onChangeText={setOriginalAmount}
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Current Balance"
            value={currentBalance}
            onChangeText={setCurrentBalance}
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Interest Rate % (optional)"
            value={interestRate}
            onChangeText={setInterestRate}
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Monthly Payment (optional)"
            value={monthlyPayment}
            onChangeText={setMonthlyPayment}
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
          
          <TouchableOpacity style={commonStyles.button} onPress={handleAddLoan}>
            <Text style={commonStyles.buttonText}>Add Loan</Text>
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>

      {/* Add Payment Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={isAddingPayment}
        onClose={() => setIsAddingPayment(false)}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Make Payment</Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Payment Amount"
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
          
          <TextInput
            style={commonStyles.input}
            placeholder="Description (optional)"
            value={paymentDescription}
            onChangeText={setPaymentDescription}
            placeholderTextColor={colors.textSecondary}
          />
          
          <TouchableOpacity style={commonStyles.button} onPress={handleAddPayment}>
            <Text style={commonStyles.buttonText}>Make Payment</Text>
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
    backgroundColor: colors.warning,
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
  loanCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loanInfo: {
    flex: 1,
  },
  loanName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  loanProgress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  loanPayment: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  payButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 4,
  },
  recentPayments: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  paymentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
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
});

export default LoansScreen;
