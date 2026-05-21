// app/api/payments/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { z } from "zod";

// Define Paystack response schema with Zod
const paystackResponseSchema = z.object({
  status: z.boolean(),
  message: z.string(),
  data: z.object({
    authorization_url: z.string(),
    access_code: z.string(),
    reference: z.string(),
  }),
});

// Define request validation schema
const paymentInitializeSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  amount: z.number().positive("Amount must be positive"),
  email: z.string().email("Valid email is required"),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request with Zod
    const validation = paymentInitializeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { applicationId, amount, email, name } = validation.data;

    // Get full user details from database
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify application exists and belongs to user
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { 
        artisan: {
          include: {
            user: true
          }
        }
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.artisan?.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate unique reference
    const reference = `APP-${applicationId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Initialize payment with Paystack
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
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
              value: name || `${fullUser.firstName} ${fullUser.lastName}`,
            },
          ],
        },
      }),
    });

    // Parse and validate Paystack response with Zod
    const rawData = await paystackResponse.json();
    const paystackValidation = paystackResponseSchema.safeParse(rawData);
    
    if (!paystackValidation.success) {
      console.error("Invalid Paystack response format:", rawData);
      return NextResponse.json(
        { error: "Invalid payment gateway response" },
        { status: 500 }
      );
    }

    const paystackData = paystackValidation.data;

    if (!paystackData.status) {
      console.error("Paystack initialization error:", paystackData);
      return NextResponse.json(
        { error: paystackData.message || "Payment initialization failed" },
        { status: 500 }
      );
    }

    // Create payment transaction record
    await prisma.paymentTransaction.create({
      data: {
        applicationId: applicationId,
        userId: user.id,
        transactionRef: reference,
        paymentGateway: "PAYSTACK",
        amount: amount,
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
      reference: reference,
      access_code: paystackData.data.access_code,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}