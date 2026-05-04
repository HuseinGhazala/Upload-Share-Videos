'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!user) {
      setQuota(null);
      return;
    }
    let cancelled = false;
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.authenticated) setQuota(data);
        else setQuota(null);
      })
      .catch(() => {
        if (!cancelled) setQuota(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setQuota(null);
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading, quota, signOut, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
