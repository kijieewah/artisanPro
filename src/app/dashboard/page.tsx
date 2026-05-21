// app/dashboard/page.tsx
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

  const artisanProfileRaw = userWithProfile.artisanProfile;

  // Fetch applications
  const applications = await prisma.application.findMany({
    where: { artisanId: artisanProfileRaw.id },
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
  const currentArtisanService = artisanProfileRaw.artisanServices[0];
  const currentService = currentArtisanService?.service;

  // Fetch available training courses
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
    const uploadedDocs = await prisma.requirementUpload.findMany({
      where: {
        artisanId: artisanProfileRaw.id,
        serviceId: currentService.id,
      },
    });
    
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
  const hasTraining = (artisanProfileRaw.yearsOfExperience || 0) > 0 || availableCourses.length > 0;
  const hasActiveApplication = applications.some(app => app.status !== "DRAFT");
  const hasPendingApplication = applications.some(app => app.status === "SUBMITTED" || app.status === "UNDER_REVIEW");
  const hasApprovedApplication = applications.some(app => app.status === "APPROVED" && app.certificate);
  const hasRejectedApplication = applications.some(app => app.status === "REJECTED");
  const needsDocuments = applications.some(app => app.status === "PENDING_INFORMATION");
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

  // Helper function to safely convert skills to string[]
  const convertSkillsToArray = (skills: any): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) {
      return skills.filter((item): item is string => typeof item === 'string');
    }
    if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string');
        }
      } catch {
        return [];
      }
    }
    return [];
  };

  // Transform artisan profile
  const transformedArtisanProfile = {
    id: artisanProfileRaw.id,
    userId: artisanProfileRaw.userId,
    gender: artisanProfileRaw.gender || "",
    dateOfBirth: artisanProfileRaw.dateOfBirth ? artisanProfileRaw.dateOfBirth.toISOString() : "",
    address: artisanProfileRaw.address || "",
    city: "",
    state: artisanProfileRaw.state ? { name: artisanProfileRaw.state.name } : { name: "Not specified" },
    localGovernment: artisanProfileRaw.localGovernment ? { name: artisanProfileRaw.localGovernment.name } : { name: "Not specified" },
    workingAddress: artisanProfileRaw.workingAddress || "",
    yearsOfExperience: artisanProfileRaw.yearsOfExperience || 0,
    bio: artisanProfileRaw.bio || "",
    skills: convertSkillsToArray(artisanProfileRaw.skills),
    verificationStatus: artisanProfileRaw.verificationStatus,
    permitStatus: artisanProfileRaw.permitStatus,
    approvalStatus: artisanProfileRaw.approvalStatus,
    completionScore: artisanProfileRaw.completionScore || 0,
    artisanServices: (artisanProfileRaw.artisanServices || []).map((as) => ({
      service: {
        id: as.service.id,
        name: as.service.name,
        industry: {
          name: as.service.industry?.name || "",
        },
      },
    })),
  };

  // Transform applications for client
  const transformedApplications = applications.map((app) => ({
    id: app.id,
    applicationNumber: app.applicationNumber,
    status: app.status,
    completionScore: app.completionScore,
    service: {
      id: app.service.id,
      name: app.service.name,
      industry: {
        name: app.service.industry?.name || "",
      },
    },
    certificate: app.certificate
      ? {
          id: app.certificate.id,
          certificateNumber: app.certificate.certificateNumber,
          issuedAt: app.certificate.issuedAt.toISOString(),
        }
      : undefined,
    rejectionReason: app.rejectionReason || undefined,
  }));

  // Create a default application for when no applications exist
  const defaultApplication = {
    id: "",
    applicationNumber: "",
    status: "DRAFT",
    completionScore: 0,
    service: {
      id: 0,
      name: "",
      industry: {
        name: "",
      },
    },
    certificate: undefined,
    rejectionReason: undefined,
  };

  // Transform currentApplication - ensure it's never undefined
  const transformedCurrentApplication = applications[0] ? {
    id: applications[0].id,
    applicationNumber: applications[0].applicationNumber,
    status: applications[0].status,
    completionScore: applications[0].completionScore,
    service: {
      id: applications[0].service.id,
      name: applications[0].service.name,
      industry: {
        name: applications[0].service.industry?.name || "",
      },
    },
    certificate: applications[0].certificate
      ? {
          id: applications[0].certificate.id,
          certificateNumber: applications[0].certificate.certificateNumber,
          issuedAt: applications[0].certificate.issuedAt.toISOString(),
        }
      : undefined,
    rejectionReason: applications[0].rejectionReason || undefined,
  } : defaultApplication;

  return (
    <DashboardClient
      user={userData}
      artisanProfile={transformedArtisanProfile}
      applications={transformedApplications}
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
      currentApplication={transformedCurrentApplication}
      currentService={currentService}
      hasCertificate={hasCertificate}
      needsTraining={needsTraining}
      canApplyForCertification={canApplyForCertification}
      needsToUploadDocuments={needsToUploadDocuments}
    />
  );
}