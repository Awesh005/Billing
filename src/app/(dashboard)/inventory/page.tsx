'use client';
import { useEffect, useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { AlertTriangle, ArrowUpDown, Boxes, TrendingDown, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface StockItem { id: string; name: string; sku?: string; stock: number; low_stock_alert: number; category?: string; }
interface StockLog { id: string; delta: number; reason: string; reference?: string; created_at: string; product: { name: string; sku?: string }; }

export default function InventoryPage() {
  const { products: storeProducts, updateProduct } = useDataStore();
  const [products, setProducts] = useState<StockItem[]>([]);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [tab, setTab] = useState<'stock' | 'logs'>('stock');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adjustModal, setAdjustModal] = useState<StockItem | null>(null);
  const [adjustForm, setAdjustForm] = useState({ delta: '', reason: 'ADJUSTMENT', notes: '' });
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      if (tab === 'stock') {
        setTotal(storeProducts.length);
        setProducts(storeProducts.slice((page - 1) * 20, page * 20));
      } else {
        setTotal(logs.length);
      }
      setLoading(false);
    }, 300);
  }, [tab, page, storeProducts, logs]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault(); setAdjusting(true);
    try {
      await new Promise(res => setTimeout(res, 400));
      const deltaNumber = Number(adjustForm.delta);
      const updatedStock = adjustModal!.stock + deltaNumber;
      
      updateProduct(adjustModal!.id, { stock: updatedStock });
      
      const newLog: StockLog = {
        id: Date.now().toString(),
        delta: deltaNumber,
        reason: adjustForm.reason,
        reference: adjustForm.notes,
        created_at: new Date().toISOString(),
        product: { name: adjustModal!.name, sku: adjustModal!.sku }
      };
      setLogs(prev => [newLog, ...prev]);
      
      setAdjustModal(null);
      setPage(1);
    } finally { setAdjusting(false); }
  };

  const reasonColor: Record<string, string> = { SALE: 'badge-danger', PURCHASE: 'badge-success', ADJUSTMENT: 'badge-info', RETURN: 'badge-warning' };
  const pages = Math.ceil(total / 20);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div><h2 className="section-title">Inventory</h2><p className="section-subtitle">Track stock levels and movements</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['stock', 'logs'] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === t ? 'bg-[#4cd6ff]/15 text-[#4cd6ff] border border-[#4cd6ff]/30' : 'text-muted-foreground hover:text-foreground bg-card border border-border'}`}>
            {t === 'stock' ? <span className="flex items-center gap-2"><Boxes className="w-4 h-4" />Stock Levels</span> : <span className="flex items-center gap-2"><ArrowUpDown className="w-4 h-4" />Stock Logs</span>}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {tab === 'stock' ? (
            <table className="data-table">
              <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th className="text-right">Stock</th><th className="text-right">Alert At</th><th className="text-right">Status</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10"><div className="w-6 h-6 border-2 border-t-[#4cd6ff] border-r-[#4cd6ff] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : products.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium text-foreground">{p.name}</td>
                    <td className="font-mono text-xs">{p.sku || '—'}</td>
                    <td>{p.category ? <span className="badge badge-muted">{p.category}</span> : '—'}</td>
                    <td className="text-right font-mono font-bold text-lg">{p.stock}</td>
                    <td className="text-right font-mono text-xs text-muted-foreground">{p.low_stock_alert}</td>
                    <td className="text-right">
                      {p.stock === 0 ? <span className="badge badge-danger">Out of Stock</span> :
                        p.stock <= p.low_stock_alert ? (
                          <span className="badge badge-warning flex items-center gap-1 justify-end"><AlertTriangle className="w-3 h-3" />Low</span>
                        ) : <span className="badge badge-success">OK</span>}
                    </td>
                    <td className="text-right">
                      <button onClick={() => { setAdjustModal(p); setAdjustForm({ delta: '', reason: 'ADJUSTMENT', notes: '' }); }}
                        className="btn-ghost px-3 py-1.5 text-xs">Adjust</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="data-table">
              <thead><tr><th>Product</th><th>Change</th><th>Reason</th><th>Reference</th><th>Date</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-10"><div className="w-6 h-6 border-2 border-t-[#4cd6ff] border-r-[#4cd6ff] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : logs.map((l) => (
                  <tr key={l.id}>
                    <td className="font-medium text-foreground">{l.product.name}</td>
                    <td>
                      <span className={`flex items-center gap-1 font-mono font-bold text-sm ${l.delta > 0 ? 'text-[#00FFC2]' : 'text-[#ff4d6d]'}`}>
                        {l.delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {l.delta > 0 ? '+' : ''}{l.delta}
                      </span>
                    </td>
                    <td><span className={`badge ${reasonColor[l.reason] || 'badge-muted'}`}>{l.reason}</span></td>
                    <td className="font-mono text-xs text-muted-foreground">{l.reference ? l.reference.slice(0, 12) + '...' : '—'}</td>
                    <td className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

      {/* Adjust modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-sm p-6 mx-4 shadow-float">
            <h3 className="font-display font-semibold text-foreground mb-1">Adjust Stock</h3>
            <p className="text-xs text-muted-foreground mb-5">{adjustModal.name} · Current: <span className="font-mono font-bold text-foreground">{adjustModal.stock}</span></p>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Delta (+ add / − remove)</label>
                <input required type="number" value={adjustForm.delta} onChange={(e) => setAdjustForm({ ...adjustForm, delta: e.target.value })}
                  placeholder="e.g. +10 or -5" className="input-field font-mono" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Reason</label>
                <select value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} className="input-field">
                  <option value="ADJUSTMENT">Adjustment</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="RETURN">Return</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Notes</label>
                <input value={adjustForm.notes} onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })} className="input-field" placeholder="Optional note..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAdjustModal(null)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={adjusting} className="btn-primary flex-1">{adjusting ? 'Saving...' : 'Apply'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
