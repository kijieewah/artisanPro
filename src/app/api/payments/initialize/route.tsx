// app/api/payments/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, applicationId, amount, email, name, phone, orderNumber, items } = body;

    console.log("Payment initialization request:", { orderId, applicationId, amount, email, orderNumber });

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const reference = `TX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        currency: "NGN",
        reference,
        metadata: {
          orderId,
          applicationId,
          orderNumber,
          items,
          customerName: name,
          customerPhone: phone,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment/success`,
      }),
    });

    const data = await response.json();
    console.log("Paystack response:", data);

    if (!data.status) {
      console.error("Paystack error:", data.message);
      return NextResponse.json(
        { error: data.message || "Payment initialization failed" },
        { status: 400 }
      );
    }

    // Store transaction reference
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentReference: reference },
      });
    }

    return NextResponse.json({
      success: true,
      reference: data.data.reference,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment initialization failed" },
      { status: 500 }
    );
  }
}