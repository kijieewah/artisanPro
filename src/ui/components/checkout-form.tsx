// ui/components/checkout-form.tsx
"use client";

import { motion } from "framer-motion";
import { ShoppingCart, MessageSquare } from "lucide-react";
import type * as React from "react";
import { useState, useRef, useEffect } from "react";

import { useCart } from "~/lib/hooks/useCart";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Textarea } from "~/ui/primitives/textarea";

interface CheckoutFormProps {
  businessId: string;
  onBackToCart: () => void;
}

export function CheckoutForm({ businessId, onBackToCart }: CheckoutFormProps) {
  const { cart, fetchCart } = useCart();
  const [isWhatsAppLoading, setIsWhatsAppLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Get cart items and subtotal from cart object
  const cartItems = cart?.items || [];
  const subtotal = cart?.total || 0;

  // Placeholder for your business's WhatsApp number
  const businessData = {
    whatsapp: "2348056500309",
  };

  function setNumber(number: string): string {
    const WEST_AFRICAN_CODES = [
      "234",
      "233",
      "225",
      "221",
      "237",
      "231",
      "232",
      "224",
      "220",
      "229",
      "228",
      "223",
      "227",
      "226",
      "245",
      "222",
    ];
    const cleanNumber = number.replace(/\D/g, "");
    for (const code of WEST_AFRICAN_CODES) {
      if (cleanNumber.startsWith(code)) {
        return cleanNumber;
      }
    }
    if (cleanNumber.length === 11 && cleanNumber.startsWith("0")) {
      return "234" + cleanNumber.substring(1);
    }
    if (cleanNumber.length === 10) {
      return "234" + cleanNumber;
    }
    return "Please enter a valid number";
  }

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleCustomerInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearCart = async () => {
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

  const handleWhatsAppCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      onBackToCart();
      return;
    }
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Please fill in your name, phone number, and delivery address.");
      return;
    }
    setIsWhatsAppLoading(true);

    try {
      const itemsList = cartItems
        .map((item) => {
          const itemName = item.details?.name || item.itemType || "Item";
          const unitPrice = item.unitPrice || 0;
          return `• ${itemName} (${item.quantity} ×  ₦${unitPrice.toFixed(2)})`;
        })
        .join("\n");

      const whatsappTotalAmount = subtotal.toFixed(2);
      const whatsappNumber = businessData?.whatsapp;

      let message = `📦 New Order Request\n\n`;
      message += `*Customer Details*\n`;
      message += `Name: ${customerInfo.name}\n`;
      message += `Phone: ${customerInfo.phone}\n`;
      message += `Delivery Address: ${customerInfo.address}\n`;
      if (customerInfo.note) {
        message += `Note: ${customerInfo.note}\n`;
      }
      message += `\n*Items:*\n${itemsList}\n\n`;
      message += `*Total*: ₦${whatsappTotalAmount}\n\n`;
      message += `_Please confirm availability and provide payment details._`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${setNumber(whatsappNumber)}?text=${encodedMessage}`;

      window.open(whatsappUrl, "_blank");
    } catch (error) {
      console.error("WhatsApp checkout error:", error);
    } finally {
      setIsWhatsAppLoading(false);
      await clearCart();
      onBackToCart();
    }
  };

  return (
    <div className="container mx-auto max-w-lg p-4">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="py-8"
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
            <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Complete Your Order
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your details to finalize your order via WhatsApp.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="group space-y-2">
            <Label
              className="text-sm text-gray-700 dark:text-gray-300"
              htmlFor="name"
            >
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              onChange={handleCustomerInfoChange}
              placeholder="Your full name"
              required
              type="text"
              value={customerInfo.name}
              ref={nameInputRef}
            />
          </div>

          <div className="group space-y-2">
            <Label
              className="text-sm text-gray-700 dark:text-gray-300"
              htmlFor="phone"
            >
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              onChange={handleCustomerInfoChange}
              placeholder="Your WhatsApp number"
              required
              type="tel"
              value={customerInfo.phone}
            />
          </div>

          <div className="group space-y-2">
            <Label
              className="text-sm text-gray-700 dark:text-gray-300"
              htmlFor="address"
            >
              Delivery Address
            </Label>
            <Input
              id="address"
              name="address"
              onChange={handleCustomerInfoChange}
              placeholder="Street, City, Landmark"
              required
              type="text"
              value={customerInfo.address}
            />
          </div>

          <div className="group space-y-2">
            <Label
              className="text-sm text-gray-700 dark:text-gray-300"
              htmlFor="note"
            >
              Order Note (Optional)
            </Label>
            <Textarea
              id="note"
              name="note"
              onChange={handleCustomerInfoChange}
              placeholder="e.g., specific instructions, color, etc."
              value={customerInfo.note}
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            className="w-full text-lg transition-all duration-200 hover:scale-[1.01] bg-[#25D366] text-white hover:bg-[#128C7E]"
            onClick={handleWhatsAppCheckout}
            size="lg"
            disabled={isWhatsAppLoading}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            {isWhatsAppLoading ? "Sending..." : "Checkout on WhatsApp"}
          </Button>
          <Button
            className="w-full text-lg transition-all duration-200 hover:scale-[1.01]"
            onClick={onBackToCart}
            variant="outline"
          >
            Back to Cart
          </Button>
        </div>
      </motion.div>
    </div>
  );
}