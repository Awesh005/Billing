'use client';
import { useEffect, useState, useRef } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, User,
  X, Tag, Zap, CheckCircle, Printer, Package, UserPlus, UserCheck
} from 'lucide-react';

interface Product { id: string; name: string; sku?: string; selling_price: number; tax_pct: number; stock: number; category?: string; }
interface Customer { id: string; name: string; phone?: string; }

export default function POSPage() {
  const router = useRouter();
  const { shop } = useAuthStore();
  const cart = useCartStore();

  const { products: storeProducts, customers: storeCustomers, addInvoice } = useDataStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  // Customer section state
  const [customerMode, setCustomerMode] = useState<'existing' | 'walkin'>('existing');
  const [customerSearch, setCustomerSearch] = useState('');
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinEmail, setWalkinEmail] = useState('');
  const [walkinAddress, setWalkinAddress] = useState('');
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ invoice_number: string; grand_total: number; customer_label: string } | null>(null);
  const [error, setError] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const customerDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  // Load products
  useEffect(() => {
    const t = setTimeout(() => {
      let filtered = storeProducts;
      if (search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));
      }
      setProducts(filtered.slice(0, 40));
    }, 250);
    return () => clearTimeout(t);
  }, [search, storeProducts]);

  // Search existing customers
  useEffect(() => {
    if (customerMode === 'existing' && customerSearch.length >= 2) {
      const filtered = storeCustomers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch));
      setCustomers(filtered.slice(0, 10));
      setShowCustomerDrop(true);
    } else {
      setShowCustomerDrop(false);
    }
  }, [customerSearch, customerMode, storeCustomers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (customerDropRef.current && !customerDropRef.current.contains(e.target as Node)) {
        setShowCustomerDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addToCart = (p: Product) => {
    if (p.stock === 0) return;
    cart.addItem({ product_id: p.id, name: p.name, sku: p.sku, unit_price: Number(p.selling_price), tax_pct: Number(p.tax_pct), stock: p.stock });
  };

  const switchMode = (mode: 'existing' | 'walkin') => {
    setCustomerMode(mode);
    setCustomerSearch('');
    setWalkinName('');
    setWalkinPhone('');
    setWalkinEmail('');
    setWalkinAddress('');
    setShowCustomerDrop(false);
    cart.setCustomer(null, null);
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;
    setLoading(true); setError('');
    try {
      await new Promise(res => setTimeout(res, 500));
      
      const payload: any = {
        id: `inv${Date.now()}`,
        invoice_number: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
        customer_id: cart.customer_id,
        items: cart.items.map((i) => ({
          product_id: i.product_id, qty: i.qty, unit_price: i.unit_price, tax_pct: i.tax_pct,
        })),
        discount: cart.discount,
        subtotal: cart.subtotal(),
        tax: cart.taxTotal(),
        grand_total: cart.grandTotal(),
        created_at: new Date().toISOString()
      };

      if (!cart.customer_id) {
        if (customerMode === 'walkin' && (!walkinName.trim() || !walkinPhone.trim() || !walkinEmail.trim())) {
          setError('Name, Phone, and Email are required for new customers.');
          setLoading(false);
          return;
        }
        if (customerMode === 'walkin') {
          payload.customer_name = walkinName.trim();
          payload.customer_phone = walkinPhone.trim();
          payload.customer_email = walkinEmail.trim();
          if (walkinAddress.trim()) payload.customer_address = walkinAddress.trim();
        }
      }

      addInvoice(payload);
      const label = cart.customer_name || walkinName || 'Walk-in';
      setSuccess({
        invoice_number: payload.invoice_number,
        grand_total: payload.grand_total,
        customer_label: label,
      });
      cart.clearCart();
      setCustomerSearch('');
      setWalkinName('');
    } catch (e: any) {
      setError('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="glass-card p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #4cd6ff, #00e1ab)' }}>
            <CheckCircle className="w-8 h-8 text-[#101319]" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Invoice Created!</h2>
          {success.customer_label !== 'Walk-in' && (
            <p className="text-xs text-muted-foreground mb-3 flex items-center justify-center gap-1">
              <User className="w-3 h-3" /> {success.customer_label}
            </p>
          )}
          <p className="text-muted-foreground text-sm mb-1">Invoice Number</p>
          <p className="text-lg font-mono font-bold text-[#4cd6ff] mb-4">{success.invoice_number}</p>
          <p className="text-3xl font-display font-bold text-foreground mb-6">
            ₹{success.grand_total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setSuccess(null)} className="btn-ghost flex-1">New Invoice</button>
            <button onClick={() => router.push('/invoices')} className="btn-primary flex-1">
              <Printer className="w-4 h-4" /> View & Print
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-6rem)] lg:h-[calc(100vh-9rem)] animate-fade-in overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">

      {/* ── Product Grid ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-[400px] lg:min-h-0">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or scan barcode..."
            className="input-field pl-10 py-3 text-base"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((p) => {
              const inCart = cart.items.find((i) => i.product_id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0}
                  className={`glass-card-hover text-left p-4 transition-all duration-200 ${
                    p.stock === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  } ${inCart ? 'border-[#4cd6ff]/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-muted'}`}>
                      {p.stock === 0 ? 'Out' : `${p.stock} left`}
                    </span>
                    {inCart && <span className="badge badge-info">{inCart.qty} in cart</span>}
                  </div>
                  <div className="text-sm font-medium text-foreground leading-snug mb-2 line-clamp-2">{p.name}</div>
                  {p.sku && <div className="text-[10px] font-mono text-muted-foreground mb-2">{p.sku}</div>}
                  <div className="text-base font-bold text-[#4cd6ff]">₹{Number(p.selling_price).toLocaleString('en-IN')}</div>
                  {Number(p.tax_pct) > 0 && <div className="text-[10px] text-muted-foreground">+{p.tax_pct}% GST</div>}
                </button>
              );
            })}
            {products.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Package className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cart Panel ── */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col glass-card shrink-0 h-[600px] lg:h-auto">

        {/* Cart Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-4 h-4 text-[#4cd6ff]" />
            <span className="font-display font-semibold text-foreground">Cart</span>
            <span className="ml-auto badge badge-info">{cart.items.length} items</span>
          </div>

          {/* ── Customer Section ── */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Customer</p>

            {/* Toggle buttons */}
            <div className="grid grid-cols-2 gap-1.5 mb-3 p-1 bg-sidebar rounded-lg">
              <button
                type="button"
                onClick={() => switchMode('existing')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-semibold transition-all ${
                  customerMode === 'existing'
                    ? 'bg-card text-[#4cd6ff] shadow'
                    : 'text-muted-foreground hover:text-secondary-foreground'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Existing
              </button>
              <button
                type="button"
                onClick={() => switchMode('walkin')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-semibold transition-all ${
                  customerMode === 'walkin'
                    ? 'bg-card text-[#00FFC2] shadow'
                    : 'text-muted-foreground hover:text-secondary-foreground'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Walk-in
              </button>
            </div>

            {/* Existing customer search */}
            {customerMode === 'existing' && (
              <div className="relative" ref={customerDropRef}>
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={cart.customer_name || customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    if (cart.customer_id) cart.setCustomer(null, null);
                  }}
                  placeholder="Search by name or phone..."
                  className="input-field pl-9 py-2.5 text-xs"
                />
                {(cart.customer_id || customerSearch) && (
                  <button
                    type="button"
                    onClick={() => { cart.setCustomer(null, null); setCustomerSearch(''); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#ff4d6d]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Dropdown */}
                {showCustomerDrop && customers.length > 0 && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-1 glass-card border border-border rounded-lg overflow-hidden shadow-float">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          cart.setCustomer(c.id, c.name);
                          setCustomerSearch('');
                          setShowCustomerDrop(false);
                        }}
                        className="w-full px-3 py-2.5 text-left hover:bg-muted flex items-center justify-between"
                      >
                        <span className="text-xs font-medium text-foreground">{c.name}</span>
                        {c.phone && <span className="text-[10px] text-muted-foreground">{c.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}

                {cart.customer_id && (
                  <p className="text-[10px] text-[#00FFC2] mt-1.5 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Linked to customer record
                  </p>
                )}
              </div>
            )}

            {/* New Customer / Auto-save details */}
            {customerMode === 'walkin' && (
              <div className="space-y-2">
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00FFC2]" />
                  <input
                    type="text"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    placeholder="Full Name (Required)"
                    className="input-field pl-9 py-2.5 text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    placeholder="Phone (Required)"
                    className="input-field py-2.5 text-xs flex-1"
                  />
                  <input
                    type="email"
                    value={walkinEmail}
                    onChange={(e) => setWalkinEmail(e.target.value)}
                    placeholder="Email (Required)"
                    className="input-field py-2.5 text-xs flex-1"
                  />
                </div>
                <input
                  type="text"
                  value={walkinAddress}
                  onChange={(e) => setWalkinAddress(e.target.value)}
                  placeholder="Address (Optional)"
                  className="input-field py-2.5 text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Click products to add</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.product_id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground line-clamp-1 mb-1">{item.name}</div>
                  <div className="text-xs text-[#4cd6ff] font-mono">
                    ₹{(item.unit_price * item.qty).toLocaleString('en-IN')}
                  </div>
                  {item.tax_pct > 0 && <div className="text-[10px] text-muted-foreground">+{item.tax_pct}% GST</div>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => cart.updateQty(item.product_id, item.qty - 1)}
                    className="w-6 h-6 rounded-md bg-accent text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-mono font-bold text-foreground w-5 text-center">{item.qty}</span>
                  <button onClick={() => cart.updateQty(item.product_id, item.qty + 1)}
                    disabled={item.qty >= item.stock}
                    className="w-6 h-6 rounded-md bg-accent text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-30">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => cart.removeItem(item.product_id)}
                    className="w-6 h-6 rounded-md text-muted-foreground hover:text-[#ff4d6d] flex items-center justify-center transition-colors ml-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-4 border-t border-border space-y-3">
          {error && (
            <div className="text-xs text-[#ff4d6d] bg-[#ff4d6d]/10 px-3 py-2 rounded-lg border border-[#ff4d6d]/30">
              {error}
            </div>
          )}

          {/* Discount */}
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="number" min="0" placeholder="Discount (₹)"
              value={cart.discount || ''}
              onChange={(e) => cart.setDiscount(Number(e.target.value))}
              className="input-field py-1.5 text-xs"
            />
          </div>

          {/* Totals */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono">₹{cart.subtotal().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tax</span>
              <span className="font-mono">₹{cart.taxTotal().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-xs text-[#00FFC2]">
                <span>Discount</span>
                <span className="font-mono">-₹{cart.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
              <span className="font-display">Total</span>
              <span className="font-mono text-[#4cd6ff]">
                ₹{cart.grandTotal().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => { cart.clearCart(); setCustomerSearch(''); setWalkinName(''); }}
              disabled={cart.items.length === 0}
              className="btn-ghost px-3 py-2.5 text-xs"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
            <button
              onClick={handleCheckout}
              disabled={cart.items.length === 0 || loading}
              className="btn-primary flex-1 py-2.5 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#101319]/30 border-t-[#101319] rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Charge ₹{cart.grandTotal().toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
