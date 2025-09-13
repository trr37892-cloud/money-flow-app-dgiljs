
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors } from '../styles/commonStyles';

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
  { key: 'expenses', title: 'Expenses', iconName: 'trending-down' },
  { key: 'income', title: 'Income', iconName: 'trending-up' },
  { key: 'loans', title: 'Loans', iconName: 'card' },
  { key: 'debts', title: 'Debts', iconName: 'people' },
];

export default function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
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
            color={activeTab === tab.key ? colors.primary : colors.text}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === tab.key ? colors.primary : colors.text }
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
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
    fontWeight: '600',
    marginTop: 4,
  },
});
