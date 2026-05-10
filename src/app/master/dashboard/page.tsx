'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMasterAuthStore } from '@/stores/masterAuthStore';
import { ShieldAlert, Trash2, Plus, LogOut, CheckCircle, XCircle } from 'lucide-react';

export default function MasterDashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useMasterAuthStore();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    shop_name: '', owner_name: '', email: '', password: '', phone: '',
    gst_number: '', address: '', subscription_end_date: '', subscription_plan: 'FREE', subscription_charges: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'MASTER') {
      router.replace('/master/login');
      return;
    }
    fetchShops();
  }, [token, user, router]);

  const fetchShops = async () => {
    setLoading(true);
    setTimeout(() => {
      setShops([
        {
          id: 'shop1',
          name: 'LAPPYCOM TECHNOLOGY',
          owner_name: 'LAPPYCOM TECHNOLOGY',
          email: 'admin@lappycom.com',
          subscription_plan: 'PRO',
          subscription_charges: 999,
          subscription_end_date: null,
          created_at: new Date().toISOString(),
          _count: { users: 2, invoices: 10 }
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setError('');
    setTimeout(() => {
      setShops(prev => [...prev, {
        id: `shop${Date.now()}`,
        name: form.shop_name,
        owner_name: form.owner_name,
        email: form.email,
        subscription_plan: form.subscription_plan,
        subscription_charges: Number(form.subscription_charges) || 0,
        subscription_end_date: form.subscription_end_date || null,
        created_at: new Date().toISOString(),
        _count: { users: 1, invoices: 0 }
      }]);
      setForm({ shop_name: '', owner_name: '', email: '', password: '', phone: '', gst_number: '', address: '', subscription_end_date: '', subscription_plan: 'FREE', subscription_charges: '' });
      setShowAddModal(false);
      setFormLoading(false);
    }, 500);
  };

  const handleDeleteShop = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will permanently wipe all data for this shop.`)) return;
    setShops(prev => prev.filter(s => s.id !== id));
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-sidebar text-foreground">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">Master Admin Console</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <button onClick={logout} className="p-2 hover:bg-[#ff4d6d]/10 text-[#ff4d6d] rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold">Registered Shops ({shops.length})</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage global SaaS instances and billing.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 px-4 py-2">
            <Plus className="w-4 h-4" /> Create Shop
          </button>
        </div>

        {loading ? (
          <div className="text-muted-foreground text-center py-20">Loading instances...</div>
        ) : (
          <div className="bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-border text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  <th className="py-4 px-5">Workspace</th>
                  <th className="py-4 px-5">Administrator</th>
                  <th className="py-4 px-5">Subscription</th>
                  <th className="py-4 px-5">Billing Period</th>
                  <th className="py-4 px-5 text-center">Stats</th>
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#32353b]/30">
                {shops.map((shop) => {
                  const subEnd = shop.subscription_end_date ? new Date(shop.subscription_end_date) : null;
                  const isActive = !subEnd || subEnd > new Date();

                  return (
                    <tr key={shop.id} className="hover:bg-card transition-colors group">
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-display font-semibold text-white tracking-wide text-base">{shop.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono mt-0.5 bg-card px-1.5 py-0.5 rounded self-start border border-border">ID: {shop.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="text-foreground text-sm font-medium">{shop.owner_name}</span>
                          <span className="text-xs text-[#00e1ab]/80 hover:text-[#00e1ab] transition-colors">{shop.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className={`inline-flex self-start px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase mb-1 border
                            ${shop.subscription_plan === 'PRO' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                              shop.subscription_plan === 'BASIC' ? 'bg-[#4cd6ff]/10 text-[#4cd6ff] border-[#4cd6ff]/20' : 
                              'bg-accent text-muted-foreground border-border'}`}>
                            {shop.subscription_plan || 'FREE'}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-mono text-foreground font-medium">₹{shop.subscription_charges || 0}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">/mo</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col text-[11px] text-muted-foreground space-y-1">
                          <div className="grid grid-cols-[36px_1fr] items-center">
                            <span className="uppercase tracking-wider">Start:</span>
                            <span className="text-gray-300 font-medium">{new Date(shop.created_at || Date.now()).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
                          </div>
                          <div className="grid grid-cols-[36px_1fr] items-center">
                            <span className="uppercase tracking-wider">End:</span>
                            <span className={`font-medium ${subEnd && !isActive ? 'text-[#ff4d6d]' : 'text-gray-300'}`}>
                              {subEnd ? subEnd.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) : 'Lifetime'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[10px] font-mono bg-muted text-foreground px-2 py-0.5 rounded-full border border-border">
                            {shop._count?.users || 0} usr
                          </span>
                          <span className="text-[10px] font-mono bg-muted text-foreground px-2 py-0.5 rounded-full border border-border">
                            {shop._count?.invoices || 0} inv
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${isActive ? 'bg-[#00e1ab]/10 text-[#00e1ab] border-[#00e1ab]/20' : 'bg-[#ff4d6d]/10 text-[#ff4d6d] border-[#ff4d6d]/20'}`}>
                          {isActive ? <div className="w-1.5 h-1.5 rounded-full bg-[#00e1ab] animate-pulse" /> : <XCircle className="w-3 h-3" />}
                          {isActive ? 'Active' : 'Expired'}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleDeleteShop(shop.id, shop.name)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-[#ff4d6d] hover:bg-[#ff4d6d]/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete Shop Workspace"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {shops.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted text-muted-foreground mb-3">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <p className="text-muted-foreground text-sm">No SaaS instances provisioned yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add Shop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-display font-medium text-white">Provision New Shop</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateShop} className="p-6">
              {error && <div className="mb-4 p-3 rounded-lg bg-[#ff4d6d]/10 text-[#ff4d6d] text-sm border border-[#ff4d6d]/30">{error}</div>}
              
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Shop Name *</label>
                  <input type="text" required value={form.shop_name} onChange={(e) => setForm({...form, shop_name: e.target.value})} className="input-field" placeholder="e.g. My Cafe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Owner Name *</label>
                  <input type="text" required value={form.owner_name} onChange={(e) => setForm({...form, owner_name: e.target.value})} className="input-field" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Admin Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input-field" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Admin Password *</label>
                  <input type="password" required value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input-field" placeholder="Min 6 chars" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Phone (Optional)</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input-field" placeholder="+1..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Subscription Plan</label>
                  <select value={form.subscription_plan} onChange={(e) => setForm({...form, subscription_plan: e.target.value})} className="input-field">
                    <option value="FREE">Free Tier</option>
                    <option value="BASIC">Basic Plan</option>
                    <option value="PRO">Pro Plan</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Monthly Charges (₹)</label>
                  <input type="number" required value={form.subscription_charges} onChange={(e) => setForm({...form, subscription_charges: e.target.value})} className="input-field font-mono" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Subscription Expiry</label>
                  <input type="date" value={form.subscription_end_date} onChange={(e) => setForm({...form, subscription_end_date: e.target.value})} className="input-field" />
                  <p className="text-[10px] text-muted-foreground mt-1">Leave empty for lifetime access</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-white hover:bg-card transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                  {formLoading ? 'Provisioning...' : 'Provision Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
