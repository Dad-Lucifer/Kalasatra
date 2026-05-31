import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { apiRequest, getTokens } from '../utils/api';

export interface CartItem {
  id?: string;
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
  syncing: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'kalasatra_cart';

function getLocalCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function setLocalCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getLocalCart);
  const [syncing, setSyncing] = useState(false);

  const isAuthenticated = !!getTokens().accessToken;

  // On mount / login fetch from backend and merge with local
  useEffect(() => {
    if (!isAuthenticated) return;

    const syncCart = async () => {
      setSyncing(true);
      const res = await apiRequest<CartItem[]>('/cart');
      setSyncing(false);

      if (res.success && res.data) {
        const backendItems = res.data.map((i: any) => ({
          id: i.id,
          productId: i.product_id,
          name: i.name,
          price: i.price,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          image: i.image || '',
          slug: i.slug || '',
        }));

        const localItems = getLocalCart();

        if (localItems.length > 0) {
          // Merge local items into backend, then clear local
          for (const local of localItems) {
            await apiRequest('/cart', {
              method: 'POST',
              body: JSON.stringify({
                productId: local.productId,
                name: local.name,
                price: local.price,
                size: local.size,
                color: local.color,
                image: local.image,
                slug: local.slug,
              }),
            });
          }

          // Refetch after merge
          const merged = await apiRequest<CartItem[]>('/cart');
          if (merged.success && merged.data) {
            const mergedItems = merged.data.map((i: any) => ({
              id: i.id,
              productId: i.product_id,
              name: i.name,
              price: i.price,
              size: i.size,
              color: i.color,
              quantity: i.quantity,
              image: i.image || '',
              slug: i.slug || '',
            }));
            setItems(mergedItems);
            setLocalCart(mergedItems);
          }

          localStorage.removeItem(STORAGE_KEY);
        } else {
          setItems(backendItems);
          setLocalCart(backendItems);
        }
      }
    };

    syncCart();
  }, [isAuthenticated]);

  const syncAddItem = useCallback(async (item: Omit<CartItem, 'quantity'>) => {
    if (isAuthenticated) {
      await apiRequest('/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId: item.productId,
          name: item.name,
          price: item.price,
          size: item.size,
          color: item.color,
          image: item.image,
          slug: item.slug,
        }),
      });
      // Refetch
      const res = await apiRequest<CartItem[]>('/cart');
      if (res.success && res.data) {
        const mapped = res.data.map((i: any) => ({
          id: i.id,
          productId: i.product_id,
          name: i.name,
          price: i.price,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          image: i.image || '',
          slug: i.slug || '',
        }));
        setItems(mapped);
        setLocalCart(mapped);
        return;
      }
    }

    // Fallback: local only
    setItems((prev) => {
      const key = `${item.productId}-${item.size}-${item.color}`;
      const existing = prev.find((i) => `${i.productId}-${i.size}-${i.color}` === key);
      if (existing) {
        const updated = prev.map((i) =>
          `${i.productId}-${i.size}-${i.color}` === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
        setLocalCart(updated);
        return updated;
      }
      const updated = [...prev, { ...item, quantity: 1 }];
      setLocalCart(updated);
      return updated;
    });
  }, [isAuthenticated]);

  const syncRemoveItem = useCallback(async (productId: string, size: string, color: string) => {
    if (isAuthenticated) {
      const target = items.find(
        (i) => i.productId === productId && i.size === size && i.color === color
      );
      if (target?.id) {
        await apiRequest(`/cart/${target.id}`, { method: 'DELETE' });
      }
      const res = await apiRequest<CartItem[]>('/cart');
      if (res.success && res.data) {
        const mapped = res.data.map((i: any) => ({
          id: i.id,
          productId: i.product_id,
          name: i.name,
          price: i.price,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          image: i.image || '',
          slug: i.slug || '',
        }));
        setItems(mapped);
        setLocalCart(mapped);
        return;
      }
    }

    setItems((prev) => {
      const updated = prev.filter(
        (i) => !(i.productId === productId && i.size === size && i.color === color)
      );
      setLocalCart(updated);
      return updated;
    });
  }, [isAuthenticated, items]);

  const syncUpdateQuantity = useCallback(async (productId: string, size: string, color: string, delta: number) => {
    if (isAuthenticated) {
      const target = items.find(
        (i) => i.productId === productId && i.size === size && i.color === color
      );
      if (target?.id) {
        const newQty = target.quantity + delta;
        if (newQty <= 0) {
          await apiRequest(`/cart/${target.id}`, { method: 'DELETE' });
        } else {
          await apiRequest(`/cart/${target.id}`, {
            method: 'PUT',
            body: JSON.stringify({ delta }),
          });
        }
      }
      const res = await apiRequest<CartItem[]>('/cart');
      if (res.success && res.data) {
        const mapped = res.data.map((i: any) => ({
          id: i.id,
          productId: i.product_id,
          name: i.name,
          price: i.price,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          image: i.image || '',
          slug: i.slug || '',
        }));
        setItems(mapped);
        setLocalCart(mapped);
        return;
      }
    }

    setItems((prev) => {
      const updated = prev
        .map((i) =>
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0);
      setLocalCart(updated);
      return updated;
    });
  }, [isAuthenticated, items]);

  const syncClearCart = useCallback(async () => {
    if (isAuthenticated) {
      await apiRequest('/cart', { method: 'DELETE' });
    }
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [isAuthenticated]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem: syncAddItem,
        removeItem: syncRemoveItem,
        updateQuantity: syncUpdateQuantity,
        clearCart: syncClearCart,
        totalItems,
        totalPrice,
        syncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
