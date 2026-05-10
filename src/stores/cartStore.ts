import { create } from 'zustand';

export interface CartItem {
  product_id: string;
  name: string;
  sku?: string;
  qty: number;
  unit_price: number;
  tax_pct: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  discount: number;
  customer_id: string | null;
  customer_name: string | null;
  customer_name_override: string;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (product_id: string) => void;
  updateQty: (product_id: string, qty: number) => void;
  setDiscount: (discount: number) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setCustomerNameOverride: (name: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  taxTotal: () => number;
  grandTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  customer_id: null,
  customer_name: null,
  customer_name_override: '',

  addItem: (item) => {
    const existing = get().items.find((i) => i.product_id === item.product_id);
    if (existing) {
      if (existing.qty < item.stock) {
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === item.product_id ? { ...i, qty: i.qty + 1 } : i
          ),
        }));
      }
    } else {
      set((state) => ({ items: [...state.items, { ...item, qty: 1 }] }));
    }
  },

  removeItem: (product_id) =>
    set((state) => ({ items: state.items.filter((i) => i.product_id !== product_id) })),

  updateQty: (product_id, qty) => {
    if (qty <= 0) {
      get().removeItem(product_id);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product_id === product_id ? { ...i, qty: Math.min(qty, i.stock) } : i
      ),
    }));
  },

  setDiscount: (discount) => set({ discount }),
  setCustomer: (id, name) => set({ customer_id: id, customer_name: name, customer_name_override: '' }),
  setCustomerNameOverride: (name) => set({ customer_name_override: name, customer_id: null, customer_name: null }),
  clearCart: () => set({ items: [], discount: 0, customer_id: null, customer_name: null, customer_name_override: '' }),

  subtotal: () => get().items.reduce((sum, i) => sum + i.unit_price * i.qty, 0),
  taxTotal: () => get().items.reduce((sum, i) => sum + (i.unit_price * i.qty * i.tax_pct) / 100, 0),
  grandTotal: () => {
    const s = get().subtotal();
    const t = get().taxTotal();
    return s + t - get().discount;
  },
}));
