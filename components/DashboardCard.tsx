
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface DashboardCardProps {
  title: string;
  amount: number;
  color: string;
  iconName: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  onPress?: () => void;
  subtitle?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  amount,
  color,
  iconName,
  onPress,
  subtitle,
}) => {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(value));
  };

  const CardContent = () => (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Icon name={iconName} size={24} color={color} />
        </View>
      </View>
      <Text style={[styles.amount, { color }]}>
        {amount < 0 ? '-' : ''}{formatAmount(amount)}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <CardContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default DashboardCard;
