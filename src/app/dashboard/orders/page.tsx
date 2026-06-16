// app/dashboard/orders/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import OrdersClient from "./page.client";

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  // Fetch user details
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
    },
  });

  if (!fullUser) {
    redirect("/auth/sign-in");
  }

  // Fetch orders with relations
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
                applicationNumber: application.applicationNumber,
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
                enrollmentCode: enrollment.enrollmentCode,
              };
            } else {
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
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        createdAt: order.createdAt.toISOString(),
        paidAt: order.paidAt?.toISOString() || null,
      };
    })
  );

  const userData = {
    id: fullUser.id,
    email: fullUser.email,
    phone: fullUser.phone || "",
    firstName: fullUser.firstName,
    lastName: fullUser.lastName,
    role: fullUser.role,
    name: `${fullUser.firstName} ${fullUser.lastName}`,
  };

  return <OrdersClient user={userData} orders={enhancedOrders} />;
}