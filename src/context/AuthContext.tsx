import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

const GUEST_EXPIRY_MS = 60 * 60 * 1000; // 1 hour in milliseconds

interface AuthContextType {
  profileId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  guestTimeRemaining: number | null; // minutes remaining
  login: (username: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  continueAsGuest: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestTimeRemaining, setGuestTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedProfileId = localStorage.getItem('golf_profile_id');
    const storedUsername = localStorage.getItem('golf_username');
    const guestStartTime = localStorage.getItem('golf_guest_start');

    if (guestStartTime) {
      const elapsed = Date.now() - parseInt(guestStartTime);
      if (elapsed < GUEST_EXPIRY_MS) {
        // Guest session still valid
        setIsGuest(true);
        setProfileId('guest');
        setUsername('guest');
      } else {
        // Guest session expired - clear all guest data
        clearGuestData();
      }
    } else if (storedProfileId && storedUsername) {
      setProfileId(storedProfileId);
      setUsername(storedUsername);
    }

    setIsLoading(false);
  }, []);

  // Update guest time remaining every minute
  useEffect(() => {
    if (!isGuest) {
      setGuestTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const guestStartTime = localStorage.getItem('golf_guest_start');
      if (guestStartTime) {
        const elapsed = Date.now() - parseInt(guestStartTime);
        const remaining = GUEST_EXPIRY_MS - elapsed;
        if (remaining <= 0) {
          // Session expired
          clearGuestData();
          setIsGuest(false);
          setProfileId(null);
          setUsername(null);
          setGuestTimeRemaining(null);
        } else {
          setGuestTimeRemaining(Math.ceil(remaining / 60000)); // Convert to minutes
        }
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isGuest]);

  const clearGuestData = () => {
    localStorage.removeItem('golf_guest_start');
    // Clear any guest-specific data
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('golf_guest_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const setCurrentProfile = (id: string, user: string) => {
    setProfileId(id);
    setUsername(user);
    setIsGuest(false);
    localStorage.setItem('golf_profile_id', id);
    localStorage.setItem('golf_username', user);
    // Clear guest data if signing in
    clearGuestData();
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setProfileId('guest');
    setUsername('guest');
    localStorage.setItem('golf_guest_start', Date.now().toString());
    // Remove any regular profile data
    localStorage.removeItem('golf_profile_id');
    localStorage.removeItem('golf_username');
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

  const signup = async (username: string, pin: string): Promise<{ success: boolean; error?: string }> => {
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
          name: lowerUsername,
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
    setIsGuest(false);
    localStorage.removeItem('golf_profile_id');
    localStorage.removeItem('golf_username');
    clearGuestData();
  };

  return (
    <AuthContext.Provider
      value={{
        profileId,
        username,
        isAuthenticated: !!profileId,
        isGuest,
        guestTimeRemaining,
        login,
        signup,
        continueAsGuest,
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
