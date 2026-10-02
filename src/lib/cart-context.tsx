import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    type ReactNode,
  } from "react";
  
  export interface CartItem {
    id: string;
    name: string;
    price: string;
    priceValue: number;
    quantity: number;
    category?: string;
  }
  
  interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    totalItems: number;
    totalPrice: number;
  }
  
  const CartContext = createContext<CartContextType | null>(null);
  
  const STORAGE_KEY = "punto-verde-cart";
  
  function parsePrice(priceStr: string): number {
    const clean = priceStr.replace(/[€\s]/g, "").replace(",", ".");
    const firstValue = clean.split("-")[0];
     return parseFloat(firstValue ?? "") || 0;
  }
  
  export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
      if (typeof window === "undefined") return [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    });
    const [isOpen, setIsOpen] = useState(false);
  
    useEffect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);
  
    const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });
    }, []);
  
    const removeItem = useCallback((id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);
  
    const updateQuantity = useCallback((id: string, quantity: number) => {
      if (quantity < 1) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }, []);
  
    const clearCart = useCallback(() => setItems([]), []);
  
    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);
  
    const totalItems = useMemo(
      () => items.reduce((sum, i) => sum + i.quantity, 0),
      [items]
    );
  
    const totalPrice = useMemo(
      () => items.reduce((sum, i) => sum + i.priceValue * i.quantity, 0),
      [items]
    );
  
    return (
      <CartContext.Provider
        value={{
          items,
          isOpen,
          addItem,
          removeItem,
          updateQuantity,
          clearCart,
          openCart,
          closeCart,
          totalItems,
          totalPrice,
        }}
      >
        {children}
      </CartContext.Provider>
    );
  }
  
  export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
  }