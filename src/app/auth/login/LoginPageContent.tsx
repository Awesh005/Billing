'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { Eye, EyeOff, Zap, TrendingUp, Shield } from 'lucide-react';

export default function LoginPageContent() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { initializeMockData } = useDataStore();
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
      
      // Initialize mock data on login
      initializeMockData();
      
      // Set auth state with mock data
      setAuth(
        { id: 'u2', name: 'LAPPYCOM TECHNOLOGY', email: form.email, role: 'STAFF' },
        { id: 'shop1', name: 'LAPPYCOM TECHNOLOGY' },
        'dummy-token-123'
      );
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-sidebar p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-50" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4cd6ff]/40 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#4cd6ff,#00e1ab)'}}>
              <Zap className="w-5 h-5 text-[#101319]" />
            </div>
            <span className="text-xl font-display font-semibold text-foreground">BillMate Pro</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground leading-tight mb-4">
              Built for modern<br />
              <span className="text-gradient">businesses.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Multi-tenant billing, inventory management, and POS — all in one place.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: <TrendingUp className="w-5 h-5 text-[#4cd6ff]" />, title: 'Real-time Analytics', desc: 'Live revenue and inventory tracking' },
              { icon: <Shield className="w-5 h-5 text-[#00FFC2]" />, title: 'Complete Data Isolation', desc: 'Every shop has its own private data' },
              { icon: <Zap className="w-5 h-5 text-[#ffd60a]" />, title: 'Fast POS Billing', desc: 'Generate invoices in under 10 seconds' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">{f.icon}</div>
                <div>
                  <div className="text-sm font-medium text-foreground">{f.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">© 2026 BillMate Pro. All rights reserved.</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#4cd6ff,#00e1ab)'}}>
              <Zap className="w-4 h-4 text-[#101319]" />
            </div>
            <span className="text-xl font-display font-semibold">BillMate Pro</span>
          </div>

          <h2 className="text-2xl font-display font-semibold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your shop account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-[#ff4d6d]/10 border border-[#ff4d6d]/30 text-[#ff4d6d] text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@yourshop.com"
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

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#101319]/30 border-t-[#101319] rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link href="/master/login" className="text-xs text-muted-foreground hover:text-[#4cd6ff] transition-colors flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Master Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
