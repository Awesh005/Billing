'use client';
import { useEffect, useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { Search, Plus, Pencil, Trash2, X, Package, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface Product { id: string; name: string; sku?: string; category?: string; image_url?: string; selling_price: number; purchase_price: number; tax_pct: number; stock: number; low_stock_alert: number; }

const emptyForm = { name: '', sku: '', category: '', image_url: '', description: '', purchase_price: '', selling_price: '', tax_pct: '0', stock: '0', low_stock_alert: '5', barcode: '' };

export default function ProductsPage() {
  const { products: storeProducts, addProduct, updateProduct, deleteProduct } = useDataStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageInputKey, setImageInputKey] = useState(0);
  const limit = 15;

  const load = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = storeProducts;
      if (search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));
      }
      setTotal(filtered.length);
      setProducts(filtered.slice((page - 1) * limit, page * limit));
      setLoading(false);
    }, 300);
  };

  useEffect(() => { load(); }, [search, page, storeProducts]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setImageInputKey((k) => k + 1); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku || '', category: p.category || '', image_url: p.image_url || '', description: '', purchase_price: String(p.purchase_price), selling_price: String(p.selling_price), tax_pct: String(p.tax_pct), stock: String(p.stock), low_stock_alert: String(p.low_stock_alert), barcode: '' });
    setError(''); setImageInputKey((k) => k + 1); setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image_url: String(reader.result || '') }));
      setError('');
    };
    reader.onerror = () => setError('Failed to load image');
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setForm((prev) => ({ ...prev, image_url: '' }));
    setImageInputKey((k) => k + 1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await new Promise(res => setTimeout(res, 400));
      const payload: any = { 
        ...form, 
        purchase_price: Number(form.purchase_price), 
        selling_price: Number(form.selling_price), 
        tax_pct: Number(form.tax_pct), 
        stock: Number(form.stock), 
        low_stock_alert: Number(form.low_stock_alert),
        image_url: form.image_url || undefined
      };
      if (editing) {
        updateProduct(editing.id, payload);
      } else {
        addProduct({ id: `p${Date.now()}`, ...payload });
      }
      setShowModal(false);
    } catch (err: any) {
      setError('Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteProduct(id);
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div><h2 className="section-title">Products</h2><p className="section-subtitle">{total} items in catalog</p></div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, SKU..." className="input-field pl-10" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th><th>SKU</th><th>Category</th>
                <th className="text-right">Buy</th><th className="text-right">Sell</th>
                <th className="text-right">Tax</th><th className="text-right">Stock</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10"><div className="w-6 h-6 border-2 border-t-[#4cd6ff] border-r-[#4cd6ff] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" /><br />No products yet
                </td></tr>
              ) : products.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-border bg-muted/50 overflow-hidden flex items-center justify-center">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="font-mono text-xs">{p.sku || '—'}</td>
                  <td>{p.category ? <span className="badge badge-muted">{p.category}</span> : '—'}</td>
                  <td className="text-right font-mono text-xs">₹{Number(p.purchase_price).toLocaleString('en-IN')}</td>
                  <td className="text-right font-mono font-semibold text-[#4cd6ff]">₹{Number(p.selling_price).toLocaleString('en-IN')}</td>
                  <td className="text-right text-xs">{p.tax_pct}%</td>
                  <td className="text-right">
                    <span className={`font-mono font-bold text-sm ${p.stock === 0 ? 'text-[#ff4d6d]' : p.stock <= p.low_stock_alert ? 'text-[#ffd60a]' : 'text-[#00FFC2]'}`}>{p.stock}</span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg bg-muted text-muted-foreground hover:text-[#4cd6ff] flex items-center justify-center transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="w-7 h-7 rounded-lg bg-muted text-muted-foreground hover:text-[#ff4d6d] flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 mx-4 shadow-float max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-foreground">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="mb-4 text-xs text-[#ff4d6d] bg-[#ff4d6d]/10 px-3 py-2 rounded-lg border border-[#ff4d6d]/30">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Product Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border border-border bg-muted/50 overflow-hidden flex items-center justify-center">
                      {form.image_url ? (
                        <img src={form.image_url} alt="Product preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        key={imageInputKey}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground"
                      />
                      {form.image_url && (
                        <button type="button" onClick={clearImage} className="text-xs text-[#ff4d6d] hover:underline">Remove photo</button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Product Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. Blue Pen" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">SKU</label>
                  <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input-field font-mono" placeholder="PEN-001" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Category</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" placeholder="Stationery" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Purchase Price ₹</label>
                  <input type="number" step="0.01" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} className="input-field font-mono" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Selling Price ₹ *</label>
                  <input required type="number" step="0.01" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} className="input-field font-mono" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Tax %</label>
                  <select value={form.tax_pct} onChange={(e) => setForm({ ...form, tax_pct: e.target.value })} className="input-field">
                    {[0, 5, 12, 18, 28].map(t => <option key={t} value={t}>{t}%</option>)}
                  </select>
                </div>
                {!editing && (
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Opening Stock</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field font-mono" placeholder="0" />
                  </div>
                )}
                <div className={editing ? 'col-span-1' : ''}>
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Low Stock Alert</label>
                  <input type="number" value={form.low_stock_alert} onChange={(e) => setForm({ ...form, low_stock_alert: e.target.value })} className="input-field font-mono" placeholder="5" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
