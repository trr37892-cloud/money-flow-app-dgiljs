
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { supabase } from '../config/supabase';
import Icon from './Icon';

const DatabaseSetup: React.FC = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const setupDatabase = async () => {
    setIsSettingUp(true);
    try {
      // Test the connection first
      const { data, error } = await supabase.from('expenses').select('count').limit(1);
      
      if (error && error.code === '42P01') {
        // Table doesn't exist, show setup instructions
        Alert.alert(
          'Database Setup Required',
          'Please run the database setup script in your Supabase SQL editor. You can find the script in scripts/setupDatabase.sql',
          [{ text: 'OK' }]
        );
      } else if (error) {
        console.log('Database connection error:', error);
        Alert.alert('Connection Error', 'Failed to connect to database. Please check your Supabase configuration.');
      } else {
        setSetupComplete(true);
        Alert.alert('Success', 'Database is ready to use!');
      }
    } catch (error) {
      console.log('Setup error:', error);
      Alert.alert('Setup Error', 'Failed to setup database. Please try again.');
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="server-outline" size={48} color={colors.primary} />
        <Text style={styles.title}>Database Setup</Text>
        <Text style={styles.subtitle}>
          Set up your Supabase database for cross-device sync
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.stepTitle}>Setup Instructions:</Text>
        
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>
            Open your Supabase project dashboard
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>
            Go to the SQL Editor
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>
            Copy and run the SQL script from scripts/setupDatabase.sql
          </Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>4.</Text>
          <Text style={styles.stepText}>
            Click "Test Connection" below to verify setup
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isSettingUp && styles.buttonDisabled]}
        onPress={setupDatabase}
        disabled={isSettingUp}
      >
        <Icon 
          name={setupComplete ? "checkmark-circle" : "play-circle"} 
          size={20} 
          color={colors.white} 
        />
        <Text style={styles.buttonText}>
          {isSettingUp ? 'Testing...' : setupComplete ? 'Setup Complete' : 'Test Connection'}
        </Text>
      </TouchableOpacity>

      {setupComplete && (
        <View style={styles.successMessage}>
          <Icon name="checkmark-circle" size={24} color={colors.success} />
          <Text style={styles.successText}>
            Your database is ready! You can now sync data across devices.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    ...commonStyles.title,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    ...commonStyles.subtitle,
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 12,
    minWidth: 20,
  },
  stepText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: colors.gray,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  successMessage: {
    backgroundColor: colors.successLight,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successText: {
    color: colors.success,
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});

export default DatabaseSetup;
