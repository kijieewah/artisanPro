// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import crypto from "crypto";

// Define webhook event types
interface PaystackWebhookData {
  event: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PaystackWebhookData;
    const signature = request.headers.get("x-paystack-signature");

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = body.event;

    if (event === "charge.success") {
      const { reference } = body.data;
      const metadata = body.data.metadata as {
        application_id?: string;
        artisan_id?: string;
        user_id?: string;
        [key: string]: unknown;
      };

      console.log(`Processing successful payment for reference: ${reference}`);

      // Check if transaction already exists and update
      const existingTransaction = await prisma.paymentTransaction.findUnique({
        where: { transactionRef: reference },
      });

      if (!existingTransaction) {
        console.error(`Transaction not found for reference: ${reference}`);
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }

      if (existingTransaction.status === "COMPLETED") {
        console.log(`Transaction ${reference} already completed`);
        return NextResponse.json({ success: true, message: "Already processed" });
      }

      // Update payment transaction
      await prisma.paymentTransaction.update({
        where: { transactionRef: reference },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
          gatewayResponse: body.data as any,
        },
      });

      // Update application if metadata has application_id
      if (metadata?.application_id) {
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

        console.log(`Application ${metadata.application_id} updated successfully`);
      }

      // Create notification for the user if we have user_id
      if (metadata?.user_id) {
        await prisma.notification.create({
          data: {
            userId: metadata.user_id,
            type: "PAYMENT_SUCCESS",
            title: "Payment Successful",
            content: `Your payment of ₦${(body.data.amount / 100).toLocaleString()} has been confirmed.`,
            channel: "IN_APP",
            priority: "HIGH",
            status: "SENT",
            deliveredAt: new Date(),
            metadata: {
              reference,
              amount: body.data.amount / 100,
              applicationId: metadata.application_id,
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}