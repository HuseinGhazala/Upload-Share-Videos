'use client';

import ChunkLoadRecovery from '@/app/components/ChunkLoadRecovery';
import SmoothScroll from '@/app/components/SmoothScroll';
import AutoReveal from '@/app/components/AutoReveal';
import PageTransition from '@/app/components/PageTransition';
import { AuthProvider } from './AuthProvider';

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ChunkLoadRecovery />
      <SmoothScroll />
      <AutoReveal />
      <PageTransition>{children}</PageTransition>
    </AuthProvider>
  );
}
