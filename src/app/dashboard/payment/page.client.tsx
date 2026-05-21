// app/payment/page.client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  Loader2,
  Zap,
  Award,
  Banknote,
  Smartphone,
} from "lucide-react";

// Brand Colors
const colors = {
  primary: "#16507b",
  secondary: "#2c8cba",
  accent: "#f8b400",
  light: "#f8f9fa",
  dark: "#343a40",
};

interface PaymentClientProps {
  user: {
    name: string;
    email: string;
    phone: string;
  };
  application: {
    id: string;
    applicationNumber: string;
    service: {
      name: string;
    };
  };
  amount: number;
  serviceName: string;
}

export default function PaymentClient({
  user,
  application,
  amount,
  serviceName,
}: PaymentClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  const handlePayWithPaystack = async () => {
    setIsProcessing(true);

    try {
      // Initialize payment
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          amount: amount,
          email: user.email,
          name: user.name,
          phone: user.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      // Load Paystack script
      const paystackScript = document.createElement("script");
      paystackScript.src = "https://js.paystack.co/v1/inline.js";
      paystackScript.onload = () => {
        // @ts-ignore
        const handler = PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: user.email,
          amount: amount * 100, // Paystack expects amount in kobo
          currency: "NGN",
          ref: data.reference,
          firstname: user.name.split(" ")[0],
          lastname: user.name.split(" ")[1] || "",
          phone: user.phone,
          metadata: {
            custom_fields: [
              {
                display_name: "Application ID",
                variable_name: "application_id",
                value: application.id,
              },
              {
                display_name: "Service Name",
                variable_name: "service_name",
                value: serviceName,
              },
            ],
          },
          callback: async (response: any) => {
            // Verify payment
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference: response.reference,
                applicationId: application.id,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              toast.success("Payment successful! Your application has been submitted.");
              router.push(`/payment/success?applicationId=${application.id}`);
            } else {
              toast.error(verifyData.error || "Payment verification failed");
              setIsProcessing(false);
            }
          },
          onClose: () => {
            setIsProcessing(false);
            toast.info("Payment cancelled");
          },
        });
        handler.openIframe();
      };
      document.body.appendChild(paystackScript);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/dashboard/requirements"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requirements
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-1">
            Pay the application fee to submit your certification application
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {/* Application Summary */}
              <div className="p-6 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">Application Summary</h2>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Application Number:</span>
                    <span className="font-medium">{application.applicationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service:</span>
                    <span className="font-medium">{serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Artisan:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <span>Card Payment</span>
                    </div>
                    {paymentMethod === "card" && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod("bank")}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      paymentMethod === "bank"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-gray-500" />
                      <span>Bank Transfer</span>
                    </div>
                    {paymentMethod === "bank" && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod("ussd")}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      paymentMethod === "ussd"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-gray-500" />
                      <span>USSD / Mobile Money</span>
                    </div>
                    {paymentMethod === "ussd" && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </button>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePayWithPaystack}
                  disabled={isProcessing}
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Pay {formatAmount(amount)} Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden sticky top-24">
              <div className="p-6 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Order Summary</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Application Fee</span>
                  <span className="font-medium">{formatAmount(amount)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Processing Fee</span>
                  <span className="font-medium">{formatAmount(0)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">{formatAmount(amount)}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Your payment is secure and encrypted. All transactions are protected by SSL encryption.
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