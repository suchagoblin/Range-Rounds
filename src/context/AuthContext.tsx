import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  profileId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, name: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedProfileId = localStorage.getItem('golf_profile_id');
    const storedUsername = localStorage.getItem('golf_username');

    if (storedProfileId && storedUsername) {
      setProfileId(storedProfileId);
      setUsername(storedUsername);
    }

    setIsLoading(false);
  }, []);

  const setCurrentProfile = (id: string, user: string) => {
    setProfileId(id);
    setUsername(user);
    localStorage.setItem('golf_profile_id', id);
    localStorage.setItem('golf_username', user);
  };

  const login = async (username: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: hashedPin } = await supabase.rpc('hash_pin', { pin });

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, name')
        .eq('username', username.toLowerCase())
        .eq('pin_hash', hashedPin)
        .maybeSingle();

      if (error) {
        return { success: false, error: 'Login failed' };
      }

      if (!profile) {
        return { success: false, error: 'Invalid username or PIN' };
      }

      setCurrentProfile(profile.id, profile.username);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const signup = async (username: string, name: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const lowerUsername = username.toLowerCase();

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', lowerUsername)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'Username already exists' };
      }

      const { data: hashedPin } = await supabase.rpc('hash_pin', { pin });

      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          username: lowerUsername,
          name,
          pin_hash: hashedPin,
        })
        .select('id, username')
        .single();

      if (error) {
        return { success: false, error: 'Signup failed' };
      }

      setCurrentProfile(profile.id, profile.username);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed' };
    }
  };

  const logout = () => {
    setProfileId(null);
    setUsername(null);
    localStorage.removeItem('golf_profile_id');
    localStorage.removeItem('golf_username');
  };

  return (
    <AuthContext.Provider
      value={{
        profileId,
        username,
        isAuthenticated: !!profileId,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
