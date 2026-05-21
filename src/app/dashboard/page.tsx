import { getCurrentUser } from "~/lib/auth1";
import DashboardClient from "./page.client";
import { prisma } from "~/lib/db";

export default async function ArtisanDashboardPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    return null;
  }

  // Fetch user with artisan profile
  const userWithProfile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      artisanProfile: {
        include: {
          state: true,
          localGovernment: true,
          artisanServices: {
            include: {
              service: {
                include: {
                  industry: true,
                  requirements: {
                    where: { status: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userWithProfile || !userWithProfile.artisanProfile) {
    return null;
  }

  const artisanProfile = userWithProfile.artisanProfile;

  // Fetch applications
  const applications = await prisma.application.findMany({
    where: { artisanId: artisanProfile.id },
    include: {
      service: {
        include: {
          industry: true,
          requirements: true,
        },
      },
      applicationRequirements: {
        include: {
          requirement: true,
          upload: true,
        },
      },
      certificate: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Get current service (first artisan service)
  const currentArtisanService = artisanProfile.artisanServices[0];
  const currentService = currentArtisanService?.service;

  // Fetch available training courses - Updated to use primaryServiceId
  let availableCourses: any[] = [];
  if (currentService) {
    availableCourses = await prisma.course.findMany({
      where: {
        primaryServiceId: currentService.id,
        status: "PUBLISHED",
        enrollmentDeadline: { gt: new Date() },
      },
      include: {
        partner: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        primaryService: {
          include: {
            industry: true,
          },
        },
        courseServices: {
          include: {
            service: {
              include: {
                industry: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }

  // Get requirements from the database
  let requirementsStatus: any[] = [];
  if (currentService && currentService.requirements) {
    // Fetch uploaded documents for this artisan and service
    const uploadedDocs = await prisma.requirementUpload.findMany({
      where: {
        artisanId: artisanProfile.id,
        serviceId: currentService.id,
      },
    });
    
    // Map requirements with upload status
    requirementsStatus = currentService.requirements.map(req => ({
      id: req.id,
      name: req.name,
      type: req.type,
      description: `Upload your ${req.name.toLowerCase()} document`,
      isUploaded: uploadedDocs.some(doc => doc.requirementId === req.id),
      upload: uploadedDocs.find(doc => doc.requirementId === req.id),
    }));
  }

  // Calculate statistics
  const totalRequirements = requirementsStatus.length;
  const completedRequirements = requirementsStatus.filter(r => r.isUploaded).length;
  const certificationProgress = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;

  // Determine artisan status
  const hasTraining = (artisanProfile.yearsOfExperience || 0) > 0 || availableCourses.length > 0;
  const hasActiveApplication = applications.some(app => app.status !== "DRAFT");
  const hasPendingApplication = applications.some(app => app.status === "SUBMITTED" || app.status === "UNDER_REVIEW");
  const hasApprovedApplication = applications.some(app => app.status === "APPROVED" && app.certificate);
  const hasRejectedApplication = applications.some(app => app.status === "REJECTED");
  const needsDocuments = applications.some(app => app.status === "PENDING_INFORMATION");
  const currentApplication = applications[0];
  const hasCertificate = hasApprovedApplication;
  const needsTraining = !hasTraining;
  const canApplyForCertification = hasTraining && !hasActiveApplication;
  const needsToUploadDocuments = needsDocuments || (!hasActiveApplication && completedRequirements < totalRequirements);

  // Prepare user data for client
  const userData = {
    id: userWithProfile.id,
    email: userWithProfile.email,
    phone: userWithProfile.phone,
    firstName: userWithProfile.firstName,
    lastName: userWithProfile.lastName,
    role: userWithProfile.role,
  };

  return (
    <DashboardClient
      user={userData}
      artisanProfile={artisanProfile}
      applications={applications}
      availableCourses={availableCourses}
      requirementsStatus={requirementsStatus}
      certificationProgress={certificationProgress}
      totalRequirements={totalRequirements}
      completedRequirements={completedRequirements}
      hasTraining={hasTraining}
      hasActiveApplication={hasActiveApplication}
      hasPendingApplication={hasPendingApplication}
      hasApprovedApplication={hasApprovedApplication}
      hasRejectedApplication={hasRejectedApplication}
      needsDocuments={needsDocuments}
      currentApplication={currentApplication}
      currentService={currentService}
      hasCertificate={hasCertificate}
      needsTraining={needsTraining}
      canApplyForCertification={canApplyForCertification}
      needsToUploadDocuments={needsToUploadDocuments}
    />
  );
}