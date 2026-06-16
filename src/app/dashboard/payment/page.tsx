// app/dashboard/payment/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import PaymentClient from "./page.client";

interface PaymentPageProps {
  searchParams: Promise<{
    orderId?: string;
    applicationId?: string;
    amount?: string;
  }>;
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const user = await getCurrentUser();
  
  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  const params = await searchParams;
  const { orderId, applicationId, amount } = params;

  if (!orderId && !applicationId) {
    redirect("/dashboard");
  }

  // Fetch full user details
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!fullUser) {
    redirect("/auth/sign-in");
  }

  let cartItems = [];
  let paymentAmount = 0;
  let orderNumber = "";
  let actualOrderId = orderId;

  // If orderId is provided (cart checkout)
  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId, artisanId: user.id },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      redirect("/dashboard");
    }

    // Get cart items with details
    for (const item of order.orderItems) {
      let itemDetails = null;
      
      if (item.itemType === "CERTIFICATION_APPLICATION") {
        const application = await prisma.application.findUnique({
          where: { id: item.itemId },
          include: { service: true },
        });
        if (application) {
          itemDetails = {
            id: application.id,
            name: `${application.service.name} Certification`,
            serviceName: application.service.name,
            type: "certification",
            applicationNumber: application.applicationNumber,
            amount: Number(item.totalPrice),
          };
        }
      } else if (item.itemType === "COURSE_ENROLLMENT") {
        const course = await prisma.course.findUnique({
          where: { id: item.itemId },
          include: { primaryService: true, partner: true },
        });
        if (course) {
          itemDetails = {
            id: course.id,
            name: course.name,
            serviceName: course.primaryService.name,
            partnerName: course.partner.businessName,
            type: "course",
            amount: Number(item.totalPrice),
          };
        } else {
          // Try as partner
          const partner = await prisma.partnerProfile.findUnique({
            where: { id: item.itemId },
          });
          if (partner) {
            itemDetails = {
              id: partner.id,
              name: `${partner.businessName} Training Program`,
              partnerName: partner.businessName,
              type: "partner_training",
              amount: Number(item.totalPrice),
            };
          }
        }
      } else if (item.itemType === "CERTIFICATION_SERVICE") {
        const partnerService = await prisma.partnerService.findUnique({
          where: { id: parseInt(item.itemId) },
          include: { partner: true, service: true },
        });
        if (partnerService) {
          itemDetails = {
            id: partnerService.id,
            name: `${partnerService.service.name} Certification`,
            serviceName: partnerService.service.name,
            partnerName: partnerService.partner.businessName,
            type: "certification_service",
            amount: Number(item.totalPrice),
          };
        }
      }
      
      if (itemDetails) {
        cartItems.push(itemDetails);
      }
    }

    paymentAmount = Number(order.total);
    orderNumber = order.orderNumber;
    actualOrderId = order.id;
  } 
  // If applicationId is provided (single certification)
  else if (applicationId) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        service: true,
        artisan: {
          include: { user: true },
        },
      },
    });

    if (!application || application.artisan.userId !== user.id) {
      redirect("/dashboard");
    }

    const amountValue = amount ? parseInt(amount) : 5000;
    cartItems = [{
      id: application.id,
      name: `${application.service.name} Certification`,
      serviceName: application.service.name,
      type: "certification",
      applicationNumber: application.applicationNumber,
      amount: amountValue,
    }];
    
    paymentAmount = amountValue;
    orderNumber = application.applicationNumber;
  }

  const userData = {
    name: `${fullUser.firstName} ${fullUser.lastName}`,
    email: fullUser.email,
    phone: fullUser.phone || "",
  };

  return (
    <PaymentClient
      user={userData}
      items={cartItems}
      totalAmount={paymentAmount}
      orderNumber={orderNumber}
      orderId={actualOrderId}
      applicationId={applicationId}
      itemType={orderId ? "cart" : "single"}
    />
  );
}