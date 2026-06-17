"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { cn } from "~/lib/cn";
import { useCart } from "~/lib/hooks/useCart";
import { useMediaQuery } from "~/lib/hooks/use-media-query";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "~/ui/primitives/drawer";
import { Separator } from "~/ui/primitives/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/ui/primitives/sheet";

export interface CartItem {
  category: string;
  id: string;
  image: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartProps {
  className?: string;
  businessId?: string;
  businessData?: any;
  businessName?: string;
}

const isInvalidImageUrl = (url: string) => {
  return !url || url.trim() === "" || url.trim() === "/";
};

export function Cart({
  className,
  businessId,
  businessData,
  businessName,
}: CartProps) {
  const {
    cart,
    loading,
    itemCount: totalItems,
    fetchCart,
    addToCart,
  } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get cart items from the cart object
  const cartItems = cart?.items || [];
  const subtotal = cart?.total || 0;

  const handleUpdateQuantity = async (
    itemId: string,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await fetch("/api/artisan/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });
      
      if (response.ok) {
        await fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/artisan/cart?itemId=${itemId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        await fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Remove item error:", error);
    }
  };

  const handleClearCart = async () => {
    try {
      const response = await fetch("/api/artisan/cart", {
        method: "PATCH",
      });
      
      if (response.ok) {
        await fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Clear cart error:", error);
    }
  };

  const handleCheckout = () => {
    // Close the cart modal
    setIsOpen(false);

    // Navigate to checkout page
    if (businessName) {
      window.location.href = `/${businessName}/checkout`;
    } else {
      window.location.href = `/dashboard/payment`;
    }
  };

  const CartTrigger = (
    <Button
      aria-label="Open cart"
      className="relative h-9 w-9 rounded-full"
      size="icon"
      variant="outline"
    >
      <ShoppingCart className="h-4 w-4" />
      {totalItems > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px]"
          variant="default"
        >
          {totalItems}
        </Badge>
      )}
    </Button>
  );

  const CartContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
        <div>
          <div className="text-xl font-semibold">Your Cart</div>
          <div className="text-sm text-muted-foreground">
            {totalItems === 0
              ? "Your cart is empty"
              : `You have ${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`}
          </div>
        </div>
        {isDesktop ? (
          <SheetClose asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        ) : (
          <DrawerClose asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6">
        {cartItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Your cart is empty</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Looks like you haven't added anything to your cart yet.
            </p>
            {isDesktop ? (
              <SheetClose asChild>
                <Button>Browse Products</Button>
              </SheetClose>
            ) : (
              <DrawerClose asChild>
                <Button>Browse Products</Button>
              </DrawerClose>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="group relative flex rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded">
                  <Image
                    alt={item.details?.name || item.itemType || "Item"}
                    className="object-cover"
                    fill
                    src={
                      isInvalidImageUrl(item.details?.image)
                        ? "/images/placeholder.svg"
                        : item.details?.image || "/images/placeholder.svg"
                    }
                  />
                </div>
                <div className="ml-4 flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                        {item.details?.name || item.itemType || "Item"}
                      </div>
                      <button
                        className="-mt-1 -mr-1 ml-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.itemType === "CERTIFICATION_APPLICATION" && "Certification"}
                      {item.itemType === "COURSE_ENROLLMENT" && "Course"}
                      {item.itemType === "CERTIFICATION_SERVICE" && "Certification Service"}
                      {item.details?.serviceName && ` • ${item.details.serviceName}`}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-md border">
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-l-md border-r text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        type="button"
                      >
                        <Minus className="h-3 w-3" />
                        <span className="sr-only">Decrease quantity</span>
                      </button>
                      <span className="flex h-8 w-8 items-center justify-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-r-md border-l text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        type="button"
                      >
                        <Plus className="h-3 w-3" />
                        <span className="sr-only">Increase quantity</span>
                      </button>
                    </div>
                    <div className="text-sm font-medium">
                      ₦{(item.unitPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <div className="border-t bg-background px-6 py-4 shrink-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₦{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">Calculated at checkout</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Total</span>
              <span className="text-base font-semibold">
                ₦{subtotal.toFixed(2)}
              </span>
            </div>
            <Button
              className="w-full text-lg h-12"
              onClick={handleCheckout}
              size="lg"
            >
              Proceed to Checkout
            </Button>
            <div className="flex gap-2">
              {isDesktop ? (
                <SheetClose asChild>
                  <Button variant="outline" className="flex-1 h-10">
                    Continue Shopping
                  </Button>
                </SheetClose>
              ) : (
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1 h-10">
                    Continue Shopping
                  </Button>
                </DrawerClose>
              )}
              <Button
                className="flex-1 h-10"
                onClick={handleClearCart}
                variant="outline"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isMounted) {
    return (
      <div className={cn("relative", className)}>
        <Button
          aria-label="Open cart"
          className="relative h-9 w-9 rounded-full"
          size="icon"
          variant="outline"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {isDesktop ? (
        <Sheet onOpenChange={setIsOpen} open={isOpen}>
          <SheetTrigger asChild>{CartTrigger}</SheetTrigger>
          <SheetContent className="flex w-full max-w-md flex-col p-0 sm:max-w-md h-screen">
            {CartContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer onOpenChange={setIsOpen} open={isOpen}>
          <DrawerTrigger asChild>{CartTrigger}</DrawerTrigger>
          <DrawerContent className="h-screen max-h-screen flex flex-col p-0">
            <div className="relative flex h-full flex-col">{CartContent}</div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}