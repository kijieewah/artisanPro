// app/dashboard/requirements/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import RequirementsClient from "./page.client";

interface PageProps {
  searchParams: Promise<{ serviceId?: string }>;
}

export default async function RequirementsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  const resolvedParams = await searchParams;
  const { serviceId } = resolvedParams;

  if (!serviceId) {
    redirect("/dashboard");
  }

  // Fetch full user details from database
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

  // Fetch artisan profile
  const artisanProfile = await prisma.artisanProfile.findUnique({
    where: { userId: user.id },
    include: {
      state: true,
      localGovernment: true,
    },
  });

  if (!artisanProfile) {
    redirect("/dashboard/profile");
  }

  // Fetch service details
  const service = await prisma.service.findUnique({
    where: { id: parseInt(serviceId) },
    include: {
      industry: true,
    },
  });

  if (!service) {
    redirect("/dashboard");
  }

  // Transform service data - convert null to undefined
  const transformedService = {
    id: service.id,
    name: service.name,
    description: service.description || undefined,
    image: service.image || undefined,
    status: service.status,
    industryId: service.industryId,
    industry: {
      id: service.industry.id,
      name: service.industry.name,
      description: service.industry.description || undefined,
      status: service.industry.status,
    },
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };

  // Fetch requirements for this service
  const requirements = await prisma.requirement.findMany({
    where: {
      serviceId: parseInt(serviceId),
      status: true,
    },
  });

  // Fetch uploaded documents for this artisan and service
  const uploadedDocs = await prisma.requirementUpload.findMany({
    where: {
      artisanId: artisanProfile.id,
      serviceId: parseInt(serviceId),
    },
  });

  // Map requirements with upload status
  const mappedRequirements = requirements.map((req) => ({
    id: req.id,
    name: req.name,
    type: req.type,
    isUploaded: uploadedDocs.some(doc => doc.requirementId === req.id),
    upload: uploadedDocs.find(doc => doc.requirementId === req.id),
  }));

  // Calculate progress
  const requiredRequirements = requirements.filter(r => r.type === "MANDATORY");
  const optionalRequirements = requirements.filter(r => r.type === "OPTIONAL");
  
  const requiredCompleted = mappedRequirements.filter(
    r => r.type === "MANDATORY" && r.isUploaded
  ).length;
  const optionalCompleted = mappedRequirements.filter(
    r => r.type === "OPTIONAL" && r.isUploaded
  ).length;

  const progress = {
    total: requirements.length,
    uploaded: mappedRequirements.filter(r => r.isUploaded).length,
    requiredTotal: requiredRequirements.length,
    requiredCompleted,
    optionalTotal: optionalRequirements.length,
    optionalCompleted,
    percentage: requirements.length > 0 
      ? Math.round((mappedRequirements.filter(r => r.isUploaded).length / requirements.length) * 100)
      : 0,
    requiredPercentage: requiredRequirements.length > 0 
      ? Math.round((requiredCompleted / requiredRequirements.length) * 100)
      : 0,
  };

  // Fetch existing application
  const application = await prisma.application.findFirst({
    where: {
      artisanId: artisanProfile.id,
      serviceId: parseInt(serviceId),
    },
    orderBy: { createdAt: "desc" },
  });

  // User data - only what's needed for display
  const userData = {
    name: `${fullUser.firstName} ${fullUser.lastName}`,
    email: fullUser.email,
    phone: fullUser.phone,
  };

  // Artisan profile data - include id for API calls
  const artisanData = {
    id: artisanProfile.id,
    firstName: fullUser.firstName,
    lastName: fullUser.lastName,
    phone: fullUser.phone,
    yearsOfExperience: artisanProfile.yearsOfExperience || undefined,
    bio: artisanProfile.bio || undefined,
    state: artisanProfile.state ? { name: artisanProfile.state.name } : undefined,
    localGovernment: artisanProfile.localGovernment ? { name: artisanProfile.localGovernment.name } : undefined,
  };

  // Transform application data - convert null to undefined
  const transformedApplication = application ? {
    id: application.id,
    status: application.status,
    applicationNumber: application.applicationNumber,
    submittedAt: application.submittedAt || undefined,
  } : null;

  return (
    <RequirementsClient
      user={userData}
      artisanProfile={artisanData}
      service={transformedService}
      requirements={mappedRequirements}
      progress={progress}
      application={transformedApplication}
    />
  );
}