
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useFinancialData } from '../hooks/useFinancialData';
import { commonStyles, colors } from '../styles/commonStyles';
import DashboardCard from '../components/DashboardCard';
import BottomTabBar from '../components/BottomTabBar';
import IncomeScreen from './income';
import ExpensesScreen from './expenses';
import LoansScreen from './loans';
import DebtsScreen from './debts';
import AuthScreen from './auth';
import Icon from '../components/Icon';

export default function MainScreen() {
  const { user, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const financialData = useFinancialData();

  // Show auth screen if user is not logged in
  if (authLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={commonStyles.text}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLogout = async () => {
    await logout();
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
    const monthlyData = financialData.getCurrentMonthData();
    const totalLoanBalance = financialData.getTotalLoanBalance();
    const totalDebtBalance = financialData.getTotalDebtBalance();

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.usernameText}>{user.username}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="log-out-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
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
            iconName="trending-down"
            onPress={() => setActiveTab('expenses')}
          />
          
          <DashboardCard
            title="Net Income"
            amount={monthlyData.netIncome}
            color={monthlyData.netIncome >= 0 ? colors.success : colors.danger}
            iconName="calculator"
            subtitle="This month"
          />
          
          <DashboardCard
            title="Loan Balances"
            amount={totalLoanBalance}
            color={colors.warning}
            iconName="card"
            onPress={() => setActiveTab('loans')}
            subtitle="Total owed"
          />
          
          <DashboardCard
            title="Money Owed to Me"
            amount={totalDebtBalance}
            color={colors.accent}
            iconName="people"
            onPress={() => setActiveTab('debts')}
            subtitle="Total owed"
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.container}>
        <View style={styles.content}>
          {renderContent()}
        </View>
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
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  usernameText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '800',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
  },
  cardsContainer: {
    gap: 16,
  },
});
