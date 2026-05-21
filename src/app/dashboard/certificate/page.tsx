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
                  industry: true, // Add industry relation here
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

  if (!userWithProfile) {
    redirect("/auth/sign-in");
  }

  // Fetch applications for certificate requests
  const applications = await prisma.application.findMany({
    where: {
      artisanId: userWithProfile.artisanProfile?.id,
      status: "APPROVED",
      certificate: null,
    },
    include: {
      service: {
        include: {
          industry: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const userData = {
    id: userWithProfile.id,
    email: userWithProfile.email,
    phone: userWithProfile.phone || "",
    firstName: userWithProfile.firstName,
    lastName: userWithProfile.lastName,
    role: userWithProfile.role,
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

  const pendingCertificates = (applications || []).map((app) => ({
    id: app.id,
    applicationNumber: app.applicationNumber,
    serviceName: app.service?.name || "Unknown Service",
    industryName: app.service?.industry?.name || "General",
    approvedAt: app.approvedAt,
  }));

  return (
    <CertificateClient
      user={userData}
      artisanProfile={artisanProfile}
      certificates={certificates}
      pendingCertificates={pendingCertificates}
    />
  );
}