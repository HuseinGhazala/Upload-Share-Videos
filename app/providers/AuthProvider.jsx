'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';

const AuthContext = createContext(null);

function sameQuota(prev, next) {
  if (!prev && !next) return true;
  if (!prev || !next) return false;
  return (
    prev.authenticated === next.authenticated &&
    prev.planName === next.planName &&
    prev.planExpiresAt === next.planExpiresAt &&
    prev.uploadAllowed === next.uploadAllowed &&
    prev.maxUploadBytes === next.maxUploadBytes &&
    prev.maxUploadLabel === next.maxUploadLabel &&
    prev.storageUsedBytes === next.storageUsedBytes &&
    prev.storageQuotaBytes === next.storageQuotaBytes &&
    prev.storageRemainingBytes === next.storageRemainingBytes &&
    prev.daysRemaining === next.daysRemaining
  );
}

export function AuthProvider({ children }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const nextUser = data.session?.user ?? null;
      setUser((prev) => (prev?.id === nextUser?.id ? prev : nextUser));
      setLoading((prev) => (prev ? false : prev));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      const nextUser = session?.user ?? null;
      setUser((prev) => (prev?.id === nextUser?.id ? prev : nextUser));
      setLoading((prev) => (prev ? false : prev));
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!user) {
      setQuota((prev) => (prev === null ? prev : null));
      return;
    }
    let cancelled = false;
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.authenticated) {
          setQuota((prev) => (sameQuota(prev, data) ? prev : data));
        } else {
          setQuota((prev) => (prev === null ? prev : null));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuota((prev) => (prev === null ? prev : null));
        }
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
