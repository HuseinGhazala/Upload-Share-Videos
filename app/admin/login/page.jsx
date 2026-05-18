import { Suspense } from 'react';
import AdminLoginForm from './AdminLoginForm';

export const metadata = {
  title: 'الدخول إلى لوحة الإدارة',
  robots: { index: false, follow: false },
};

function LoginFallback() {
  return (
    <main className="min-h-screen bg-[#050810] text-white px-4 py-16 flex items-center justify-center">
      <p className="text-white/50 text-sm">جاري تحميل الصفحة…</p>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
