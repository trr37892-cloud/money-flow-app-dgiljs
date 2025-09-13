
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
};

interface StoredUser {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (currentUserData) {
        const userData = JSON.parse(currentUserData);
        setUser(userData);
        console.log('User authenticated:', userData.username);
      }
    } catch (error) {
      console.log('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

      // Check if username already exists
      const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (existingUser) {
        console.log('Username already exists');
        return false;
      }

      // Create new user
      const newUser: StoredUser = {
        id: Date.now().toString(),
        username,
        password, // In a real app, this should be hashed
        createdAt: new Date().toISOString(),
      };

      // Save to users list
      const updatedUsers = [...users, newUser];
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

      // Set as current user
      const userForContext: User = {
        id: newUser.id,
        username: newUser.username,
        createdAt: newUser.createdAt,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userForContext));
      setUser(userForContext);

      console.log('User registered successfully:', username);
      return true;
    } catch (error) {
      console.log('Error registering user:', error);
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

      // Find user with matching credentials
      const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (!user) {
        console.log('Invalid credentials');
        return false;
      }

      // Set as current user
      const userForContext: User = {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userForContext));
      setUser(userForContext);

      console.log('User logged in successfully:', username);
      return true;
    } catch (error) {
      console.log('Error logging in:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      setUser(null);
      console.log('User logged out');
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
