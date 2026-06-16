// app/dashboard/payment/success/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Download, Receipt } from "lucide-react";

const colors = {
  primary: "#16507b",
};

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    reference?: string;
    trxref?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const user = await getCurrentUser();
  
  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  const params = await searchParams;
  const reference = params.reference || params.trxref;

  if (!reference) {
    redirect("/dashboard");
  }

  // Find order by payment reference
  const order = await prisma.order.findFirst({
    where: { 
      paymentReference: reference,
      artisanId: user.id,
    },
    include: {
      invoice: true,
      receipt: true,
      orderItems: true,
    },
  });

  if (!order) {
    // If order not found, try to find by payment transaction
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { transactionRef: reference },
    });
    
    if (transaction && transaction.orderId) {
      const orderByTransaction = await prisma.order.findFirst({
        where: { 
          id: transaction.orderId,
          artisanId: user.id,
        },
        include: {
          invoice: true,
          receipt: true,
          orderItems: true,
        },
      });
      
      if (orderByTransaction) {
        return (
          <SuccessContent order={orderByTransaction} />
        );
      }
    }
    
    redirect("/dashboard");
  }

  return <SuccessContent order={order} />;
}

function SuccessContent({ order }: { order: any }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-mono font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold" style={{ color: colors.primary }}>
                  ₦{Number(order.total).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Date:</span>
                <span>{new Date(order.paidAt || order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="font-semibold text-gray-900 mb-3">Items Purchased</h2>
            <div className="space-y-2">
              {order.orderItems.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.metadata?.serviceName || item.metadata?.courseName || item.metadata?.partnerName || "Item"}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </span>
                  <span className="font-medium">₦{Number(item.totalPrice).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/dashboard/orders"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              View My Orders
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}