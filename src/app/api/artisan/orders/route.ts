// app/api/artisan/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { artisanId: user.id },
      include: {
        orderItems: true,
        invoice: true,
        receipt: true,
        paymentTransaction: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Enhance orders with item details
    const enhancedOrders = await Promise.all(
      orders.map(async (order) => {
        const enhancedItems = await Promise.all(
          order.orderItems.map(async (item) => {
            let details = null;
            
            if (item.itemType === "CERTIFICATION_APPLICATION") {
              const application = await prisma.application.findUnique({
                where: { id: item.itemId },
                include: { service: true },
              });
              if (application) {
                details = {
                  id: application.id,
                  name: `${application.service.name} Certification`,
                  serviceName: application.service.name,
                  type: "certification",
                  status: application.status,
                };
              }
            } else if (item.itemType === "COURSE_ENROLLMENT") {
              const enrollment = await prisma.enrollment.findFirst({
                where: {
                  courseId: item.itemId,
                  artisanId: user.id,
                },
                include: {
                  course: {
                    include: {
                      primaryService: true,
                      partner: true,
                    },
                  },
                },
              });
              if (enrollment) {
                details = {
                  id: enrollment.id,
                  name: enrollment.course.name,
                  serviceName: enrollment.course.primaryService.name,
                  partnerName: enrollment.course.partner.businessName,
                  type: "course",
                  status: enrollment.status,
                  progress: enrollment.progress,
                };
              } else {
                // Course not yet enrolled (payment completed but enrollment not created)
                const course = await prisma.course.findUnique({
                  where: { id: item.itemId },
                  include: { primaryService: true, partner: true },
                });
                if (course) {
                  details = {
                    id: course.id,
                    name: course.name,
                    serviceName: course.primaryService.name,
                    partnerName: course.partner.businessName,
                    type: "course",
                    status: "PENDING_ENROLLMENT",
                  };
                }
              }
            }
            
            return { ...item, details };
          })
        );

        return {
          ...order,
          orderItems: enhancedItems,
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: enhancedOrders,
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}