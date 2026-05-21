// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";

interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    transaction_date: string;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reference, applicationId } = body as {
      reference?: string;
      applicationId?: string;
    };

    if (!reference || !applicationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const paystackData = await paystackResponse.json() as PaystackVerificationResponse;

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed", details: paystackData.message },
        { status: 400 }
      );
    }

    // Check if transaction already exists
    const existingTransaction = await prisma.paymentTransaction.findUnique({
      where: { transactionRef: reference },
    });

    if (existingTransaction && existingTransaction.status === "COMPLETED") {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
      });
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        application,
      });
    }

    // Convert the response to a plain object that Prisma can accept
    const gatewayResponse = {
      status: paystackData.data.status,
      reference: paystackData.data.reference,
      amount: paystackData.data.amount,
      currency: paystackData.data.currency,
      transaction_date: paystackData.data.transaction_date,
    };

    // Update payment transaction
    const transaction = await prisma.paymentTransaction.update({
      where: { transactionRef: reference },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
        gatewayResponse: gatewayResponse as any, // Use 'as any' to bypass strict type checking
      },
    });

    // Update application
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        paymentStatus: "COMPLETED",
        paymentAmount: paystackData.data.amount / 100,
        paymentDate: new Date(),
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "PAYMENT_SUCCESS",
        title: "Payment Successful",
        content: `Your payment for application ${application.applicationNumber} has been confirmed.`,
        channel: "IN_APP",
        priority: "HIGH",
        status: "SENT",
        deliveredAt: new Date(),
        metadata: {
          applicationId: application.id,
          applicationNumber: application.applicationNumber,
          amount: paystackData.data.amount / 100,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      application: {
        id: application.id,
        applicationNumber: application.applicationNumber,
        status: application.status,
        paymentStatus: application.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}