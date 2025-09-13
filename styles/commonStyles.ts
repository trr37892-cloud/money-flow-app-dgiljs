
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  successLight: '#E8F5E8',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#5AC8FA',
  background: '#F2F2F7',
  white: '#FFFFFF',
  black: '#000000',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  gray: '#8E8E93',
  lightGray: '#F2F2F7',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  } as TextStyle,
  
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  } as TextStyle,
  
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as ViewStyle,
  
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  } as ViewStyle,
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  
  section: {
    marginBottom: 24,
  } as ViewStyle,
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  } as TextStyle,
});
