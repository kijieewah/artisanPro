import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '~/lib/db'; // Import your Prisma instance

// Helper function (same as in your user route)
const cleanPhone = (phone: string) => phone.replace(/\D/g, "");

// Helper function to map plan name to numeric ID
const mapPlanIdToNumber = (planId: string): number => {
  const planMap: Record<string, number> = {
    'basic': 1,
    'standard': 2,
    'premium': 3,
    '1': 1,    // Handle numeric strings too
    '2': 2,
    '3': 3
  };
  
  const lowerPlanId = planId.toLowerCase();
  return planMap[lowerPlanId] || 1; // Default to 1 if not found
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { userId, planId, planType, billingPeriod, amount, reference } = body;

    console.log("The userId which same as phone number", userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID (phone) is required' },
        { status: 400 }
      );
    }

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    console.log('Updating subscription for user with plan:', planId);

    const cleanedPhone = cleanPhone(userId);
    const expiresAt = new Date();
    
    // Calculate expiration based on billing period
    if (planType === "Monthly" || billingPeriod === "monthly") {
      expiresAt.setDate(expiresAt.getDate() + 29); // 30-day subscription
    } else if (planType === "Yearly" || billingPeriod === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      expiresAt.setDate(expiresAt.getDate() - 1); // 365 days
    } else {
      // Default to monthly
      expiresAt.setDate(expiresAt.getDate() + 29);
    }

    // Map planId to integer value
    const numericPlanId = mapPlanIdToNumber(planId);
    
    console.log(`Plan mapping: ${planId} -> ${numericPlanId} (type: ${typeof numericPlanId})`);

    // Update database with subscription using transaction
    const [subscription, history] = await prisma.$transaction([
      // Update or create subscription
      prisma.subscription.upsert({
        where: {
          userId: "13482425859",
        },
        update: {
          planId: numericPlanId, // Store as integer
          planType: planType || "Monthly",
          status: "ACTIVE",
          expiresAt: expiresAt,
        },
        create: {
          planId: numericPlanId, // Store as integer
          userId: "13482425859",
          planType: planType || "Monthly",
          status: "ACTIVE",
          expiresAt: expiresAt,
        },
      }),

      // Create subscription history
      prisma.subscriptionHistory.create({
        data: {
          planId: numericPlanId, // Already an integer
          userId: "13482425859",
          planType: planType || "Monthly",
          changeReason: "Payment successful",
          expiresAt: expiresAt,
        },
      }),
    ]);

    // Also update the user's subscription status if needed
    await prisma.user.update({
      where: {
        phone: cleanedPhone,
      },
      data: {
        subs_stat: 1,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      data: {
        subscription: {
          id: subscription.id,
          userId: subscription.userId,
          planId: subscription.planId,
          planType: subscription.planType,
          status: subscription.status,
          expiresAt: subscription.expiresAt,
        },
        history: {
          id: history.id,
          changeReason: history.changeReason,
          createdAt: history.createdAt,
        }
      },
    });
  } catch (error: any) {
    console.error('Subscription update error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Duplicate subscription',
          message: 'Subscription already exists for this user'
        },
        { status: 409 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found',
          message: 'No user found with the provided phone number'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update subscription',
        message: error.message || 'Database error'
      },
      { status: 500 }
    );
  }
}