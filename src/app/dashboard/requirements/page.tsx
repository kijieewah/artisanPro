// app/artisan/requirements/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import RequirementsClient from "./page.client";

export default async function RequirementsPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  // Fetch user with artisan profile - FIXED: Remove problematic orderBy
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
                    // REMOVED: orderBy: { order: "asc" } - field doesn't exist
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
    redirect("/artisan/profile");
  }

  const artisanProfile = userWithProfile.artisanProfile;
  const currentArtisanService = artisanProfile.artisanServices[0];
  const currentService = currentArtisanService?.service;

  if (!currentService) {
    redirect("/artisan/services");
  }

  // Fetch existing uploaded documents
  const uploadedDocuments = await prisma.requirementUpload.findMany({
    where: {
      artisanId: artisanProfile.id,
      serviceId: currentService.id,
    },
    include: {
      requirement: true,
    },
  });

  // Map requirements with upload status
  const requirements = currentService.requirements.map((req) => {
    const upload = uploadedDocuments.find((doc) => doc.requirementId === req.id);
    return {
      id: req.id,
      name: req.name,
      description: req.description,
      type: req.type,
      isRequired: req.isRequired,
      isUploaded: !!upload,
      upload: upload
        ? {
            id: upload.id,
            fileName: upload.fileName,
            fileUrl: upload.fileUrl,
            fileType: upload.fileType,
            fileSize: upload.fileSize,
            uploadedAt: upload.createdAt,
            status: upload.status,
            verifiedAt: upload.verifiedAt,
            verifiedBy: upload.verifiedBy,
            rejectionReason: upload.rejectionReason,
          }
        : null,
    };
  });

  // Calculate progress
  const requiredRequirements = requirements.filter((r) => r.isRequired);
  const completedRequired = requiredRequirements.filter((r) => r.isUploaded).length;
  const optionalRequirements = requirements.filter((r) => !r.isRequired);
  const completedOptional = optionalRequirements.filter((r) => r.isUploaded).length;
  
  const progress = {
    total: requirements.length,
    uploaded: uploadedDocuments.length,
    requiredTotal: requiredRequirements.length,
    requiredCompleted: completedRequired,
    optionalTotal: optionalRequirements.length,
    optionalCompleted: completedOptional,
    percentage: requirements.length > 0 
      ? Math.round((uploadedDocuments.length / requirements.length) * 100) 
      : 0,
    requiredPercentage: requiredRequirements.length > 0
      ? Math.round((completedRequired / requiredRequirements.length) * 100)
      : 100,
  };

  // Fetch application if exists
  const application = await prisma.application.findFirst({
    where: {
      artisanId: artisanProfile.id,
      serviceId: currentService.id,
    },
    orderBy: { createdAt: "desc" },
  });

  const userData = {
    id: userWithProfile.id,
    email: userWithProfile.email,
    phone: userWithProfile.phone,
    firstName: userWithProfile.firstName,
    lastName: userWithProfile.lastName,
    role: userWithProfile.role,
  };

  return (
    <RequirementsClient
      user={userData}
      artisanProfile={artisanProfile}
      service={currentService}
      requirements={requirements}
      progress={progress}
      application={application}
    />
  );
}