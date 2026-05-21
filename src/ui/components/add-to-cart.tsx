// ui/components/add-to-cart.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "~/lib/hooks/use-cart";
import { Button } from "~/ui/primitives/button";
import { ShoppingCart, Heart } from "lucide-react";

export function AddToCart({
  product,
  selectedVariant,
  selectedColor,
  quantity,
  setQuantity,
}: {
  product: any;
  selectedVariant?: any;
  selectedColor?: any;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { addItem, getItemQuantity } = useCart();
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        selectedVariant: selectedVariant,
        selectedColor: selectedColor,
      },
      quantity,
    );
  };

  const itemIdentifier = `${product.id}-${selectedVariant?.size || "default"}-${selectedColor || "default"}`;
  const currentQuantity = getItemQuantity(itemIdentifier);

  return (
    <>
      <div className="flex items-center gap-4 pt-4">
        <label htmlFor="quantity" className="font-medium">
          Quantity:
        </label>
        <select
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="rounded border border-gray-300 p-1"
        >
          {[...Array(10).keys()].map((num) => (
            <option key={num + 1} value={num + 1}>
              {num + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 pt-6">
        <Button
          className="flex-1 gap-2 py-3 text-base"
          onClick={handleAddToCart}
          disabled={!product.stock}
        >
          <ShoppingCart className="h-5 w-5" />
          {currentQuantity > 0
            ? `Add More (${currentQuantity} in cart)`
            : "Add to Cart"}
        </Button>
        <Button
          variant="outline"
          className="p-3"
          onClick={() => setWishlisted(!wishlisted)}
        >
          <Heart
            className={`h-5 w-5 ${
              wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
            }`}
          />
        </Button>
      </div>

      {!product.stock && (
        <p className="text-red-500">This product is currently out of stock</p>
      )}
    </>
  );
}
