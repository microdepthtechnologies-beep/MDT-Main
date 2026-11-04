"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  wpId: number;
  slug: string;
  name: string;
  sku?: string;
  image?: string;
  brand?: string;
  configuration?: string;
  quantity: number;
};

type CartContext = {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  update: (wpId: number, quantity: number) => void;
  remove: (wpId: number) => void;
  clear: () => void;
};

const Context = createContext<CartContext | null>(null);
const STORAGE_KEY = "mdt_quote_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add: CartContext["add"] = (item) => {
    setItems(prev => {
      const existing = prev.find(i => i.wpId === item.wpId && i.configuration === item.configuration);
      const qty = Math.max(1, item.quantity || 1);
      if (existing) {
        return prev.map(i => i.wpId === item.wpId && i.configuration === item.configuration ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };
  const update: CartContext["update"] = (wpId, quantity) => {
    if (quantity < 1) return remove(wpId);
    setItems(prev => prev.map(i => i.wpId === wpId ? { ...i, quantity } : i));
  };
  const remove: CartContext["remove"] = (wpId) => setItems(prev => prev.filter(i => i.wpId !== wpId));
  const clear: CartContext["clear"] = () => setItems([]);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return <Context.Provider value={{ items, count, add, update, remove, clear }}>{children}</Context.Provider>;
}

export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error("useCart must be used within CartProvider.");
  return value;
}
