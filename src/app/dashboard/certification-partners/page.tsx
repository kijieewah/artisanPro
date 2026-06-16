// app/dashboard/certification-partners/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import CertificationPartnersClient from "./page.client";

export default async function CertificationPartnersPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  // Fetch user's services and industries
  const userWithServices = await prisma.user.findUnique({
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
    },
  });

  const userServices = userWithServices?.artisanProfile?.artisanServices.map(
    (as) => as.service
  ) || [];

  const userServiceIds = userServices.map(s => s.id);
  const userIndustryIds = [...new Set(userServices.map(s => s.industryId))];

  // Fetch certification partners based on artisan's services and industries
  let certificationPartners = await prisma.partnerProfile.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        {
          partnerServices: {
            some: {
              serviceId: { in: userServiceIds },
              status: true,
            },
          },
        },
        {
          partnerIndustries: {
            some: {
              industryId: { in: userIndustryIds },
            },
          },
        },
      ],
    },
    include: {
      partnerServices: {
        where: { status: true },
        include: {
          service: {
            include: {
              industry: true,
            },
          },
        },
      },
      partnerIndustries: {
        include: {
          industry: true,
        },
      },
      courses: {
        where: { status: "PUBLISHED" },
        take: 2,
        select: {
          id: true,
          name: true,
          cost: true,
          durationHours: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch recommended partners from same industries (if not many matches)
  let recommendedPartners: any[] = [];
  if (certificationPartners.length < 3 && userIndustryIds.length > 0) {
    recommendedPartners = await prisma.partnerProfile.findMany({
      where: {
        status: "ACTIVE",
        partnerIndustries: {
          some: {
            industryId: { in: userIndustryIds },
          },
        },
        NOT: {
          id: { in: certificationPartners.map(p => p.id) },
        },
      },
      include: {
        partnerServices: {
          where: { status: true },
          include: {
            service: {
              include: {
                industry: true,
              },
            },
          },
        },
        partnerIndustries: {
          include: {
            industry: true,
          },
        },
      },
      take: 4,
    });
  }

  // Fetch all industries for filtering
  const industries = await prisma.industries.findMany({
    where: { status: true },
    include: {
      services: {
        where: { status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Fetch all services for filtering
  const allServices = await prisma.service.findMany({
    where: { status: true },
    include: {
      industry: true,
    },
    orderBy: { name: "asc" },
  });

  const transformedPartners = certificationPartners.map((partner) => ({
    id: partner.id,
    businessName: partner.businessName,
    businessEmail: partner.businessEmail,
    businessPhone: partner.businessPhone,
    website: partner.website,
    address: partner.address,
    city: partner.city,
    state: partner.state,
    description: partner.description,
    logoUrl: partner.logoUrl,
    rating: 4.5,
    isRecommended: false,
    matchType: partner.partnerServices.some(ps => userServiceIds.includes(ps.serviceId)) 
      ? "service" 
      : "industry",
    certificationServices: partner.partnerServices.map((ps) => ({
      id: ps.id,
      serviceId: ps.serviceId,
      serviceName: ps.service.name,
      industryName: ps.service.industry?.name,
      description: ps.service.description,
      fee: 5000,
    })),
    industries: partner.partnerIndustries.map((pi) => ({
      id: pi.industry.id,
      name: pi.industry.name,
    })),
  }));

  const transformedRecommended = recommendedPartners.map((partner) => ({
    id: partner.id,
    businessName: partner.businessName,
    businessEmail: partner.businessEmail,
    businessPhone: partner.businessPhone,
    website: partner.website,
    address: partner.address,
    city: partner.city,
    state: partner.state,
    description: partner.description,
    logoUrl: partner.logoUrl,
    rating: 4.5,
    isRecommended: true,
    matchType: "industry",
    certificationServices: partner.partnerServices.map((ps) => ({
      id: ps.id,
      serviceId: ps.serviceId,
      serviceName: ps.service.name,
      industryName: ps.service.industry?.name,
      description: ps.service.description,
      fee: 5000,
    })),
    industries: partner.partnerIndustries.map((pi) => ({
      id: pi.industry.id,
      name: pi.industry.name,
    })),
  }));

  const userData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
  };

  // Get unique industries from user services for display
  const userIndustries = [...new Map(
    userServices.map(service => [service.industry.id, service.industry])
  ).values()];

  return (
    <CertificationPartnersClient
      user={userData}
      partners={transformedPartners}
      recommendedPartners={transformedRecommended}
      userServices={userServices}
      userIndustries={userIndustries}
      industries={industries}
      allServices={allServices}
    />
  );
}