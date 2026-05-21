// app/api/payment/initialize/route.ts
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
    const { applicationId, amount, email, name, phone } = body;

    if (!applicationId || !amount || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify application exists and belongs to user
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { artisan: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.artisan.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate unique reference
    const reference = `APP-${applicationId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Initialize payment with Paystack
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        currency: "NGN",
        reference,
        metadata: {
          application_id: applicationId,
          artisan_id: application.artisanId,
          user_id: user.id,
          custom_fields: [
            {
              display_name: "Application ID",
              variable_name: "application_id",
              value: applicationId,
            },
            {
              display_name: "Artisan Name",
              variable_name: "artisan_name",
              value: name,
            },
          ],
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("Paystack initialization error:", paystackData);
      return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
    }

    // Create payment transaction record
    await prisma.paymentTransaction.create({
      data: {
        applicationId,
        userId: user.id,
        transactionRef: reference,
        paymentGateway: "PAYSTACK",
        amount,
        currency: "NGN",
        status: "PENDING",
        metadata: {
          paystackReference: paystackData.data.reference,
          accessCode: paystackData.data.access_code,
        },
      },
    });

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference,
      access_code: paystackData.data.access_code,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}