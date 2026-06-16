// app/api/partners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industryId = searchParams.get("industryId");
    const serviceId = searchParams.get("serviceId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build where clause
    let whereClause: any = {
      status: "ACTIVE",
    };

    if (serviceId) {
      whereClause = {
        ...whereClause,
        OR: [
          {
            partnerServices: {
              some: {
                serviceId: parseInt(serviceId),
              },
            },
          },
          {
            courses: {
              some: {
                primaryServiceId: parseInt(serviceId),
                status: "PUBLISHED",
              },
            },
          },
        ],
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
    }

    // Fetch partners
    const partners = await prisma.partnerProfile.findMany({
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
          take: 3,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            description: true,
            cost: true,
            durationHours: true,
            deliveryMode: true,
            thumbnailUrl: true,
            rating: true,
          },
        },
        _count: {
          select: {
            courses: true,
            partnerServices: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    });

    // Get total count for pagination
    const total = await prisma.partnerProfile.count({
      where: whereClause,
    });

    // Transform partner data
    const transformedPartners = partners.map((partner) => ({
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
      commissionRate: partner.commissionRate,
      totalRevenue: partner.totalRevenue,
      createdAt: partner.createdAt,
      services: partner.partnerServices.map((ps) => ({
        id: ps.service.id,
        name: ps.service.name,
        description: ps.service.description,
        industry: {
          id: ps.service.industry.id,
          name: ps.service.industry.name,
        },
      })),
      industries: partner.partnerIndustries.map((pi) => ({
        id: pi.industry.id,
        name: pi.industry.name,
        description: pi.industry.description,
      })),
      courses: partner.courses.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description,
        cost: Number(course.cost),
        durationHours: course.durationHours,
        deliveryMode: course.deliveryMode,
        thumbnailUrl: course.thumbnailUrl,
        rating: course.rating ? Number(course.rating) : 0,
      })),
      stats: {
        totalCourses: partner._count.courses,
        totalServices: partner._count.partnerServices,
      },
    }));

    // Get featured partners (those with highest rated courses)
    const featuredPartners = await prisma.partnerProfile.findMany({
      where: {
        status: "ACTIVE",
        courses: {
          some: {
            status: "PUBLISHED",
            rating: { gte: 4 },
          },
        },
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
              include: {
                industry: true,
              },
            },
          },
          take: 2,
        },
        courses: {
          where: {
            status: "PUBLISHED",
          },
          take: 2,
          orderBy: { rating: "desc" },
          select: {
            id: true,
            name: true,
            cost: true,
            rating: true,
            thumbnailUrl: true,
          },
        },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    const transformedFeatured = featuredPartners.map((partner) => ({
      id: partner.id,
      businessName: partner.businessName,
      logoUrl: partner.logoUrl,
      description: partner.description,
      rating: partner.courses.reduce((acc, c) => acc + Number(c.rating || 0), 0) / (partner.courses.length || 1),
      totalCourses: partner.courses.length,
      topServices: partner.partnerServices.slice(0, 2).map(ps => ps.service.name),
    }));

    return NextResponse.json({
      success: true,
      partners: transformedPartners,
      featured: transformedFeatured,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}