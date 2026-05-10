'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMasterAuthStore } from '@/stores/masterAuthStore';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function MasterLoginPageContent() {
  const router = useRouter();
  const { setAuth } = useMasterAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // Mock login delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Set auth state with mock data
      setAuth(
        { id: 'master1', name: 'Master Admin', email: form.email, role: 'MASTER' },
        'master-dummy-token-123'
      );
      router.replace('/master/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar">
      <div className="w-full max-w-md p-8 bg-background rounded-2xl border border-border shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-display font-bold text-white tracking-tight">Master Admin</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && (
            <div className="p-3 rounded-lg bg-[#ff4d6d]/10 border border-[#ff4d6d]/30 text-[#ff4d6d] text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Email Admin</label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@billmate.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'} required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="input-field pr-10"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 text-base rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Secure Access'}
          </button>
        </form>
      </div>
    </div>
  );
}
