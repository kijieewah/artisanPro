"use client";

import { Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { cn } from "~/lib/cn";
import { Badge } from "~/ui/primitives/badge";
import { Card, CardContent } from "~/ui/primitives/card";
import { useCart } from "~/lib/hooks/use-cart";

type ProductCardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onError" | "onClick"
> & {
  onAddToCart: (
    product: any,
    selectedVariant?: { size: string; price: number },
    selectedColor?: string, // Add this line
  ) => void;
  onAddToWishlist?: (productId: string) => void;
  product: {
    category: string;
    id: string;
    images: string[];
    inStock?: boolean;
    name: string;
    description: string;
    price: number | string;
    salePrice?: number | string;
    stock: number;
    rating?: number;
    variants?: Array<{ size: string; price: number | string }>;
    colorVariants?: string[];
  };
  onClick: (product: any) => void;
  variant: "compact" | "default";
};

const DEFAULT_IMAGE_URL = "/images/placeholder.svg";

// Helper function to format large numbers compactly
const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `₦${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 100000) {
    return `₦${(price / 1000).toFixed(0)}K`;
  } else if (price >= 1000) {
    return `₦${(price / 1000).toFixed(1)}K`;
  } else {
    return `₦${price.toFixed(2)}`;
  }
};

// Helper function to format price for tooltip (full amount)
const formatFullPrice = (price: number): string => {
  return `₦${price.toLocaleString("en-NG")}`;
};

export function ProductCard({
  className,
  onAddToCart,
  onAddToWishlist,
  product,
  onClick,
  ...props
}: ProductCardProps) {
  const { getItemQuantity } = useCart();
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [isInWishlist, setIsInWishlist] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Safely handle variants - if variants is null, undefined, NaN, or empty, use empty array
  const variants = React.useMemo(() => {
    if (!product.variants) return [];
    if (Array.isArray(product.variants)) {
      // Filter out any null/undefined variant objects
      return product.variants.filter(
        (v) => v && typeof v === "object" && v.size && v.price,
      );
    }
    return [];
  }, [product.variants]);

  const hasMultipleVariants = variants.length > 0;

  const [selectedVariant, setSelectedVariant] = useState<
    { size: string; price: number | string } | undefined
  >(undefined); // Start with no variant selected

  const currentQuantity = getItemQuantity(product.id, selectedVariant?.size);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      setIsAddingToCart(true);
      setTimeout(() => {
        onAddToCart(product, selectedVariant as any);
        setIsAddingToCart(false);
      }, 300);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWishlist) {
      setIsInWishlist(!isInWishlist);
      onAddToWishlist(product.id);
    }
  };

  // Calculate prices - show salePrice as main price if available
  const basePrice = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;

  // Use sale price as display price if available, otherwise use base price
  const displayBasePrice = salePrice ? salePrice : basePrice;

  // For variants, use the variant price, otherwise use sale/base price
  const displayPrice = selectedVariant
    ? Number(selectedVariant.price)
    : displayBasePrice;

  // Calculate discount based on original base price vs sale price
  const discount =
    salePrice && salePrice < basePrice
      ? Math.round(((basePrice - salePrice) / basePrice) * 100)
      : 0;

  const productImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : DEFAULT_IMAGE_URL;

  // Check if price needs compact formatting (over 10,000)
  const needsCompactFormat = displayPrice >= 10000;
  const needsDiscountCompactFormat = basePrice >= 10000;

  return (
    <div
      className={cn("h-full cursor-pointer", className)}
      {...props}
      onClick={() => onClick(product)}
    >
      <Card className="h-full overflow-hidden rounded-lg border-0 bg-white p-0 shadow-none">
        <div className="relative aspect-[5/4] overflow-hidden">
          <Image
            alt={product.name}
            className="h-full w-full object-cover"
            src={productImage}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {discount > 0 && (
            <Badge className="absolute left-1 top-1 bg-red-500 px-1.5 py-0 text-xs font-bold text-white">
              -{discount}%
            </Badge>
          )}

          <button
            className="absolute right-1 top-1 z-10 rounded-full bg-white/80 p-1 backdrop-blur-sm"
            onClick={handleAddToWishlist}
            type="button"
          >
            <Heart
              className={cn(
                "h-3 w-3",
                isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600",
              )}
            />
          </button>
        </div>

        <CardContent className="p-1.5">
          <h3 className="line-clamp-2 text-xs font-black leading-tight">
            {product.name}
          </h3>
          <h5 className="line-clamp-2 text-xs leading-tight">
            {product.description}
          </h5>

          {/* Only show variant selection if product has valid variants */}
          {hasMultipleVariants && (
            <div
              className="mt-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <select
                value={selectedVariant?.size || ""}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setSelectedVariant(undefined);
                  } else {
                    const newVariant = variants.find(
                      (v) => v.size === e.target.value,
                    );
                    if (newVariant) {
                      setSelectedVariant(newVariant);
                    }
                  }
                }}
                className="w-full rounded border px-2 py-1 text-xs"
              >
                <option value="">Select size/type</option>
                {variants.map((variant, index) => (
                  <option key={index} value={variant.size}>
                    {variant.size} - {formatPrice(Number(variant.price))}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              {/* Main Price with Tooltip for large numbers */}
              <div
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <span className="text-xl font-bold text-500 truncate">
                  {formatPrice(displayPrice)}
                </span>

                {/* Tooltip showing full price */}
                {needsCompactFormat && showTooltip && (
                  <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-20">
                    {formatFullPrice(displayPrice)}
                  </div>
                )}
              </div>

              {/* Show original price crossed out when sale exists and no variant selected */}
              {salePrice && salePrice < basePrice && !selectedVariant && (
                <div
                  className="relative"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <span className="text-[0.80rem] text-gray-400 line-through truncate">
                    {formatPrice(basePrice)}
                  </span>

                  {/* Tooltip showing full original price */}
                  {needsDiscountCompactFormat && showTooltip && (
                    <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-20">
                      {formatFullPrice(basePrice)}
                    </div>
                  )}
                </div>
              )}

              {/* For variants, show the sale price crossed out if variant price is higher */}
              {selectedVariant &&
                salePrice &&
                salePrice < Number(selectedVariant.price) && (
                  <span className="text-[0.80rem] text-gray-400 line-through truncate">
                    {formatPrice(salePrice)}
                  </span>
                )}

              {/* For variants, show the base price crossed out if no sale but variant exists */}
              {selectedVariant &&
                !salePrice &&
                basePrice < Number(selectedVariant.price) && (
                  <span className="text-[0.80rem] text-gray-400 line-through truncate">
                    {formatPrice(basePrice)}
                  </span>
                )}
            </div>
          </div>

          {/* Add to Cart Button - Now as a footer button */}
          <div className="mt-2">
            <button
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-orange-600",
                currentQuantity > 0 && "bg-green-500 hover:bg-green-600",
                isAddingToCart && "opacity-70 cursor-not-allowed",
              )}
              disabled={isAddingToCart}
              onClick={handleAddToCart}
              type="button"
            >
              {isAddingToCart ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                  <span>Adding...</span>
                </>
              ) : currentQuantity > 0 ? (
                <>
                  <ShoppingCart className="h-3 w-3" />
                  <span>Add to Cart ({currentQuantity})</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-1.5 flex items-center">
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            <Star className="h-2.5 w-2.5 text-gray-400" />
            <span className="ml-0.5 text-[0.6rem] text-gray-500">4.0</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
