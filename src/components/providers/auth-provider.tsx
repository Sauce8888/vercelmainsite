"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change event:', event);
        setSession(newSession);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          router.refresh();
          router.push('/auth/signin');
        } else if (event === 'SIGNED_IN') {
          // Only refresh and redirect on explicit sign in
          router.refresh();
          router.push('/dashboard');
        }
        // TOKEN_REFRESHED no longer triggers a refresh or redirect
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signOut = async () => {
    try {
      // Clear the session immediately in the local state
      setSession(null);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Force refresh to update all components
      router.refresh();
      
      // This router.push is less important now as we use window.location.href in the button component
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error; // Propagate the error to the component
    }
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
} 