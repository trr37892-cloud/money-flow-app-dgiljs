
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { supabase } from '../config/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          username: session.user.email || session.user.id,
          createdAt: session.user.created_at || new Date().toISOString(),
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          username: session.user.email || session.user.id,
          createdAt: session.user.created_at || new Date().toISOString(),
        };
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
      const { data, error } = await supabase.auth.signUp({
        email: username,
        password: password,
      });

      if (error) {
        console.log('Registration error:', error.message);
        return false;
      }

      if (data.user) {
        console.log('User registered successfully:', username);
        return true;
      }

      return false;
    } catch (error) {
      console.log('Error registering user:', error);
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        console.log('Login error:', error.message);
        return false;
      }

      if (data.user) {
        console.log('User logged in successfully:', username);
        return true;
      }

      return false;
    } catch (error) {
      console.log('Error logging in:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('Logout error:', error.message);
      } else {
        console.log('User logged out');
      }
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
