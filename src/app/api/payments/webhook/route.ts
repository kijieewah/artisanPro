// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // Verify webhook signature
    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { event, data } = body;

    if (event === "charge.success") {
      const { reference, metadata, amount, channel, id: transactionId } = data;

      // Find order by payment reference
      const order = await prisma.order.findFirst({
        where: { paymentReference: reference },
        include: {
          orderItems: true,
          cart: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!order) {
        console.error(`Order not found for reference: ${reference}`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "COMPLETED",
          paymentMethod: channel === "card" ? "CARD" : "BANK_TRANSFER",
          paymentId: transactionId.toString(),
          paidAt: new Date(),
        },
      });

      // Update payment transaction
      await prisma.paymentTransaction.update({
        where: { transactionRef: reference },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
          gatewayResponse: data,
          webhookReceivedAt: new Date(),
        },
      });

      // Update invoice
      const invoice = await prisma.invoice.findUnique({
        where: { orderId: order.id },
      });

      if (invoice) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            paymentStatus: "PAID",
            paymentDate: new Date(),
          },
        });
      }

      // Create receipt
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await prisma.receipt.create({
        data: {
          receiptNumber,
          orderId: order.id,
          invoiceId: invoice?.id,
          artisanId: order.artisanId,
          artisanName: invoice?.artisanName || "",
          artisanEmail: invoice?.artisanEmail || "",
          amount: order.total,
          paymentMethod: channel === "card" ? "CARD" : "BANK_TRANSFER",
          paymentReference: reference,
          transactionId: transactionId.toString(),
        },
      });

      // Process each order item
      for (const item of order.orderItems) {
        if (item.itemType === "CERTIFICATION_APPLICATION") {
          // Submit the certification application
          await prisma.application.update({
            where: { id: item.itemId },
            data: {
              status: "SUBMITTED",
              paymentStatus: "COMPLETED",
              paymentId: transactionId.toString(),
              paymentAmount: item.totalPrice,
              paymentDate: new Date(),
              submittedAt: new Date(),
            },
          });
        } else if (item.itemType === "COURSE_ENROLLMENT") {
          // Create enrollment
          const enrollmentCode = `ENR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          await prisma.enrollment.create({
            data: {
              courseId: item.itemId,
              artisanId: order.artisanId,
              enrollmentCode,
              status: "ACTIVE",
              paymentId: transactionId.toString(),
              amountPaid: item.totalPrice,
              enrolledAt: new Date(),
            },
          });
        }
      }

      // Clear the cart (mark items as purchased)
      if (order.cart) {
        await prisma.cartItem.updateMany({
          where: { cartId: order.cart.id },
          data: { status: "PURCHASED" },
        });
      }

      console.log(`Payment successful for order ${order.orderNumber}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}