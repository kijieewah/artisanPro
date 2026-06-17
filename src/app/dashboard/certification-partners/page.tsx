// app/dashboard/certification-partners/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import CertificationPartnersClient from "./page.client";

// Define types
interface PartnerService {
  id: number;
  serviceId: number;
  service: {
    id: number;
    name: string;
    description: string | null;
    industry: {
      id: number;
      name: string;
    } | null;
  };
}

interface PartnerIndustry {
  id: number;
  industry: {
    id: number;
    name: string;
  };
}

interface PartnerWithServices {
  id: string;
  businessName: string;
  businessEmail: string | null;
  businessPhone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  logoUrl: string | null;
  partnerServices: PartnerService[];
  partnerIndustries: PartnerIndustry[];
}

// Define Industry type with services
interface Industry {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  services: Array<{
    id: number;
    name: string;
    description: string | null;
    status: boolean;
  }>;
}

export default async function CertificationPartnersPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  // Fetch user with full profile including name fields
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
    },
  });

  if (!userWithProfile) {
    redirect("/auth/sign-in");
  }

  const userServices = userWithProfile?.artisanProfile?.artisanServices.map(
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
  let recommendedPartners: PartnerWithServices[] = [];
  if (certificationPartners.length < 3 && userIndustryIds.length > 0) {
    const recommended = await prisma.partnerProfile.findMany({
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
    recommendedPartners = recommended as PartnerWithServices[];
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

  // Transform partners with proper typing
  const transformedPartners = certificationPartners.map((partner: PartnerWithServices) => ({
    id: partner.id,
    businessName: partner.businessName,
    businessEmail: partner.businessEmail || "",
    businessPhone: partner.businessPhone || "",
    website: partner.website,
    address: partner.address || "",
    city: partner.city || "",
    state: partner.state || "",
    description: partner.description,
    logoUrl: partner.logoUrl,
    rating: 4.5,
    isRecommended: false,
    matchType: partner.partnerServices.some((ps: PartnerService) => userServiceIds.includes(ps.serviceId)) 
      ? "service" 
      : "industry",
    certificationServices: partner.partnerServices.map((ps: PartnerService) => ({
      id: ps.id,
      serviceId: ps.serviceId,
      serviceName: ps.service.name,
      industryName: ps.service.industry?.name || "",
      description: ps.service.description,
      fee: 5000,
    })),
    industries: partner.partnerIndustries.map((pi: PartnerIndustry) => ({
      id: pi.industry.id,
      name: pi.industry.name,
    })),
  }));

  const transformedRecommended = recommendedPartners.map((partner: PartnerWithServices) => ({
    id: partner.id,
    businessName: partner.businessName,
    businessEmail: partner.businessEmail || "",
    businessPhone: partner.businessPhone || "",
    website: partner.website,
    address: partner.address || "",
    city: partner.city || "",
    state: partner.state || "",
    description: partner.description,
    logoUrl: partner.logoUrl,
    rating: 4.5,
    isRecommended: true,
    matchType: "industry",
    certificationServices: partner.partnerServices.map((ps: PartnerService) => ({
      id: ps.id,
      serviceId: ps.serviceId,
      serviceName: ps.service.name,
      industryName: ps.service.industry?.name || "",
      description: ps.service.description,
      fee: 5000,
    })),
    industries: partner.partnerIndustries.map((pi: PartnerIndustry) => ({
      id: pi.industry.id,
      name: pi.industry.name,
    })),
  }));

  // Get user data from the fetched profile
  const userData = {
    id: userWithProfile.id,
    firstName: userWithProfile.firstName || "",
    lastName: userWithProfile.lastName || "",
    email: userWithProfile.email || "",
    name: `${userWithProfile.firstName || ""} ${userWithProfile.lastName || ""}`.trim(),
  };

  // Get unique industries from user services with services array
  const userIndustriesMap = new Map<number, Industry>();
  userServices.forEach(service => {
    const industry = service.industry;
    if (!userIndustriesMap.has(industry.id)) {
      userIndustriesMap.set(industry.id, {
        id: industry.id,
        name: industry.name,
        description: industry.description,
        status: industry.status,
        createdAt: industry.createdAt,
        updatedAt: industry.updatedAt,
        services: [],
      });
    }
    // Add this service to the industry's services
    const existingIndustry = userIndustriesMap.get(industry.id)!;
    if (!existingIndustry.services.find(s => s.id === service.id)) {
      existingIndustry.services.push({
        id: service.id,
        name: service.name,
        description: service.description,
        status: service.status,
      });
    }
  });
  
  const userIndustries = Array.from(userIndustriesMap.values());

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