// app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reference, applicationId } = body;

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

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Update payment transaction
    const transaction = await prisma.paymentTransaction.update({
      where: { transactionRef: reference },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
        gatewayResponse: paystackData.data,
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

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}