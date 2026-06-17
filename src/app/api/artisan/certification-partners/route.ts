// app/api/artisan/certification-partners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";

// Define types
interface PartnerServiceWithDetails {
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
  partnerServices: PartnerServiceWithDetails[];
  partnerIndustries: PartnerIndustry[];
  courses?: any[];
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const industryId = searchParams.get("industryId");

    // First, get the artisan's services and industries
    const artisanProfile = await prisma.artisanProfile.findUnique({
      where: { userId: user.id },
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
    });

    const userServiceIds = artisanProfile?.artisanServices.map(as => as.serviceId) || [];
    const userIndustryIds = [...new Set(artisanProfile?.artisanServices.map(as => as.service.industryId) || [])];

    // Build where clause for certification partners
    let whereClause: any = {
      status: "ACTIVE",
      partnerServices: {
        some: {
          status: true,
        },
      },
    };

    // If specific service/industry filters are provided, use them
    if (serviceId) {
      whereClause = {
        ...whereClause,
        partnerServices: {
          some: {
            serviceId: parseInt(serviceId),
            status: true,
          },
        },
      };
    } else if (industryId) {
      whereClause = {
        ...whereClause,
        partnerIndustries: {
          some: {
            industryId: parseInt(industryId),
          },
        },
      };
    } else {
      // Filter based on artisan's services and industries
      whereClause = {
        ...whereClause,
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
      };
    }

    const certificationPartners = await prisma.partnerProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
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
          where: {
            status: "PUBLISHED",
          },
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

    // Also fetch recommended partners based on similar industries (fallback)
    let recommendedPartners: PartnerWithServices[] = [];
    if (certificationPartners.length === 0 && userIndustryIds.length > 0) {
      const recommended = await prisma.partnerProfile.findMany({
        where: {
          status: "ACTIVE",
          partnerIndustries: {
            some: {
              industryId: { in: userIndustryIds },
            },
          },
          partnerServices: {
            some: {
              status: true,
            },
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

    // Transform partners with proper typing
    const transformedPartners = certificationPartners.map((partner: PartnerWithServices) => ({
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
      certificationServices: partner.partnerServices.map((ps: PartnerServiceWithDetails) => ({
        id: ps.id,
        serviceId: ps.serviceId,
        serviceName: ps.service.name,
        industryName: ps.service.industry?.name || null,
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
      certificationServices: partner.partnerServices.map((ps: PartnerServiceWithDetails) => ({
        id: ps.id,
        serviceId: ps.serviceId,
        serviceName: ps.service.name,
        industryName: ps.service.industry?.name || null,
        description: ps.service.description,
        fee: 5000,
      })),
      industries: partner.partnerIndustries.map((pi: PartnerIndustry) => ({
        id: pi.industry.id,
        name: pi.industry.name,
      })),
    }));

    return NextResponse.json({
      success: true,
      partners: transformedPartners,
      recommendedPartners: transformedRecommended,
      userServices: artisanProfile?.artisanServices.map(as => ({
        id: as.service.id,
        name: as.service.name,
        industryId: as.service.industryId,
        industryName: as.service.industry?.name,
      })) || [],
    });
  } catch (error) {
    console.error("Error fetching certification partners:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certification partners" },
      { status: 500 }
    );
  }
}