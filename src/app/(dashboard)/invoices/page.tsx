'use client';
import { useEffect, useState, useRef } from 'react';
import { useDataStore } from '@/stores/dataStore';
import Link from 'next/link';
import { format } from 'date-fns';
import { Search, Filter, FileText, X, ChevronLeft, ChevronRight, Eye, Printer, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface Invoice {
  id: string; invoice_number: string;
  customer?: { name: string; phone?: string };
  customer_name?: string;
  creator: { name: string };
  grand_total: number; status: string; created_at: string;
}

const statusBadge: Record<string, string> = {
  PAID: 'badge-success', DRAFT: 'badge-info', CANCELLED: 'badge-danger',
};

export default function InvoicesPage() {
  const { invoices: storeInvoices, deleteInvoice } = useDataStore();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 15;
  const { user } = useAuthStore();

  const handleDelete = async (id: string, invoiceNum: string) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNum}?`)) return;
    deleteInvoice(id);
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = storeInvoices.map(inv => ({
        ...inv,
        creator: { name: 'LAPPYCOM TECHNOLOGY' },
        status: 'PAID'
      }));

      if (search) {
        filtered = filtered.filter(i => 
          i.invoice_number.toLowerCase().includes(search.toLowerCase()) || 
          (i.customer_name || '').toLowerCase().includes(search.toLowerCase())
        );
      }
      if (from) {
        filtered = filtered.filter(i => new Date(i.created_at) >= new Date(from));
      }
      if (to) {
        filtered = filtered.filter(i => new Date(i.created_at) <= new Date(to));
      }
      if (status) {
        filtered = filtered.filter(i => i.status === status);
      }

      setTotal(filtered.length);
      setInvoices(filtered.slice((page - 1) * limit, page * limit));
      setLoading(false);
    }, 300);
  }, [search, from, to, status, page, storeInvoices]);

  const pages = Math.ceil(total / limit);
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="section-title">Invoices</h2>
          <p className="section-subtitle">{total} total records</p>
        </div>
        <Link href="/pos" className="btn-primary"><FileText className="w-4 h-4" /> New Invoice</Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search invoice # or customer..." className="input-field pl-10" />
          </div>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="input-field w-36 text-xs" />
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="input-field w-36 text-xs" />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field w-28 text-xs">
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {(search || from || to || status) && (
            <button onClick={() => { setSearch(''); setFrom(''); setTo(''); setStatus(''); setPage(1); }}
              className="btn-ghost px-3"><X className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-t-[#4cd6ff] border-r-[#4cd6ff] border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No invoices found</td></tr>
                ) : invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs text-[#4cd6ff]">{inv.invoice_number}</td>
                    <td>
                      <div className="text-sm text-foreground">
                        {inv.customer_name || inv.customer?.name || <span className="text-muted-foreground italic">Walk-in</span>}
                      </div>
                      {inv.customer?.phone && <div className="text-xs text-muted-foreground">{inv.customer.phone}</div>}
                      {!inv.customer && inv.customer_name && <div className="text-[10px] text-muted-foreground italic">Walk-in</div>}
                    </td>
                    <td className="text-xs">{inv.creator.name}</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(inv.created_at), 'dd MMM yyyy, HH:mm')}</td>
                    <td><span className={`badge ${statusBadge[inv.status] || 'badge-muted'}`}>{inv.status}</span></td>
                    <td className="text-right font-mono font-semibold text-foreground">{fmt(inv.grand_total)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/invoices/${inv.id}`} className="w-7 h-7 rounded-lg bg-muted text-muted-foreground hover:text-[#4cd6ff] flex items-center justify-center transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <button onClick={() => handleDelete(inv.id, inv.invoice_number)} className="w-7 h-7 rounded-lg bg-muted text-[#ff4d6d] hover:bg-[#ff4d6d]/20 flex items-center justify-center transition-colors" title="Delete Invoice">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Page {page} of {pages} · {total} records</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-ghost px-2 py-1.5 text-xs disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="btn-ghost px-2 py-1.5 text-xs disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
