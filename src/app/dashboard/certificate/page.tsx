// app/dashboard/certificate/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import CertificateClient from "./page.client";

export default async function CertificatePage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  // Fetch user with artisan profile and certificates
  const userWithProfile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      artisanProfile: {
        include: {
          artisanServices: {
            include: {
              service: {
                include: {
                  industry: true,
                },
              },
            },
          },
        },
      },
      certificatesHeld: {
        include: {
          application: {
            include: {
              service: {
                include: {
                  industry: true,
                },
              },
            },
          },
          issuer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { issuedAt: "desc" },
      },
    },
  });

  if (!userWithProfile || !userWithProfile.artisanProfile) {
    redirect("/auth/sign-in");
  }

  // Fetch applications that are APPROVED but don't have certificates yet
  const approvedApplications = await prisma.application.findMany({
    where: {
      artisanId: userWithProfile.artisanProfile.id,
      status: "APPROVED",
      certificate: null,
    },
    include: {
      service: {
        include: {
          industry: true,
        },
      },
      paymentTransaction: true,
    },
    orderBy: { approvedAt: "desc" },
  });

  // Fetch orders that have been completed for certificate generation
  // Since OrderItem doesn't have direct relation to Application, we need to query differently
  const orders = await prisma.order.findMany({
    where: {
      artisanId: user.id,
      status: "COMPLETED",
    },
    include: {
      orderItems: {
        where: {
          itemType: "CERTIFICATION_APPLICATION",
        },
      },
      invoice: true,
      receipt: true,
      paymentTransaction: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // For each order item, fetch the associated application
  const paidApplications = [];
  for (const order of orders) {
    for (const item of order.orderItems) {
      if (item.itemType === "CERTIFICATION_APPLICATION") {
        const application = await prisma.application.findUnique({
          where: { id: item.itemId },
          include: {
            service: {
              include: {
                industry: true,
              },
            },
            paymentTransaction: true,
          },
        });
        
        if (application && application.paymentStatus === "COMPLETED") {
          paidApplications.push({
            id: application.id,
            applicationNumber: application.applicationNumber,
            serviceName: application.service?.name || "Unknown Service",
            industryName: application.service?.industry?.name || "General",
            orderNumber: order.orderNumber,
            paidAt: order.paidAt,
            invoiceNumber: order.invoice?.invoiceNumber,
            receiptNumber: order.receipt?.receiptNumber,
            status: application.status,
          });
        }
      }
    }
  }

  const userData = {
    id: userWithProfile.id,
    email: userWithProfile.email,
    phone: userWithProfile.phone || "",
    firstName: userWithProfile.firstName,
    lastName: userWithProfile.lastName,
    role: userWithProfile.role,
    name: `${userWithProfile.firstName} ${userWithProfile.lastName}`,
  };

  const artisanProfile = userWithProfile.artisanProfile;

  // Safely map certificates with null checks
  const certificates = (userWithProfile.certificatesHeld || []).map((cert) => ({
    id: cert.id,
    certificateNumber: cert.certificateNumber,
    uniqueCode: cert.uniqueCode,
    qrCodeUrl: cert.qrCodeUrl,
    issuedAt: cert.issuedAt,
    expiresAt: cert.expiresAt,
    serviceName: cert.application?.service?.name || "Unknown Service",
    industryName: cert.application?.service?.industry?.name || "General",
    issuerName: cert.issuer ? `${cert.issuer.firstName} ${cert.issuer.lastName}` : "System",
  }));

  // Map approved applications that need certificate generation
  const pendingCertificates = approvedApplications.map((app) => ({
    id: app.id,
    applicationNumber: app.applicationNumber,
    serviceName: app.service?.name || "Unknown Service",
    industryName: app.service?.industry?.name || "General",
    approvedAt: app.approvedAt,
    paymentCompleted: app.paymentStatus === "COMPLETED",
  }));

  return (
    <CertificateClient
      user={userData}
      artisanProfile={artisanProfile}
      certificates={certificates}
      pendingCertificates={pendingCertificates}
      paidApplications={paidApplications}
    />
  );
}