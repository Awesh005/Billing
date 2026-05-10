'use client';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDataStore } from '@/stores/dataStore';
import { format } from 'date-fns';
import { Printer, ArrowLeft, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

interface InvoiceDetail {
  id: string; invoice_number: string; status: string;
  created_at: string; notes?: string;
  subtotal: number; tax_total: number; discount: number; grand_total: number;
  customer?: { name: string; phone?: string; address?: string; gst_number?: string };
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  creator: { name: string };
  items: { id: string; qty: number; unit_price: number; tax_pct: number; total_price: number; product: { name: string; sku?: string } }[];
  shop: { name: string; tagline?: string; gst_number?: string; address?: string; phone?: string; email?: string };
}

const shopTemplate = {
  name: 'LAPPYCOM TECHNOLOGY',
  tagline: 'THE LAPTOP STORE',
  address: '1st Floor, Shop No. 2, Sanya Hill Market, Kanta Toli, Purulia Road, Ranchi - 834001 (Jh)',
  phone: '92794 49923, 0651 - 3167499',
};

const termsTemplate = [
  'Any complaint regarding mentioned articles must be made within 24 hours, otherwise no claim will be entertained.',
  'Goods once sold will not be taken back.',
  'Goods are subject to manufacturer\'s warranty policy.',
  'Warranty applies only to hardware goods.',
];

export default function InvoiceDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { invoices: storeInvoices, products, customers } = useDataStore();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const inv = storeInvoices.find(i => i.id === id);
      if (!inv) {
        setInvoice(null);
        setLoading(false);
        return;
      }
      
      const customer = customers.find(c => c.id === inv.customer_id) || undefined;
      
      const enrichedItems = inv.items.map((item, index) => {
        const product = products.find(p => p.id === item.product_id) || { name: 'Unknown Product', sku: '' };
        return {
          id: `item-${index}`,
          qty: item.qty,
          unit_price: item.unit_price,
          tax_pct: item.tax_pct,
          total_price: item.qty * item.unit_price * (1 + item.tax_pct / 100),
          product: { name: product.name, sku: product.sku }
        };
      });

      const detail: InvoiceDetail = {
        id: inv.id,
        invoice_number: inv.invoice_number,
        status: 'PAID',
        created_at: inv.created_at,
        notes: 'Thank you for your business!',
        subtotal: inv.subtotal,
        tax_total: inv.tax,
        discount: inv.discount,
        grand_total: inv.grand_total,
        customer,
        customer_name: inv.customer_name,
        customer_phone: inv.customer_phone,
        customer_address: inv.customer_address,
        creator: { name: 'LAPPYCOM TECHNOLOGY' },
        items: enrichedItems,
        shop: {
          name: shopTemplate.name,
          tagline: shopTemplate.tagline,
          address: shopTemplate.address,
          phone: shopTemplate.phone,
          email: 'info@lappycom.com'
        }
      };
      
      setInvoice(detail);
      setLoading(false);
    }, 300);
  }, [id, storeInvoices, products, customers]);

  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: invoice?.invoice_number });

  const handleCancel = async () => {
    if (!confirm('Cancel this invoice? Stock will be restored.')) return;
    setCancelling(true);
    setTimeout(() => {
      setInvoice((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
      setCancelling(false);
    }, 400);
  };

  const fmtMoney = (n: number) => Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  });

  const getAmountParts = (n: number) => {
    const fixed = Math.round(Number(n) * 100);
    const rupees = Math.floor(fixed / 100);
    const paise = fixed % 100;
    return {
      rupees: fmtMoney(rupees),
      paise: String(paise).padStart(2, '0')
    };
  };

  const numberToWords = (num: number) => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const twoDigit = (n: number) => {
      if (n < 20) return ones[n];
      const t = Math.floor(n / 10);
      const o = n % 10;
      return o ? `${tens[t]} ${ones[o]}` : tens[t];
    };

    const threeDigit = (n: number) => {
      if (n < 100) return twoDigit(n);
      const h = Math.floor(n / 100);
      const rest = n % 100;
      return rest ? `${ones[h]} hundred ${twoDigit(rest)}` : `${ones[h]} hundred`;
    };

    if (num === 0) return 'zero';

    let n = Math.floor(num);
    const parts: string[] = [];

    if (n >= 10000000) {
      parts.push(`${threeDigit(Math.floor(n / 10000000))} crore`);
      n %= 10000000;
    }
    if (n >= 100000) {
      parts.push(`${threeDigit(Math.floor(n / 100000))} lakh`);
      n %= 100000;
    }
    if (n >= 1000) {
      parts.push(`${threeDigit(Math.floor(n / 1000))} thousand`);
      n %= 1000;
    }
    if (n > 0) {
      parts.push(threeDigit(n));
    }

    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };

  const amountToWords = (amount: number) => {
    const fixed = Math.round(Number(amount) * 100);
    const rupees = Math.floor(fixed / 100);
    const paise = fixed % 100;
    const rupeeWords = `${numberToWords(rupees)} rupees`;
    if (paise > 0) {
      return `${rupeeWords} and ${numberToWords(paise)} paise only`;
    }
    return `${rupeeWords} only`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-t-blue-600 border-r-blue-600 border-b-transparent border-l-transparent rounded-full animate-spin" />
    </div>
  );
  if (!invoice) return <div className="text-center text-muted-foreground py-20">Invoice not found</div>;

  const docTitle = 'ESTIMATE';
  const customerName = invoice.customer_name || invoice.customer?.name || 'Walk-in Customer';
  const customerPhone = invoice.customer?.phone || invoice.customer_phone || '-';
  const customerAddress = invoice.customer?.address || invoice.customer_address || '-';
  const amountInWords = amountToWords(invoice.grand_total);
  const rows = Array.from({ length: Math.max(invoice.items.length, 12) }, (_, idx) => invoice.items[idx] ?? null);
  const printTheme = {
    '--ink': '#0f172a',
    '--accent': '#0f766e',
    '--accent-soft': '#ecfdf5',
    '--accent-2': '#f59e0b',
    '--line': '#e2e8f0',
  } as CSSProperties;

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">

      {/* ── Action Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button onClick={() => router.back()} className="btn-ghost py-2 px-3 flex items-center gap-1.5 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
        <div className="flex gap-2">
          {invoice.status !== 'CANCELLED' && (
            <button onClick={handleCancel} disabled={cancelling}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50">
              <X className="w-4 h-4" /> {cancelling ? 'Cancelling…' : 'Cancel Invoice'}
            </button>
          )}
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* ── Printable Invoice ─────────────────────────────────────── */}
      <div className="pb-10">
        <div
          ref={printRef}
          className="relative overflow-hidden bg-white text-slate-900 max-w-[210mm] mx-auto rounded-2xl border border-slate-200 shadow-2xl print:shadow-none"
          style={{ ...printTheme, fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
        >
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{
              background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%)',
              printColorAdjust: 'exact',
              WebkitPrintColorAdjust: 'exact',
            }}
          />
          <div
            className="absolute -top-20 -right-24 w-56 h-56 rounded-full opacity-60"
            style={{
              background: 'radial-gradient(circle, var(--accent-soft) 0%, rgba(255,255,255,0) 70%)',
              printColorAdjust: 'exact',
              WebkitPrintColorAdjust: 'exact',
            }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(255,255,255,0) 70%)',
              printColorAdjust: 'exact',
              WebkitPrintColorAdjust: 'exact',
            }}
          />
          <div className="relative p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                </div>
                <div>
                  <div
                    className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em]"
                    style={{
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      printColorAdjust: 'exact',
                      WebkitPrintColorAdjust: 'exact',
                    }}
                  >
                    {docTitle}
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-bold uppercase tracking-wide text-slate-900">
                    {invoice.shop.name}
                  </div>
                  {invoice.shop.tagline && (
                    <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
                      {invoice.shop.tagline}
                    </div>
                  )}
                  {invoice.shop.address && (
                    <div className="mt-1 text-[11px] text-slate-600">{invoice.shop.address}</div>
                  )}
                  {invoice.shop.phone && (
                    <div className="text-[11px] text-slate-600">Phone: {invoice.shop.phone}</div>
                  )}
                </div>
              </div>
              <div className="min-w-[200px] rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs shadow-sm">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">Estimate No.</div>
                <div className="text-base font-semibold font-mono text-slate-900">{invoice.invoice_number}</div>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-slate-400">Date</div>
                <div className="text-sm font-semibold text-slate-900">{format(new Date(invoice.created_at), 'dd MMM yyyy')}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 sm:col-span-2">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">Bill To</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{customerName}</div>
                <div className="mt-1 text-[11px] text-slate-600">{customerAddress}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">Contact</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{customerPhone}</div>
                <div className="mt-1 text-[11px] text-slate-600">Ref: {invoice.invoice_number}</div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full border-collapse text-[11px]">
                <thead
                  style={{
                    background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%)',
                    color: '#ffffff',
                    printColorAdjust: 'exact',
                    WebkitPrintColorAdjust: 'exact',
                  }}
                >
                  <tr>
                    <th rowSpan={2} className="border border-white/30 px-2 py-2 text-left font-semibold w-12">Sl. No.</th>
                    <th rowSpan={2} className="border border-white/30 px-2 py-2 text-left font-semibold">Description</th>
                    <th rowSpan={2} className="border border-white/30 px-2 py-2 text-center font-semibold w-12">Qty.</th>
                    <th rowSpan={2} className="border border-white/30 px-2 py-2 text-right font-semibold w-24">Unit Rate</th>
                    <th colSpan={2} className="border border-white/30 px-2 py-2 text-center font-semibold w-24">Amount</th>
                  </tr>
                  <tr>
                    <th className="border border-white/30 px-2 py-2 text-right font-semibold w-16">Rs.</th>
                    <th className="border border-white/30 px-2 py-2 text-right font-semibold w-10">P.</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item, i) => {
                    const lineAmount = item ? item.qty * item.unit_price : 0;
                    const parts = getAmountParts(lineAmount);
                    return (
                      <tr
                        key={item?.id ?? `blank-${i}`}
                        className="h-7"
                        style={{
                          background: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                          printColorAdjust: 'exact',
                          WebkitPrintColorAdjust: 'exact',
                        }}
                      >
                        <td className="border border-slate-200 px-2 py-1 text-center text-slate-600">{String(i + 1).padStart(2, '0')}</td>
                        <td className="border border-slate-200 px-2 py-1 text-slate-900">{item ? item.product.name : ''}</td>
                        <td className="border border-slate-200 px-2 py-1 text-center text-slate-700">{item ? item.qty : ''}</td>
                        <td className="border border-slate-200 px-2 py-1 text-right text-slate-700">{item ? fmtMoney(item.unit_price) : ''}</td>
                        <td className="border border-slate-200 px-2 py-1 text-right text-slate-900">{item ? parts.rupees : ''}</td>
                        <td className="border border-slate-200 px-2 py-1 text-right text-slate-900">{item ? parts.paise : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 text-[11px]">
              <div className="space-y-3">
                <div
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2"
                  style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
                >
                  <div className="text-[10px] uppercase tracking-widest text-emerald-700">Amount in words</div>
                  <div className="mt-1 text-[12px] font-semibold text-emerald-900 leading-relaxed">{amountInWords}</div>
                </div>
                <div
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
                  style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
                >
                  <div className="text-[10px] uppercase tracking-widest text-amber-700">Terms & Conditions</div>
                  <ol className="mt-1 ml-4 list-decimal space-y-1 text-[11px] text-amber-900">
                    {termsTemplate.map((term, idx) => (
                      <li key={`term-${idx}`}>{term}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-slate-500 bg-slate-50 border-b border-slate-200">Summary</div>
                <div className="px-3 py-2 space-y-2 text-[12px]">
                  <div className="flex justify-between text-slate-700">
                    <span>Sub Total</span>
                    <span className="font-mono font-semibold">{fmtMoney(invoice.subtotal)}</span>
                  </div>
                  {invoice.tax_total > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>Tax</span>
                      <span className="font-mono font-semibold">{fmtMoney(invoice.tax_total)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-700">
                    <span>Less / Adv.</span>
                    <span className="font-mono font-semibold">{fmtMoney(invoice.discount || 0)}</span>
                  </div>
                </div>
                <div
                  className="px-3 py-2 flex justify-between items-center text-white font-semibold"
                  style={{
                    background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%)',
                    printColorAdjust: 'exact',
                    WebkitPrintColorAdjust: 'exact',
                  }}
                >
                  <span>Total</span>
                  <span className="font-mono text-[14px]">{fmtMoney(invoice.grand_total)}</span>
                </div>
                <div className="px-3 pb-2 text-right text-[9px] text-slate-400">E.&O.E</div>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 text-[11px]">
              <div className="text-slate-500">
                <div className="text-[10px] uppercase tracking-widest">Thank you for your business</div>
                <div className="mt-1 text-[11px]">Please keep this estimate for your reference.</div>
              </div>
              <div className="text-right">
                <div>For {invoice.shop.name}</div>
                <div className="h-10" />
                <div className="border-t border-slate-400 w-40 ml-auto" />
                <div className="text-[10px] uppercase tracking-widest text-slate-500">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}