"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem("cartItems");
      setItems([]);
    } catch (e) {
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem("cartItems", JSON.stringify(items));
    } catch (e) {
    }
  }, [items, hasHydrated]);

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      if (!product || !product.id) return prev;
      const existingIndex = prev.findIndex((p) => p.id === product.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          quantity: (existing.quantity || 1) + 1,
        };
        return updated;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, clearCart, totalCount, hasHydrated }),
    [items, addToCart, removeFromCart, clearCart, totalCount, hasHydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
