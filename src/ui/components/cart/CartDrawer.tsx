// components/cart/CartDrawer.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingCart, X, Trash2, Plus, Minus, CreditCard, Loader2, Award, GraduationCap, AlertCircle } from "lucide-react";

const colors = { primary: "#16507b" };

interface CartItem {
  id: string;
  itemType: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  details: any;
}

// Define response types
interface CartResponse {
  success: boolean;
  cart: {
    items: CartItem[];
    total: number;
    itemCount: number;
  };
  error?: string;
}

interface CheckoutResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
  order?: {
    id: string;
    orderNumber: string;
    total: number;
  };
}

export default function CartDrawer() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<{ items: CartItem[]; total: number; itemCount: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/artisan/cart");
      const data = (await res.json()) as CartResponse;
      if (data.success) setCart(data.cart);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    const handleCartUpdate = () => fetchCart();
    const handleOpenCart = () => { setIsOpen(true); fetchCart(); };
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("openCart", handleOpenCart);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("openCart", handleOpenCart);
    };
  }, [fetchCart]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    const res = await fetch("/api/artisan/cart", { 
      method: "PUT", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ itemId, quantity }) 
    });
    if (res.ok) { 
      fetchCart(); 
      window.dispatchEvent(new Event("cartUpdated")); 
    }
  };

  const removeItem = async (itemId: string) => {
    const res = await fetch(`/api/artisan/cart?itemId=${itemId}`, { method: "DELETE" });
    if (res.ok) { 
      fetchCart(); 
      window.dispatchEvent(new Event("cartUpdated")); 
      toast.success("Item removed"); 
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/artisan/checkout", { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = (await res.json()) as CheckoutResponse;
      
      if (data.success && data.redirectUrl) {
        // Clear local cart state immediately for better UX
        setCart({ items: [], total: 0, itemCount: 0 });
        // Close the drawer
        setIsOpen(false);
        // Dispatch cart update event
        window.dispatchEvent(new Event("cartUpdated"));
        // Navigate to payment
        router.push(data.redirectUrl);
      } else {
        throw new Error(data.error || "Checkout failed");
      }
    } catch (error: any) {
      toast.error(error.message);
      // Refresh cart to show current state
      fetchCart();
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatAmount = (amount: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg hover:scale-105" style={{ backgroundColor: colors.primary }}>
        <ShoppingCart className="h-5 w-5" />
        <span>Cart</span>
        {cart?.itemCount ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold" style={{ color: colors.primary }}>{cart.itemCount > 9 ? "9+" : cart.itemCount}</span> : null}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Your Cart ({cart?.itemCount || 0})</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!cart?.items.length ? (
                <div className="py-12 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 border rounded-lg p-3 mb-3">
                    <div className="rounded-full p-2 bg-gray-100">{item.itemType === "CERTIFICATION_APPLICATION" ? <Award className="h-5 w-5 text-green-600" /> : <GraduationCap className="h-5 w-5 text-blue-600" />}</div>
                    <div className="flex-1">
                      <p className="font-medium">{item.details?.name || "Item"}</p>
                      <p className="text-xs text-gray-500">{formatAmount(item.unitPrice)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="border rounded p-1" disabled={item.quantity <= 1}><Minus className="h-3 w-3" /></button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="border rounded p-1"><Plus className="h-3 w-3" /></button>
                        <button onClick={() => removeItem(item.id)} className="ml-auto text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="text-right"><p className="font-semibold">{formatAmount(item.totalPrice)}</p></div>
                  </div>
                ))
              )}
            </div>

            {cart?.items.length ? (
              <div className="border-t p-4 bg-gray-50">
                <div className="flex justify-between font-semibold mb-4"><span>Total</span><span className="text-primary text-lg">{formatAmount(cart.total)}</span></div>
                <button onClick={handleCheckout} disabled={checkoutLoading} className="w-full bg-primary text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                  {checkoutLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CreditCard className="h-5 w-5" /> Proceed to Checkout</>}
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}