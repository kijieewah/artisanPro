// app/dashboard/verifyPayment/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Define response types
interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    transaction_date: string;
    metadata?: {
      user_id?: string;
      plan_id?: string;
      plan_name?: string;
      billing_period?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export default function VerifyPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [transaction, setTransaction] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      
      if (!reference) {
        setStatus('failed');
        setMessage('No payment reference found');
        return;
      }

      try {
        const response = await fetch(`/api/payments/verify?reference=${reference}`);
        const data = await response.json() as PaystackVerifyResponse;

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        if (data.status && data.data.status === 'success') {
          setStatus('success');
          setMessage('Payment successful!');
          setTransaction(data.data);
          
          // Save subscription to database
          const metadata = data.data.metadata || {};
          await fetch('/api/payments/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: metadata.user_id,
              planId: metadata.plan_id,
              planName: metadata.plan_name,
              billingPeriod: metadata.billing_period,
              amount: data.data.amount / 100,
              reference: data.data.reference,
              transactionData: data.data,
            }),
          });

          toast.success('Subscription activated successfully!');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard?subscription=active');
          }, 3000);
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment verification failed');
          toast.error('Payment verification failed');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('failed');
        setMessage(error.message || 'Payment verification failed');
        toast.error('Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="relative mx-auto mb-6 h-20 w-20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              <Loader2 className="absolute inset-0 m-auto h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Verifying Payment</h1>
            <p className="mt-2 text-gray-600">Please wait while we confirm your payment</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Payment Successful!</h1>
            <p className="mt-2 text-green-600 font-medium">{message}</p>
            
            {transaction && (
              <div className="mt-6 space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">₦{(transaction.amount / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono text-sm">{transaction.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">{transaction.status}</span>
                </div>
              </div>
            )}
            
            <p className="mt-6 text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Payment Failed</h1>
            <p className="mt-2 text-red-600">{message}</p>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push('/subscription')}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}