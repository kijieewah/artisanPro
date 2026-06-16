// app/dashboard/application/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import ApplicationClient from "./page.client";

export default async function ApplicationPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  // Fetch user with artisan profile
  const userWithProfile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      artisanProfile: true,
    },
  });

  if (!userWithProfile || !userWithProfile.artisanProfile) {
    redirect("/dashboard/profile");
  }

  const artisanProfile = userWithProfile.artisanProfile;

  // Fetch all applications for this artisan
  const applications = await prisma.application.findMany({
    where: {
      artisanId: artisanProfile.id,
    },
    include: {
      service: {
        include: {
          industry: true,
        },
      },
      applicationRequirements: {
        include: {
          requirement: true,
          upload: true,
        },
      },
      certificate: true,
      paymentTransaction: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Check which applications are in cart - FIXED: use findFirst instead of findUnique
  const cart = await prisma.cart.findFirst({
    where: { artisanId: user.id },
    include: {
      items: {
        where: {
          itemType: "CERTIFICATION_APPLICATION",
          status: "ACTIVE",
        },
      },
    },
  });

  const cartItemIds = new Set(
    cart?.items.map(item => item.itemId) || []
  );

  // Transform applications for client with proper type conversion
  const transformedApplications = applications.map((app) => ({
    id: app.id,
    applicationNumber: app.applicationNumber,
    status: app.status,
    completionScore: app.completionScore,
    paymentStatus: app.paymentStatus,
    paymentAmount: app.paymentAmount ? Number(app.paymentAmount) : undefined,
    paymentDate: app.paymentDate || undefined,
    submittedAt: app.submittedAt || undefined,
    approvedAt: app.approvedAt || undefined,
    reviewedAt: app.reviewedAt || undefined,
    rejectionReason: app.rejectionReason || undefined,
    inCart: cartItemIds.has(app.id),
    service: {
      id: app.service.id,
      name: app.service.name,
      industryName: app.service.industry?.name,
    },
    certificate: app.certificate
      ? {
          id: app.certificate.id,
          certificateNumber: app.certificate.certificateNumber,
          issuedAt: app.certificate.issuedAt,
        }
      : undefined,
    requirements: app.applicationRequirements.map((req) => ({
      id: req.id,
      requirementId: req.requirementId,
      name: req.requirement.name,
      type: req.requirement.type,
      isMet: req.isMet,
      uploadUrl: req.upload?.documentUrl,
      uploadStatus: req.upload?.status,
      verifiedAt: req.verifiedAt || undefined,
      rejectionReason: req.rejectionReason || undefined,
    })),
    paymentTransaction: app.paymentTransaction
      ? {
          id: app.paymentTransaction.id,
          transactionRef: app.paymentTransaction.transactionRef,
          amount: app.paymentTransaction.amount ? Number(app.paymentTransaction.amount) : 0,
          status: app.paymentTransaction.status,
          paidAt: app.paymentTransaction.paidAt || undefined,
        }
      : undefined,
  }));

  // Calculate statistics
  const stats = {
    total: transformedApplications.length,
    draft: transformedApplications.filter((a) => a.status === "DRAFT").length,
    submitted: transformedApplications.filter((a) => a.status === "SUBMITTED").length,
    underReview: transformedApplications.filter((a) => a.status === "UNDER_REVIEW").length,
    approved: transformedApplications.filter((a) => a.status === "APPROVED").length,
    rejected: transformedApplications.filter((a) => a.status === "REJECTED").length,
    pendingInfo: transformedApplications.filter((a) => a.status === "PENDING_INFORMATION").length,
    inCart: transformedApplications.filter((a) => a.inCart).length,
  };

  const userData = {
    id: userWithProfile.id,
    email: userWithProfile.email,
    phone: userWithProfile.phone || "",
    firstName: userWithProfile.firstName,
    lastName: userWithProfile.lastName,
    role: userWithProfile.role,
  };

  return (
    <ApplicationClient
      user={userData}
      artisanProfile={artisanProfile}
      applications={transformedApplications}
      stats={stats}
    />
  );
}