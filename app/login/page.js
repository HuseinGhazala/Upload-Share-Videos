'use client';
import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';
import swal from 'sweetalert2';

const Swal = swal.mixin({
  customClass: {
    popup: 'rounded-2xl bg-white dark:bg-surface border border-outline-variant/30',
    title: 'font-headline-md text-on-surface text-lg font-bold',
    confirmButton: 'px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold outline-none m-2',
  },
  buttonsStyling: false
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Swal.fire({ title: 'نجاح', text: 'تم تسجيل الحساب بنجاح، يرجى مراجعة بريدك لتأكيد الحساب.', icon: 'success' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      Swal.fire({ title: 'خطأ', text: error.message, icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      Swal.fire({ title: 'خطأ', text: error.message, icon: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white dark:bg-surface rounded-3xl p-8 shadow-[0_8px_30px_rgba(14,19,44,0.08)] border border-outline-variant/30">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Themiify" className="h-12 rounded-xl" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-on-surface mb-2 font-headline-lg">
          {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </h1>
        <p className="text-center text-on-surface-variant text-sm mb-8">
          للوصول إلى أدوات الفيديو وحفظ سجل أعمالك
        </p>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full mb-6 flex items-center justify-center gap-3 bg-white dark:bg-[#1A1F2E] border border-outline-variant/50 hover:bg-surface-container-low text-on-surface py-3 rounded-full font-bold transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>المتابعة باستخدام Google</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <hr className="flex-1 border-outline-variant/30" />
          <span className="text-xs text-on-surface-variant">أو باستخدام البريد</span>
          <hr className="flex-1 border-outline-variant/30" />
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left"
              dir="ltr"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left"
              dir="ltr"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-primary hover:bg-primary-hover text-white py-3 rounded-full font-bold shadow-[0_4px_14px_rgba(255,94,30,0.3)] transition-all disabled:opacity-70 flex justify-center"
          >
            {loading ? (
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              isSignUp ? 'تسجيل حساب جديد' : 'دخول'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-bold text-primary hover:text-primary-hover transition-colors"
          >
            {isSignUp ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
          </button>
        </div>
      </div>
    </div>
  );
}
