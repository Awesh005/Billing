'use client';
import { useEffect, useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { Search, Plus, Pencil, Trash2, X, Users as UsersIcon, ChevronLeft, ChevronRight, Phone } from 'lucide-react';

interface Customer { id: string; name: string; phone?: string; email?: string; address?: string; gst_number?: string; }
const empty = { name: '', phone: '', email: '', address: '', gst_number: '' };

export default function CustomersPage() {
  const { customers: storeCustomers, addCustomer, updateCustomer, deleteCustomer } = useDataStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const limit = 15;

  const load = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = storeCustomers;
      if (search) {
        filtered = filtered.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));
      }
      setTotal(filtered.length);
      setCustomers(filtered.slice((page - 1) * limit, page * limit));
      setLoading(false);
    }, 300);
  };

  useEffect(() => { load(); }, [search, page, storeCustomers]);

  const openCreate = () => { setEditing(null); setForm(empty); setError(''); setShowModal(true); };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', gst_number: c.gst_number || '' });
    setError(''); setShowModal(true);
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await new Promise(res => setTimeout(res, 400));
      if (editing) {
        updateCustomer(editing.id, form);
      } else {
        addCustomer({ id: `c${Date.now()}`, ...form });
      }
      setShowModal(false);
    } catch (err: any) { setError('Save failed'); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete customer "${name}"?`)) return;
    deleteCustomer(id);
  };
  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div><h2 className="section-title">Customers</h2><p className="section-subtitle">{total} registered customers</p></div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Customer</button>
      </div>

      <div className="glass-card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or phone..." className="input-field pl-10" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Email</th><th>GST</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10"><div className="w-6 h-6 border-2 border-t-[#4cd6ff] border-r-[#4cd6ff] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">
                  <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-40" /><br />No customers yet
                </td></tr>
              ) : customers.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-foreground">{c.name}</td>
                  <td>{c.phone ? <span className="flex items-center gap-1 text-xs"><Phone className="w-3 h-3" />{c.phone}</span> : '—'}</td>
                  <td className="text-xs">{c.email || '—'}</td>
                  <td className="font-mono text-xs">{c.gst_number || '—'}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg bg-muted text-muted-foreground hover:text-[#4cd6ff] flex items-center justify-center transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="w-7 h-7 rounded-lg bg-muted text-muted-foreground hover:text-[#ff4d6d] flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-2 py-1.5 text-xs disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-ghost px-2 py-1.5 text-xs disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 mx-4 shadow-float">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-foreground">{editing ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="mb-4 text-xs text-[#ff4d6d] bg-[#ff4d6d]/10 px-3 py-2 rounded-lg border border-[#ff4d6d]/30">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: 'Full Name *', key: 'name', required: true, placeholder: 'John Smith' },
                { label: 'Phone', key: 'phone', placeholder: '+91 98765 43210' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' },
                { label: 'Address', key: 'address', placeholder: 'Street, City, State' },
                { label: 'GST Number', key: 'gst_number', placeholder: '22AAAAA0000A1Z5', mono: true },
              ].map(({ label, key, required, placeholder, type, mono }) => (
                <div key={key}>
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
                  <input required={required} type={type || 'text'}
                    value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder} className={`input-field ${mono ? 'font-mono' : ''}`} />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
