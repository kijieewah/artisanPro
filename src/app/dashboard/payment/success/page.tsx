// app/payment/success/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, ArrowRight, Award, FileCheck } from "lucide-react";

const colors = {
  primary: "#16507b",
};

interface SuccessPageProps {
  searchParams: Promise<{
    applicationId?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const user = await getCurrentUser();
  
  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  const params = await searchParams;
  const { applicationId } = params;

  if (!applicationId) {
    redirect("/dashboard");
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      service: true,
      artisan: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!application) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your application fee has been paid successfully. Your application is now being reviewed.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Application Number:</span>
            <span className="font-medium">{application.applicationNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Service:</span>
            <span className="font-medium">{application.service.name}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard/requirements"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            style={{ backgroundColor: colors.primary }}
          >
            Track Application Status
            <ArrowRight className="h-4 w-4" />
          </Link>
          
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}