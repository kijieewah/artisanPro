// app/dashboard/payment/page.client.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Lock,
  Shield,
  CheckCircle,
  Loader2,
  Zap,
  Award,
  ShoppingCart,
  GraduationCap,
  AlertCircle,
} from "lucide-react";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

interface CartItem {
  id: string;
  name: string;
  serviceName?: string;
  partnerName?: string;
  type: string;
  applicationNumber?: string;
  amount: number;
}

interface PaymentClientProps {
  user: {
    name: string;
    email: string;
    phone: string;
  };
  items: CartItem[];
  totalAmount: number;
  orderNumber: string;
  orderId?: string;
  applicationId?: string;
  itemType: string;
}

// Define response types
interface PaymentInitializeResponse {
  success: boolean;
  reference: string;
  authorization_url?: string;
  access_code?: string;
  error?: string;
}

export default function PaymentClient({
  user,
  items,
  totalAmount,
  orderNumber,
  orderId,
  applicationId,
  itemType,
}: PaymentClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Paystack script on component mount
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existingScript && window.PaystackPop) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    
    script.onload = () => {
      console.log("Paystack script loaded");
      const checkInterval = setInterval(() => {
        if (window.PaystackPop) {
          setScriptLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.PaystackPop) {
          console.error("PaystackPop not available");
          toast.error("Payment gateway failed to load. Please refresh.");
        }
      }, 5000);
    };
    
    script.onerror = () => {
      console.error("Failed to load Paystack script");
      toast.error("Failed to load payment gateway. Please refresh the page.");
    };
    
    document.body.appendChild(script);

    return () => {};
  }, []);

  const handlePayWithPaystack = async () => {
    if (!scriptLoaded || !window.PaystackPop) {
      toast.error("Payment gateway is still loading. Please wait...");
      return;
    }

    // Validate required data
    if (!user.email) {
      toast.error("User email is missing. Please contact support.");
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      toast.error("Invalid payment amount.");
      return;
    }

    if (!orderNumber) {
      toast.error("Order information is missing.");
      return;
    }

    setIsProcessing(true);

    try {
      // Initialize payment
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId,
          amount: totalAmount,
          email: user.email,
          name: user.name,
          phone: user.phone,
          orderNumber: orderNumber,
          items: items.map(item => ({
            name: item.name,
            type: item.type,
            amount: item.amount,
          })),
        }),
      });

      const data = (await response.json()) as PaymentInitializeResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      // Define callback functions
      const callback = (response: any) => {
        console.log("Payment successful:", response);
        router.push(`/dashboard/payment/success?reference=${response.reference}`);
      };

      const onClose = () => {
        console.log("Payment modal closed");
        setIsProcessing(false);
        toast.info("Payment cancelled");
      };

      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: totalAmount * 100,
        currency: "NGN",
        ref: data.reference,
        firstname: user.name.split(" ")[0],
        lastname: user.name.split(" ")[1] || "",
        phone: user.phone,
        metadata: {
          custom_fields: [
            {
              display_name: "Order Number",
              variable_name: "order_number",
              value: orderNumber,
            },
            {
              display_name: "Items",
              variable_name: "items",
              value: items.map(i => i.name).join(", "),
            },
          ],
        },
        callback: callback,
        onClose: onClose,
      });

      handler.openIframe();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initialize payment");
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "certification":
        return <Award className="h-5 w-5 text-green-600" />;
      case "certification_service":
        return <Award className="h-5 w-5 text-purple-600" />;
      case "course":
      case "partner_training":
        return <GraduationCap className="h-5 w-5 text-blue-600" />;
      default:
        return <ShoppingCart className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-1">
            Review your order and complete payment to confirm your purchase
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">Order Summary</h2>
                <p className="text-sm text-gray-500 mt-1">Order #{orderNumber}</p>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Items in your order</h3>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full p-2 bg-white">
                          {getItemIcon(item.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.serviceName || item.partnerName}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold" style={{ color: colors.primary }}>
                        {formatAmount(item.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden sticky top-24">
              <div className="p-6 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Payment Summary</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatAmount(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">{formatAmount(0)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg" style={{ color: colors.primary }}>
                      {formatAmount(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* User Info Display */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Payment will be made by:</p>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  {user.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
                </div>

                <button
                  onClick={handlePayWithPaystack}
                  disabled={isProcessing || !scriptLoaded}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : !scriptLoaded ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Pay {formatAmount(totalAmount)} Now
                    </>
                  )}
                </button>

                {!scriptLoaded && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-xs text-yellow-700">
                        Loading payment gateway. Please wait...
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Your payment is secure and encrypted. All transactions are protected by SSL encryption.
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-gray-600 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      You will receive a receipt and invoice via email after successful payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
            <Lock className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Secure Payment</p>
              <p className="text-xs text-gray-500">256-bit SSL encryption</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Verified by Paystack</p>
              <p className="text-xs text-gray-500">PCI DSS Level 1 compliant</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
            <Award className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Money-back Guarantee</p>
              <p className="text-xs text-gray-500">If application is rejected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}