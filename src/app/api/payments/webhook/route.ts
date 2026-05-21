// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-paystack-signature");

    // Verify webhook signature
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = body.event;

    if (event === "charge.success") {
      const { reference, metadata } = body.data;

      // Update payment transaction
      await prisma.paymentTransaction.update({
        where: { transactionRef: reference },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
          gatewayResponse: body.data,
        },
      });

      // Update application
      await prisma.application.update({
        where: { id: metadata.application_id },
        data: {
          paymentStatus: "COMPLETED",
          paymentAmount: body.data.amount / 100,
          paymentDate: new Date(),
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}