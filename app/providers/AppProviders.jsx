'use client';

import ChunkLoadRecovery from '@/app/components/ChunkLoadRecovery';
import { AuthProvider } from './AuthProvider';

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ChunkLoadRecovery />
      {children}
    </AuthProvider>
  );
}
