import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  image_url?: string;
  selling_price: number;
  purchase_price: number;
  tax_pct: number;
  stock: number;
  low_stock_alert: number;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface InvoiceItem {
  product_id: string;
  qty: number;
  unit_price: number;
  tax_pct: number;
}

export interface Invoice {
  id: string; // The primary ID, e.g., UUID
  invoice_number: string; // INV-YYYYMMDD-XXXX
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  items: InvoiceItem[];
  discount: number;
  subtotal: number;
  tax: number;
  grand_total: number;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  is_active: boolean;
}

interface DataState {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  users: User[];
  isInitialized: boolean;
  
  initializeMockData: () => void;
  
  // Product Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Customer Actions
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Invoice Actions
  addInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  
  // Dashboard Metrics Helper
  getDashboardMetrics: () => {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    lowStockItems: number;
    recentSales: any[];
    salesByDay: any[];
  };
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      products: [],
      customers: [],
      invoices: [],
      users: [
        { id: 'u1', name: 'LAPPYCOM Admin', email: 'admin@lappycom.com', role: 'ADMIN', is_active: true },
        { id: 'u2', name: 'LAPPYCOM Staff', email: 'staff@lappycom.com', role: 'STAFF', is_active: true }
      ],
      isInitialized: false,

      initializeMockData: () => {
        if (get().isInitialized) return;

        const defaultProducts: Product[] = [
          { id: 'p1', name: 'Wireless Mouse', sku: 'WM-01', category: 'Electronics', purchase_price: 350, selling_price: 599, tax_pct: 18, stock: 50, low_stock_alert: 5 },
          { id: 'p2', name: 'Mechanical Keyboard', sku: 'MK-02', category: 'Electronics', purchase_price: 1500, selling_price: 2499, tax_pct: 18, stock: 30, low_stock_alert: 5 },
          { id: 'p3', name: 'Desk Pad', sku: 'DP-03', category: 'Accessories', purchase_price: 200, selling_price: 399, tax_pct: 12, stock: 100, low_stock_alert: 10 },
          { id: 'p4', name: 'USB-C Cable', sku: 'UC-04', category: 'Accessories', purchase_price: 50, selling_price: 149, tax_pct: 18, stock: 200, low_stock_alert: 20 },
        ];

        const defaultCustomers: Customer[] = [
          { id: 'c1', name: 'Acme Corp', phone: '9876543210', email: 'contact@acme.com', address: '123 Business St' },
          { id: 'c2', name: 'John Doe', phone: '9123456789', email: 'john@example.com', address: '456 Main St' },
        ];

        const defaultInvoices: Invoice[] = [
          {
            id: 'inv1',
            invoice_number: 'INV-20231015-0001',
            customer_id: 'c1',
            customer_name: 'Acme Corp',
            items: [
              { product_id: 'p1', qty: 2, unit_price: 599, tax_pct: 18 },
              { product_id: 'p4', qty: 5, unit_price: 149, tax_pct: 18 }
            ],
            discount: 0,
            subtotal: 1943,
            tax: 349.74,
            grand_total: 2292.74,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          }
        ];

        set({
          products: defaultProducts,
          customers: defaultCustomers,
          invoices: defaultInvoices,
          isInitialized: true
        });
      },

      setProducts: (products) => set({ products }),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, productData) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...productData } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),

      setCustomers: (customers) => set({ customers }),
      addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
      updateCustomer: (id, customerData) => set((state) => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...customerData } : c)
      })),
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      })),

      addInvoice: (invoice) => set((state) => ({ invoices: [invoice, ...state.invoices] })),
      deleteInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter(i => i.id !== id)
      })),

      getDashboardMetrics: () => {
        const { invoices, customers, products } = get();
        const totalSales = invoices.reduce((sum, inv) => sum + inv.grand_total, 0);
        const lowStockItems = products.filter(p => p.stock <= p.low_stock_alert).length;
        
        // Simple mock for chart
        const salesByDay: any[] = [];
        const recentSales = invoices.slice(0, 5).map(inv => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          amount: inv.grand_total,
          date: inv.created_at,
          customer_name: inv.customer_name || 'Walk-in'
        }));

        return {
          totalSales,
          totalOrders: invoices.length,
          totalCustomers: customers.length,
          lowStockItems,
          recentSales,
          salesByDay
        };
      }
    }),
    {
      name: 'billing-data-storage',
    }
  )
);
