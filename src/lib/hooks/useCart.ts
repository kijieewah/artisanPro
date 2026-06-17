// hooks/useCart.ts
"use client";

import { useState, useEffect, useCallback } from "react";

interface CartItem {
  id: string;
  itemType: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  details: any;
}

interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

// Define response types
interface CartResponse {
  success: boolean;
  cart: Cart;
  error?: string;
}

interface AddToCartResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemCount, setItemCount] = useState(0);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/artisan/cart");
      const data = (await response.json()) as CartResponse;
      if (data.success) {
        setCart(data.cart);
        setItemCount(data.cart.itemCount);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [fetchCart]);

  const addToCart = async (itemType: string, itemId: string, quantity: number = 1) => {
    try {
      const response = await fetch("/api/artisan/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId, quantity }),
      });
      const data = (await response.json()) as AddToCartResponse;
      if (data.success) {
        await fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to add to cart" };
    } catch (error) {
      console.error("Add to cart error:", error);
      return { success: false, error: "Failed to add to cart" };
    }
  };

  return {
    cart,
    loading,
    itemCount,
    fetchCart,
    addToCart,
  };
}