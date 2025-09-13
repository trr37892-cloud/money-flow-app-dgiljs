
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useFinancialData } from '../hooks/useFinancialData';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';
import DashboardCard from '../components/DashboardCard';
import BottomTabBar from '../components/BottomTabBar';
import AuthScreen from './auth';
import ExpensesScreen from './expenses';
import IncomeScreen from './income';
import LoansScreen from './loans';
import DebtsScreen from './debts';
import DatabaseSetup from '../components/DatabaseSetup';

const MainScreen: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { 
    expenses, 
    income, 
    loans, 
    debts, 
    loading: dataLoading,
    getCurrentMonthData,
    getTotalLoanBalance,
    getTotalDebtBalance 
  } = useFinancialData();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false);

  // Check if we need to show database setup
  useEffect(() => {
    if (user && !dataLoading) {
      // If user is logged in but we have connection issues, show setup
      const hasData = expenses.length > 0 || income.length > 0 || loans.length > 0 || debts.length > 0;
      if (!hasData) {
        // This could mean either no data yet or connection issues
        // For now, we'll assume it's working if user is authenticated
        console.log('User authenticated, data sync ready');
      }
    }
  }, [user, dataLoading, expenses, income, loans, debts]);

  const onRefresh = async () => {
    setRefreshing(true);
    // The useFinancialData hook will automatically reload data when user changes
    // For manual refresh, we could add a refresh function to the hook
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    await logout();
    setActiveTab('dashboard');
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (showDatabaseSetup) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowDatabaseSetup(false)}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Database Setup</Text>
          <View style={{ width: 24 }} />
        </View>
        <DatabaseSetup />
      </SafeAreaView>
    );
  }

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
    const monthlyData = getCurrentMonthData();
    const totalLoanBalance = getTotalLoanBalance();
    const totalDebtBalance = getTotalDebtBalance();

    return (
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back, {user.username}!</Text>
          <Text style={styles.syncStatus}>
            <Icon name="cloud-done" size={16} color={colors.success} /> Synced across devices
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
            color={colors.error}
            iconName="trending-down"
            onPress={() => setActiveTab('expenses')}
          />
          
          <DashboardCard
            title="Net Income"
            amount={monthlyData.netIncome}
            color={monthlyData.netIncome >= 0 ? colors.success : colors.error}
            iconName="analytics"
            subtitle="This month"
          />
          
          <DashboardCard
            title="Loan Balance"
            amount={totalLoanBalance}
            color={colors.warning}
            iconName="card"
            onPress={() => setActiveTab('loans')}
            subtitle="Total owed"
          />
          
          <DashboardCard
            title="Money Owed to You"
            amount={totalDebtBalance}
            color={colors.info}
            iconName="people"
            onPress={() => setActiveTab('debts')}
            subtitle="Total owed"
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Financial Tracker</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setShowDatabaseSetup(true)}
            style={styles.headerButton}
          >
            <Icon name="server-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Icon name="log-out-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {dataLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your data...</Text>
        </View>
      ) : (
        renderContent()
      )}

      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...commonStyles.title,
    fontSize: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  syncStatus: {
    fontSize: 14,
    color: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardsContainer: {
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
  },
});

export default MainScreen;
