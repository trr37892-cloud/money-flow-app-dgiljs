
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface TabItem {
  key: string;
  title: string;
  iconName: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
}

interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const tabs: TabItem[] = [
  { key: 'dashboard', title: 'Dashboard', iconName: 'home' },
  { key: 'expenses', title: 'Expenses', iconName: 'card' },
  { key: 'income', title: 'Income', iconName: 'trending-up' },
  { key: 'loans', title: 'Loans', iconName: 'wallet' },
  { key: 'debts', title: 'Debts', iconName: 'people' },
];

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
        >
          <Icon
            name={tab.iconName}
            size={24}
            color={activeTab === tab.key ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === tab.key ? colors.primary : colors.textSecondary }
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default BottomTabBar;
