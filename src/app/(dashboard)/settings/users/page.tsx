'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { Plus, X, UserCog, Shield, User } from 'lucide-react';

interface StaffUser { id: string; name: string; email: string; role: string; is_active: boolean; created_at?: string; }

export default function StaffSettingsPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { users: storeUsers } = useDataStore();

  const load = () => { 
    setLoading(true);
    setTimeout(() => {
      setUsers(storeUsers.map(u => ({ ...u, created_at: new Date().toISOString() })));
      setLoading(false);
    }, 300);
  };

  useEffect(() => { load(); }, [storeUsers]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground"><UserCog className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>Admin access required</p></div>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await new Promise(res => setTimeout(res, 400));
      const newUser: StaffUser = {
        id: `u${Date.now()}`,
        name: form.name,
        email: form.email,
        role: form.role,
        is_active: true,
        created_at: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
      setShowModal(false); 
      setForm({ name: '', email: '', password: '', role: 'STAFF' });
    } catch (err: any) { setError('Failed to create user'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (u: StaffUser) => {
    setUsers(prev => prev.map(user => user.id === u.id ? { ...user, is_active: !user.is_active } : user));
  };
  const deleteUser = async (u: StaffUser) => {
    if (!confirm(`Delete ${u.name}?`)) return;
    setUsers(prev => prev.filter(user => user.id !== u.id));
  };

  return (
    <div className="max-w-3xl space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div><h2 className="section-title">Staff Management</h2><p className="section-subtitle">Manage who has access to your shop</p></div>
        <button onClick={() => { setShowModal(true); setError(''); }} className="btn-primary"><Plus className="w-4 h-4" /> Add Staff</button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
          <thead><tr><th>Staff Member</th><th>Email</th><th>Role</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10"><div className="w-6 h-6 border-2 border-t-[#4cd6ff] border-r-[#4cd6ff] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#101319] text-xs font-bold shrink-0"
                      style={{ background: u.role === 'ADMIN' ? 'linear-gradient(135deg, #4cd6ff, #00e1ab)' : '#32353b' }}>
                      {u.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{u.name}</div>
                      {u.id === user?.id && <div className="text-[10px] text-[#4cd6ff]">You</div>}
                    </div>
                  </div>
                </td>
                <td className="text-xs">{u.email}</td>
                <td>
                  <span className={`badge flex items-center gap-1 w-fit ${u.role === 'ADMIN' ? 'badge-info' : 'badge-muted'}`}>
                    {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}{u.role}
                  </span>
                </td>
                <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="text-right">
                  {u.id !== user?.id && (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleActive(u)} className={`px-3 py-1 rounded text-xs border transition-colors ${u.is_active ? 'text-[#ffd60a] border-[#ffd60a]/30 hover:bg-[#ffd60a]/10' : 'text-[#00FFC2] border-[#00FFC2]/30 hover:bg-[#00FFC2]/10'}`}>
                        {u.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => deleteUser(u)} className="w-7 h-7 rounded-lg bg-muted text-muted-foreground hover:text-[#ff4d6d] flex items-center justify-center transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 mx-4 shadow-float">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-foreground">Add Staff Member</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="mb-4 text-xs text-[#ff4d6d] bg-[#ff4d6d]/10 px-3 py-2 rounded-lg border border-[#ff4d6d]/30">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Full Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Staff name" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="staff@yourshop.com" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Password *</label>
                <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
