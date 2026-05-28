import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  slug: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kalasatra_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const key = `${item.productId}-${item.size}-${item.color}`;
      const existing = prev.find((i) => `${i.productId}-${i.size}-${i.color}` === key);
      if (existing) {
        const updated = prev.map((i) =>
          `${i.productId}-${i.size}-${i.color}` === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
        localStorage.setItem('kalasatra_cart', JSON.stringify(updated));
        return updated;
      }
      const updated = [...prev, { ...item, quantity: 1 }];
      localStorage.setItem('kalasatra_cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeItem = useCallback((productId: string, size: string, color: string) => {
    setItems((prev) => {
      const updated = prev.filter(
        (i) => !(i.productId === productId && i.size === size && i.color === color)
      );
      localStorage.setItem('kalasatra_cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, size: string, color: string, delta: number) => {
    setItems((prev) => {
      const updated = prev
        .map((i) =>
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0);
      localStorage.setItem('kalasatra_cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('kalasatra_cart');
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
