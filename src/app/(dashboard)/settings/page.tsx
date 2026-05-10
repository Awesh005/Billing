'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Save, Building2, FileText, Phone, MapPin, Hash } from 'lucide-react';

export default function SettingsPage() {
  const { shop, updateShop, user } = useAuthStore();
  const [form, setForm] = useState({ name: '', owner_name: '', phone: '', gst_number: '', address: '', invoice_prefix: 'INV' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || '', owner_name: '', phone: shop.phone || '',
        gst_number: shop.gst_number || '', address: shop.address || '',
        invoice_prefix: shop.invoice_prefix || 'INV',
      });
    }
  }, [shop]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      await new Promise(res => setTimeout(res, 500));
      updateShop({ name: form.name, gst_number: form.gst_number, phone: form.phone, address: form.address, invoice_prefix: form.invoice_prefix });
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Save failed');
    } finally { setSaving(false); }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Admin access required to manage shop settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div><h2 className="section-title">Shop Settings</h2><p className="section-subtitle">Configure your shop profile and invoice settings</p></div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-foreground text-sm border-b border-border pb-3">Business Information</h3>

          {success && <div className="p-3 rounded-lg bg-[#00FFC2]/10 border border-[#00FFC2]/30 text-[#00FFC2] text-sm">{success}</div>}
          {error && <div className="p-3 rounded-lg bg-[#ff4d6d]/10 border border-[#ff4d6d]/30 text-[#ff4d6d] text-sm">{error}</div>}

          {[
            { label: 'Shop / Company Name', key: 'name', icon: Building2, required: true, placeholder: 'My Shop' },
            { label: 'Owner Name', key: 'owner_name', icon: Building2, placeholder: 'Your name' },
            { label: 'Phone', key: 'phone', icon: Phone, placeholder: '+91 98765 43210' },
            { label: 'GST Number', key: 'gst_number', icon: FileText, placeholder: '22AAAAA0000A1Z5', mono: true },
          ].map(({ label, key, icon: Icon, required, placeholder, mono }) => (
            <div key={key}>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">{label}{required ? ' *' : ''}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input required={required} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder} className={`input-field pl-10 ${mono ? 'font-mono' : ''}`} />
              </div>
            </div>
          ))}

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Full shop address..." rows={2} className="input-field pl-10 resize-none" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-foreground text-sm border-b border-border pb-3">Invoice Configuration</h3>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Invoice Prefix</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={form.invoice_prefix} onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) })}
                maxLength={6} placeholder="INV" className="input-field pl-10 font-mono uppercase" />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Invoice numbers will look like: <span className="font-mono text-[#4cd6ff]">{form.invoice_prefix || 'INV'}-SHOP-20260404-0001</span></p>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-[#101319]/30 border-t-[#101319] rounded-full animate-spin" /> Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center"><Save className="w-4 h-4" /> Save Settings</span>
          )}
        </button>
      </form>
    </div>
  );
}
