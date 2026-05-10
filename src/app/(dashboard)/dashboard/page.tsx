'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { TrendingUp, FileText, Package, Users, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

interface DashboardData {
  today: { revenue: number; invoices: number };
  month: { revenue: number; invoices: number };
  totals: { invoices: number; products: number; customers: number };
  daily_revenue: { date: string; revenue: number; count: number }[];
  top_products: { name: string; revenue: number; qty_sold: number }[];
  low_stock: { id: string; name: string; stock: number; low_stock_alert: number }[];
}

function StatCard({ title, value, sub, icon: Icon, color, href }: {
  title: string; value: string; sub?: string; icon: any; color: string; href?: string;
}) {
  const content = (
    <div className="stat-card glass-card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {href && <ArrowUpRight className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="text-2xl font-display font-bold text-foreground mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{title}</div>
      {sub && <div className="text-xs text-[#4cd6ff] mt-1">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-4 py-3 border border-border">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-[#4cd6ff]">₹{payload[0].value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{payload[1]?.value} invoices</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { shop } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const { products, customers, invoices } = useDataStore();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const todayInvoices = invoices.filter(i => new Date(i.created_at) >= today);
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthInvoices = invoices.filter(i => new Date(i.created_at) >= startOfMonth);

      const topProductsMap: any = {};
      invoices.forEach(inv => {
        inv.items.forEach(item => {
          const p = products.find(prod => prod.id === item.product_id);
          const name = p ? p.name : 'Unknown';
          if (!topProductsMap[name]) topProductsMap[name] = { name, revenue: 0, qty_sold: 0 };
          const itemRev = item.qty * item.unit_price;
          topProductsMap[name].revenue += itemRev;
          topProductsMap[name].qty_sold += item.qty;
        });
      });

      setData({
        today: {
          revenue: todayInvoices.reduce((sum, inv) => sum + inv.grand_total, 0),
          invoices: todayInvoices.length
        },
        month: {
          revenue: monthInvoices.reduce((sum, inv) => sum + inv.grand_total, 0),
          invoices: monthInvoices.length
        },
        totals: {
          invoices: invoices.length,
          products: products.length,
          customers: customers.length
        },
        daily_revenue: [], // Simple mock
        top_products: Object.values(topProductsMap).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5) as any,
        low_stock: products.filter(p => p.stock <= p.low_stock_alert).map(p => ({
          id: p.id, name: p.name, stock: p.stock, low_stock_alert: p.low_stock_alert
        }))
      });
      setLoading(false);
    }, 500);
  }, [invoices, products, customers]);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-t-[#4cd6ff] border-r-[#4cd6ff] border-b-transparent border-l-transparent rounded-full animate-spin" />
    </div>
  );

  const chartData = data?.daily_revenue.map((d) => ({
    date: format(new Date(d.date), 'MMM d'),
    revenue: d.revenue,
    invoices: d.count,
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening with <span className="text-[#4cd6ff]">{shop?.name}</span> today</p>
        </div>
        <Link href="/pos" className="btn-primary">
          <FileText className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Revenue" value={fmt(data?.today.revenue || 0)} sub={`${data?.today.invoices} invoices`} icon={TrendingUp} color="#4cd6ff" />
        <StatCard title="Month Revenue" value={fmt(data?.month.revenue || 0)} sub={`${data?.month.invoices} invoices`} icon={TrendingUp} color="#00FFC2" />
        <StatCard title="Total Products" value={String(data?.totals.products || 0)} href="/products" icon={Package} color="#ffd60a" />
        <StatCard title="Total Customers" value={String(data?.totals.customers || 0)} href="/customers" icon={Users} color="#7000FF" />
      </div>

      {/* Chart + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="section-title">Revenue Overview</div>
              <div className="section-subtitle">Last 7 days</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4cd6ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4cd6ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#32353b50" />
              <XAxis dataKey="date" tick={{ fill: '#849495', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#849495', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#4cd6ff" strokeWidth={2} fill="url(#colorRevenue)" dot={false} />
              <Area type="monotone" dataKey="invoices" stroke="#00FFC2" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock alerts */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="section-title text-base">Low Stock</div>
            <Link href="/inventory" className="text-xs text-[#4cd6ff] hover:underline">View all</Link>
          </div>
          {data?.low_stock.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="w-10 h-10 rounded-full bg-[#00FFC2]/10 flex items-center justify-center mb-2">
                <Package className="w-5 h-5 text-[#00FFC2]" />
              </div>
              <p className="text-xs text-muted-foreground">All products stocked</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.low_stock.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ffd60a] shrink-0" />
                    <span className="text-xs text-secondary-foreground truncate max-w-[120px]">{p.name}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${p.stock === 0 ? 'text-[#ff4d6d]' : 'text-[#ffd60a]'}`}>
                    {p.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      {data?.top_products && data.top_products.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="section-title">Top Products</div>
              <div className="section-subtitle">By revenue (all time)</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty Sold</th>
                  <th className="text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.top_products.map((p, i) => (
                  <tr key={p.name}>
                    <td className="text-muted-foreground font-mono text-xs w-8">{i + 1}</td>
                    <td className="font-medium text-foreground">{p.name}</td>
                    <td>{p.qty_sold}</td>
                    <td className="text-right font-mono font-semibold text-[#4cd6ff]">{fmt(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
