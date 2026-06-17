// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import crypto from "crypto";

// Define webhook request types
interface PaystackWebhookData {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      orderId?: string;
      applicationId?: string;
      orderNumber?: string;
      customerName?: string;
      customerPhone?: string;
      items?: any[];
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PaystackWebhookData;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

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

      console.log("Webhook: Payment successful for reference:", reference);

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
      try {
        await prisma.paymentTransaction.update({
          where: { transactionRef: reference },
          data: {
            status: "COMPLETED",
            paidAt: new Date(),
            gatewayResponse: data as any,
            webhookReceivedAt: new Date(),
          },
        });
      } catch (error) {
        console.error("Payment transaction not found for reference:", reference);
        // Create payment transaction if it doesn't exist
        await prisma.paymentTransaction.create({
          data: {
            orderId: order.id,
            userId: order.artisanId,
            transactionRef: reference,
            paymentGateway: "PAYSTACK",
            amount: order.total,
            status: "COMPLETED",
            gatewayResponse: data as any,
            paidAt: new Date(),
            webhookReceivedAt: new Date(),
          },
        });
      }

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
          // Check if it's a course (not a partner)
          const course = await prisma.course.findUnique({
            where: { id: item.itemId },
          });
          
          if (course) {
            // Create enrollment for regular course
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
          } else {
            // This is a partner (training provider) - update metadata
            await prisma.orderItem.update({
              where: { id: item.id },
              data: {
                metadata: {
                  ...(item.metadata as any || {}),
                  paymentStatus: "COMPLETED",
                  paidAt: new Date().toISOString(),
                  transactionId: transactionId.toString(),
                },
              },
            });
          }
        } else if (item.itemType === "CERTIFICATION_SERVICE") {
          // Certification service - update metadata
          await prisma.orderItem.update({
            where: { id: item.id },
            data: {
              metadata: {
                ...(item.metadata as any || {}),
                paymentStatus: "COMPLETED",
                paidAt: new Date().toISOString(),
                transactionId: transactionId.toString(),
                requestStatus: "PENDING",
              },
            },
          });
        }
      }

      // Clear the cart (mark items as purchased)
      if (order.cart) {
        await prisma.cartItem.updateMany({
          where: { 
            cartId: order.cart.id,
            status: "ACTIVE",
          },
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