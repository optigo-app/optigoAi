"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const saveTimeoutRef = useRef(null);
  const [loading, setLoading] = useState(false);

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

  // Debounced sessionStorage save - only saves after 300ms of no changes
  useEffect(() => {
    if (!hasHydrated) return;
    if (typeof window === "undefined") return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 300ms
    saveTimeoutRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem("cartItems", JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart:", e);
      }
    }, 300);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
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

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      await setItems([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const isItemInCart = useCallback((productId) => {
    return items.some(item => item.id === productId);
  }, [items]);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, clearCart, totalCount, hasHydrated, isItemInCart }),
    [items, addToCart, removeFromCart, clearCart, totalCount, hasHydrated, isItemInCart, loading]
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
