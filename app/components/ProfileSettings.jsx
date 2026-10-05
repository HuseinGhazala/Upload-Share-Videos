'use client';
import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import swal from 'sweetalert2';

export default function ProfileSettings() {
  const { user, supabase, signOut } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });
      if (error) throw error;
      swal.fire({
        title: 'تم الحفظ',
        text: 'تم تحديث بياناتك بنجاح',
        icon: 'success',
        confirmButtonColor: '#ff5e1e'
      });
    } catch (error) {
      swal.fire({
        title: 'خطأ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ff5e1e'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-2xl uppercase">
          {name ? name[0] : user.email[0]}
        </div>
        <div>
          <h2 className="font-headline-md text-xl font-bold text-on-surface">أهلاً بك، {name || 'مستخدم Themiify'}</h2>
          <p className="text-on-surface-variant text-sm" dir="ltr">{user.email}</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <form onSubmit={handleUpdateProfile} className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="الاسم الكامل" 
            className="bg-background border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary flex-1"
          />
          <button 
            type="submit" 
            disabled={loading || !name} 
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 transition-colors"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </form>
        <button 
          onClick={signOut} 
          type="button"
          className="bg-error-container hover:bg-error-container/80 text-error px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
