// app/api/payments/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '~/lib/db';

// Helper function
const cleanPhone = (phone: string) => phone.replace(/\D/g, "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Type assertion for the body
    const { userId, planId, planType, billingPeriod, amount, reference } = body as {
      userId?: string;
      planId?: string;
      planType?: string;
      billingPeriod?: string;
      amount?: number;
      reference?: string;
    };

    console.log("The userId which same as phone number", userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID (phone) is required' },
        { status: 400 }
      );
    }

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    const cleanedPhone = cleanPhone(userId);
    
    // Find the user by phone number
    const user = await prisma.user.findFirst({
      where: {
        phone: cleanedPhone,
      },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found',
          message: 'No user found with the provided phone number'
        },
        { status: 404 }
      );
    }

    // Update payment transaction status
    const paymentTransaction = await prisma.paymentTransaction.updateMany({
      where: {
        transactionRef: reference,
        userId: user.id,
      },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
        metadata: {
          planId,
          planType,
          billingPeriod,
          amount,
        },
      },
    });

    if (paymentTransaction.count === 0) {
      // Create new payment transaction if not found
      await prisma.paymentTransaction.create({
        data: {
          userId: user.id,
          transactionRef: reference,
          paymentGateway: "PAYSTACK",
          amount: amount || 0,
          currency: "NGN",
          status: "COMPLETED",
          paidAt: new Date(),
          metadata: {
            planId,
            planType,
            billingPeriod,
          },
        },
      });
    }

    // If you have a subscription model, update it here
    // Otherwise, update user with subscription info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // @ts-ignore - Add if these fields exist in your User model
        // subscriptionPlan: planId,
        // subscriptionStatus: "ACTIVE",
        // subscriptionExpiresAt: expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        },
        payment: {
          reference,
          amount,
          status: "COMPLETED",
        },
      },
    });
  } catch (error: any) {
    console.error('Payment update error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update payment',
        message: error.message || 'Database error'
      },
      { status: 500 }
    );
  }
}