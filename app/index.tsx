
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import { useFinancialData } from '../hooks/useFinancialData';
import DashboardCard from '../components/DashboardCard';
import BottomTabBar from '../components/BottomTabBar';
import ExpensesScreen from './expenses';
import IncomeScreen from './income';
import LoansScreen from './loans';
import DebtsScreen from './debts';

export default function MainScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const {
    getCurrentMonthData,
    getTotalLoanBalance,
    getTotalDebtBalance,
    loading,
  } = useFinancialData();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'expenses':
        return <ExpensesScreen />;
      case 'income':
        return <IncomeScreen />;
      case 'loans':
        return <LoansScreen />;
      case 'debts':
        return <DebtsScreen />;
      default:
        return <DashboardContent onRefresh={onRefresh} refreshing={refreshing} />;
    }
  };

  const DashboardContent = ({ onRefresh, refreshing }: { onRefresh: () => void; refreshing: boolean }) => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    const monthlyData = getCurrentMonthData();
    const totalLoanBalance = getTotalLoanBalance();
    const totalDebtBalance = getTotalDebtBalance();

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Financial Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <DashboardCard
            title="Monthly Income"
            amount={monthlyData.totalIncome}
            color={colors.success}
            iconName="trending-up"
            onPress={() => setActiveTab('income')}
          />
          
          <DashboardCard
            title="Monthly Expenses"
            amount={monthlyData.totalExpenses}
            color={colors.danger}
            iconName="card"
            onPress={() => setActiveTab('expenses')}
          />
          
          <DashboardCard
            title="Net Income"
            amount={monthlyData.netIncome}
            color={monthlyData.netIncome >= 0 ? colors.success : colors.danger}
            iconName="analytics"
            subtitle="This month"
          />
          
          <DashboardCard
            title="Loan Balances"
            amount={totalLoanBalance}
            color={colors.warning}
            iconName="wallet"
            onPress={() => setActiveTab('loans')}
          />
          
          <DashboardCard
            title="Money Owed to Me"
            amount={totalDebtBalance}
            color={colors.primary}
            iconName="people"
            onPress={() => setActiveTab('debts')}
          />
          
          <DashboardCard
            title="Available Cash"
            amount={monthlyData.netIncome - (totalLoanBalance * 0.1)} // Rough estimate
            color={colors.accent}
            iconName="cash"
            subtitle="Estimated"
          />
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Quick Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              This month you've earned <Text style={[styles.summaryAmount, { color: colors.success }]}>
                ${monthlyData.totalIncome.toFixed(2)}
              </Text> and spent <Text style={[styles.summaryAmount, { color: colors.danger }]}>
                ${monthlyData.totalExpenses.toFixed(2)}
              </Text>.
            </Text>
            <Text style={styles.summaryText}>
              Your net income is <Text style={[styles.summaryAmount, { 
                color: monthlyData.netIncome >= 0 ? colors.success : colors.danger 
              }]}>
                ${monthlyData.netIncome.toFixed(2)}
              </Text>.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.container}>
        {renderContent()}
        <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summarySection: {
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  summaryAmount: {
    fontWeight: '600',
  },
});
