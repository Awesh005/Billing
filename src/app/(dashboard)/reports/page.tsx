'use client';
import { useEffect, useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, FileText, DollarSign, Percent } from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);

  const { invoices: storeInvoices, products } = useDataStore();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filteredInvoices = storeInvoices;
      if (from) filteredInvoices = filteredInvoices.filter(i => new Date(i.created_at) >= new Date(from));
      if (to) filteredInvoices = filteredInvoices.filter(i => new Date(i.created_at) <= new Date(to));

      const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.grand_total, 0);
      const totalTax = filteredInvoices.reduce((sum, inv) => sum + inv.tax, 0);
      const invoiceCount = filteredInvoices.length;
      
      const byStatus = [
        { status: 'PAID', count: invoiceCount, revenue: totalRevenue }
      ];

      const dashData = {
        daily_revenue: [
          { date: '2023-10-10', revenue: 1200, count: 5 },
          { date: '2023-10-11', revenue: 2300, count: 8 }
        ],
        top_products: products.slice(0, 5).map(p => ({
          product_id: p.id,
          name: p.name,
          revenue: Math.floor(Math.random() * 5000)
        })).sort((a, b) => b.revenue - a.revenue)
      };

      setData({
        summary: {
          total_revenue: totalRevenue,
          invoice_count: invoiceCount,
          avg_invoice: invoiceCount > 0 ? totalRevenue / invoiceCount : 0,
          total_tax: totalTax
        },
        by_status: byStatus
      });
      setDashboard(dashData);
      setLoading(false);
    }, 400);
  }, [from, to, storeInvoices, products]);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const PIE_COLORS = ['#4cd6ff', '#00FFC2', '#ffd60a', '#ff4d6d'];

  const byStatusData = data?.by_status?.map((s: any) => ({
    name: s.status, value: s.count, revenue: s.revenue,
  })) || [];

  const chartData = dashboard?.daily_revenue?.map((d: any) => ({
    date: d.date.slice(5), revenue: d.revenue, count: d.count,
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="section-title">Reports</h2><p className="section-subtitle">Sales analytics and performance</p></div>
        <div className="flex gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field w-36 text-xs py-2" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field w-36 text-xs py-2" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-t-[#4cd6ff] border-r-[#4cd6ff] border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: fmt(data?.summary?.total_revenue || 0), icon: DollarSign, color: '#4cd6ff' },
              { label: 'Invoices', value: String(data?.summary?.invoice_count || 0), icon: FileText, color: '#00FFC2' },
              { label: 'Avg Invoice', value: fmt(data?.summary?.avg_invoice || 0), icon: TrendingUp, color: '#ffd60a' },
              { label: 'Total Tax', value: fmt(data?.summary?.total_tax || 0), icon: Percent, color: '#7000FF' },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                    <s.icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                </div>
                <div className="text-xl font-display font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bar chart */}
            <div className="glass-card p-6 lg:col-span-2">
              <div className="section-title text-base mb-1">Daily Revenue</div>
              <div className="section-subtitle mb-4">Last 7 days</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#32353b50" />
                  <XAxis dataKey="date" tick={{ fill: '#849495', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#849495', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1d2025', border: '1px solid #32353b', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="revenue" fill="#4cd6ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="glass-card p-6">
              <div className="section-title text-base mb-1">Invoice Status</div>
              <div className="section-subtitle mb-4">All time</div>
              {byStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={byStatusData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                      {byStatusData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1d2025', border: '1px solid #32353b', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No data</div>
              )}
            </div>
          </div>

          {/* Top products */}
          {dashboard?.top_products?.length > 0 && (
            <div className="glass-card p-6">
              <div className="section-title text-base mb-4">Top Products by Revenue</div>
              <div className="space-y-3">
                {dashboard.top_products.map((p: any, i: number) => {
                  const max = dashboard.top_products[0]?.revenue || 1;
                  const pct = Math.round((p.revenue / max) * 100);
                  return (
                    <div key={p.product_id} className="flex items-center gap-4">
                      <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground font-medium">{p.name}</span>
                          <span className="font-mono text-[#4cd6ff] font-semibold">{fmt(p.revenue)}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #4cd6ff, #00e1ab)' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
