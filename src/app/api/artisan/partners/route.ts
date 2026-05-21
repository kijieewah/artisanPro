import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { getCurrentUser } from "~/lib/auth1";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");

    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    const serviceIdNum = parseInt(serviceId);
    if (isNaN(serviceIdNum)) {
      return NextResponse.json(
        { error: "Invalid Service ID" },
        { status: 400 }
      );
    }

    // Get the service to find its industry
    const service = await prisma.service.findUnique({
      where: { id: serviceIdNum },
      include: { 
        industry: true,
        requirements: {
          where: { status: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Fetch training partners (partners that offer training - those with courses)
    // Since there's no partnerType field, we identify training partners by checking if they have courses
    const trainingPartners = await prisma.partnerProfile.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                partnerServices: {
                  some: {
                    serviceId: serviceIdNum,
                  },
                },
              },
              {
                partnerIndustries: {
                  some: {
                    industryId: service.industryId,
                  },
                },
              },
            ],
          },
          {
            status: "ACTIVE",
          },
          {
            // Partners that have at least one course (training providers)
            courses: {
              some: {
                status: "PUBLISHED",
              },
            },
          },
        ],
      },
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
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                industry: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        partnerIndustries: {
          include: {
            industry: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        courses: {
          where: {
            status: "PUBLISHED",
          },
          take: 3,
          select: {
            id: true,
            name: true,
            description: true,
            durationHours: true,
            cost: true,
            currency: true,
            deliveryMode: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch certification partners (partners that offer certification services)
    // These are partners that are active but may not have courses
    const certificationPartners = await prisma.partnerProfile.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                partnerServices: {
                  some: {
                    serviceId: serviceIdNum,
                  },
                },
              },
              {
                partnerIndustries: {
                  some: {
                    industryId: service.industryId,
                  },
                },
              },
            ],
          },
          {
            status: "ACTIVE",
          },
          {
            // Partners that have NO courses (potential certification bodies)
            // OR you can add a specific field for certification partners
            courses: {
              none: {},
            },
          },
        ],
      },
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
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                industry: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        partnerIndustries: {
          include: {
            industry: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform training partners data
    const formattedTrainingPartners = trainingPartners.map(partner => ({
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
      status: partner.status,
      hasCourses: partner.courses.length > 0,
      courses: partner.courses,
      partnerServices: partner.partnerServices.map(ps => ({
        service: {
          id: ps.service.id,
          name: ps.service.name,
          description: ps.service.description,
          industry: ps.service.industry,
        },
      })),
      partnerIndustries: partner.partnerIndustries.map(pi => ({
        industry: pi.industry,
      })),
    }));

    // Transform certification partners data
    const formattedCertificationPartners = certificationPartners.map(partner => ({
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
      status: partner.status,
      partnerServices: partner.partnerServices.map(ps => ({
        service: {
          id: ps.service.id,
          name: ps.service.name,
          description: ps.service.description,
          industry: ps.service.industry,
        },
      })),
      partnerIndustries: partner.partnerIndustries.map(pi => ({
        industry: pi.industry,
      })),
    }));

    return NextResponse.json({
      success: true,
      service: {
        id: service.id,
        name: service.name,
        industryId: service.industryId,
        industryName: service.industry?.name,
        requirements: service.requirements,
      },
      trainingPartners: formattedTrainingPartners,
      certificationPartners: formattedCertificationPartners,
      counts: {
        training: formattedTrainingPartners.length,
        certification: formattedCertificationPartners.length,
        total: formattedTrainingPartners.length + formattedCertificationPartners.length,
      },
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch partners",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}