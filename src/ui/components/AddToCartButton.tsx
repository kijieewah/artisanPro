// components/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, Loader2 } from "lucide-react";

interface AddToCartButtonProps {
  itemType: "CERTIFICATION_APPLICATION" | "COURSE_ENROLLMENT" | "CERTIFICATION_SERVICE";
  itemId: string;
  buttonText?: string;
  className?: string;
  onSuccess?: () => void;
}

// Define response type
interface CartResponse {
  success: boolean;
  error?: string;
  message?: string;
}

const colors = {
  primary: "#16507b",
};

export default function AddToCartButton({
  itemType,
  itemId,
  buttonText = "Add to Cart",
  className = "",
  onSuccess,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const response = await fetch("/api/artisan/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType,
          itemId,
          quantity: 1,
        }),
      });

      const data = (await response.json()) as CartResponse;

      if (data.success) {
        toast.success("Added to cart successfully!");
        window.dispatchEvent(new Event("cartUpdated"));
        onSuccess?.();
      } else {
        toast.error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 ${className}`}
      style={{ backgroundColor: colors.primary }}
    >
      {isAdding ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {buttonText}
        </>
      )}
    </button>
  );
}