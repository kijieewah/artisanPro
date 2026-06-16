// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, orderId } = body;

    console.log("Verifying payment:", { reference, orderId });

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Verify transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("Paystack verification response:", data);

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const transaction = data.data;
    
    // Update order if orderId is provided
    if (orderId) {
      // First check if order exists
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { 
          invoice: true, 
          orderItems: true,
          cart: {
            include: {
              items: true
            }
          }
        },
      });

      if (!existingOrder) {
        console.error("Order not found:", orderId);
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "COMPLETED",
          paymentId: transaction.id.toString(),
          paidAt: new Date(),
          paymentMethod: transaction.channel === "card" ? "CARD" : "BANK_TRANSFER",
        },
      });

      // Update invoice if exists
      if (existingOrder.invoice) {
        await prisma.invoice.update({
          where: { id: existingOrder.invoice.id },
          data: {
            paymentStatus: "PAID",
            paymentDate: new Date(),
          },
        });
      }

      // Update or create payment transaction
      await prisma.paymentTransaction.upsert({
        where: { transactionRef: reference },
        update: {
          status: "COMPLETED",
          paidAt: new Date(),
          gatewayResponse: transaction,
        },
        create: {
          orderId: orderId,
          userId: existingOrder.artisanId,
          transactionRef: reference,
          paymentGateway: "PAYSTACK",
          amount: existingOrder.total,
          status: "COMPLETED",
          gatewayResponse: transaction,
          paidAt: new Date(),
        },
      });

      // Process each order item
      for (const item of existingOrder.orderItems) {
        if (item.itemType === "CERTIFICATION_APPLICATION") {
          // Update application to SUBMITTED
          await prisma.application.update({
            where: { id: item.itemId },
            data: {
              status: "SUBMITTED",
              paymentStatus: "COMPLETED",
              paymentId: transaction.id.toString(),
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
            // Regular course enrollment
            const enrollmentCode = `ENR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            await prisma.enrollment.create({
              data: {
                courseId: item.itemId,
                artisanId: existingOrder.artisanId,
                enrollmentCode,
                status: "ACTIVE",
                paymentId: transaction.id.toString(),
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
                  ...item.metadata,
                  paymentStatus: "COMPLETED",
                  paidAt: new Date().toISOString(),
                  transactionId: transaction.id.toString(),
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
                ...item.metadata,
                paymentStatus: "COMPLETED",
                paidAt: new Date().toISOString(),
                transactionId: transaction.id.toString(),
                requestStatus: "PENDING",
              },
            },
          });
        }
      }

      // CLEAR THE CART - Mark all active cart items as PURCHASED
      if (existingOrder.cart) {
        await prisma.cartItem.updateMany({
          where: {
            cartId: existingOrder.cart.id,
            status: "ACTIVE",
          },
          data: {
            status: "PURCHASED",
          },
        });
        
        console.log(`Cart cleared: ${existingOrder.cart.id} - Items marked as PURCHASED`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully and cart cleared",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment verification failed" },
      { status: 500 }
    );
  }
}