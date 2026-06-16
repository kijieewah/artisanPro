// app/dashboard/training/page.tsx
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";
import { redirect } from "next/navigation";
import TrainingClient from "./page.client";

export default async function TrainingPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/auth/sign-in");
  }

  // Fetch full user details
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!fullUser) {
    redirect("/auth/sign-in");
  }

  // Fetch user with artisan profile
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

  if (!userWithProfile || !userWithProfile.artisanProfile) {
    redirect("/dashboard/profile");
  }

  const artisanProfile = userWithProfile.artisanProfile;
  
  // Transform user services - convert null to undefined
  const userServicesRaw = artisanProfile.artisanServices.map((as) => as.service);
  const transformedUserServices = userServicesRaw.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description || undefined,
    status: service.status,
    industryId: service.industryId,
    image: service.image || undefined,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    industry: {
      id: service.industry.id,
      name: service.industry.name,
      description: service.industry.description || undefined,
      status: service.industry.status,
    },
  }));

  const serviceIds = transformedUserServices.map((s) => s.id);

  // Fetch available courses based on artisan's services
  let courses: any[] = [];
  let recommendedCourses: any[] = [];
  let popularCourses: any[] = [];

  if (serviceIds.length > 0) {
    courses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        enrollmentDeadline: { gt: new Date() },
        OR: [
          { primaryServiceId: { in: serviceIds } },
          {
            courseServices: {
              some: {
                serviceId: { in: serviceIds },
              },
            },
          },
        ],
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
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const primaryServiceId = serviceIds[0];
    if (primaryServiceId) {
      recommendedCourses = await prisma.course.findMany({
        where: {
          status: "PUBLISHED",
          primaryServiceId: primaryServiceId,
          enrollmentDeadline: { gt: new Date() },
        },
        include: {
          partner: true,
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
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: { enrollmentDeadline: "asc" },
        take: 6,
      });
    }

    popularCourses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        enrollmentDeadline: { gt: new Date() },
      },
      include: {
        partner: true,
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
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 6,
    });
  } else {
    courses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        enrollmentDeadline: { gt: new Date() },
      },
      include: {
        partner: true,
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
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Fetch recommended training partners
  let recommendedPartners: any[] = [];
  if (serviceIds.length > 0) {
    recommendedPartners = await prisma.partnerProfile.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          {
            partnerServices: {
              some: {
                serviceId: { in: serviceIds },
              },
            },
          },
          {
            partnerIndustries: {
              some: {
                industryId: { in: transformedUserServices.map(s => s.industryId) },
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
              include: {
                industry: true,
              },
            },
          },
          take: 3,
        },
        partnerIndustries: {
          include: {
            industry: true,
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
            durationHours: true,
          },
        },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    });
  } else {
    recommendedPartners = await prisma.partnerProfile.findMany({
      where: {
        status: "ACTIVE",
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
          take: 3,
        },
        partnerIndustries: {
          include: {
            industry: true,
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
            durationHours: true,
          },
        },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    });
  }

  // Fetch all services for filtering with industry relation
  const allServicesRaw = await prisma.service.findMany({
    where: { status: true },
    include: {
      industry: true,
    },
    orderBy: { name: "asc" },
  });

  // Transform allServices for client - convert null to undefined
  const transformedAllServices = allServicesRaw.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description || undefined,
    status: service.status,
    industryId: service.industryId,
    image: service.image || undefined,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    industry: {
      id: service.industry.id,
      name: service.industry.name,
      description: service.industry.description || undefined,
      status: service.industry.status,
    },
  }));

  // Fetch all industries for filtering with proper relations
  const industriesRaw = await prisma.industries.findMany({
    where: { status: true },
    include: {
      services: {
        include: {
          industry: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Transform industries for client - convert null to undefined
  const transformedIndustries = industriesRaw.map((industry) => ({
    id: industry.id,
    name: industry.name,
    description: industry.description || undefined,
    status: industry.status,
    createdAt: industry.createdAt,
    updatedAt: industry.updatedAt,
    services: industry.services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description || undefined,
      status: service.status,
      industryId: service.industryId,
      image: service.image || undefined,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      industry: {
        id: industry.id,
        name: industry.name,
        description: industry.description || undefined,
        status: industry.status,
      },
    })),
  }));

  // Helper function to transform course data - convert null to undefined
  const transformCourse = (course: any) => ({
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description,
    syllabus: course.syllabus || undefined,
    durationHours: course.durationHours,
    durationDays: course.durationDays || undefined,
    cost: Number(course.cost),
    currency: course.currency,
    deliveryMode: course.deliveryMode,
    startDate: course.startDate || undefined,
    endDate: course.endDate || undefined,
    enrollmentDeadline: course.enrollmentDeadline || undefined,
    maxStudents: course.maxStudents || undefined,
    currentEnrollment: course.currentEnrollment,
    thumbnailUrl: course.thumbnailUrl || undefined,
    rating: course.rating ? Number(course.rating) : undefined,
    reviewCount: course.reviewCount,
    partner: {
      id: course.partner.id,
      businessName: course.partner.businessName,
      logoUrl: course.partner.logoUrl || undefined,
    },
    primaryService: {
      id: course.primaryService.id,
      name: course.primaryService.name,
      industryName: course.primaryService.industry?.name || undefined,
    },
    otherServices: (course.courseServices || []).map((cs: any) => ({
      id: cs.service.id,
      name: cs.service.name,
      industryName: cs.service.industry?.name || undefined,
    })),
    enrollmentCount: course._count?.enrollments || 0,
  });

  // Transform partners data
  const transformPartner = (partner: any) => ({
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
    rating: partner.courses.reduce((acc: number, c: any) => acc + Number(c.rating || 0), 0) / (partner.courses.length || 1),
    totalCourses: partner.courses.length,
    services: partner.partnerServices.map((ps: any) => ({
      id: ps.service.id,
      name: ps.service.name,
      industryName: ps.service.industry?.name,
    })),
    industries: partner.partnerIndustries.map((pi: any) => ({
      id: pi.industry.id,
      name: pi.industry.name,
    })),
    courses: partner.courses.map((course: any) => ({
      id: course.id,
      name: course.name,
      cost: Number(course.cost),
      rating: course.rating ? Number(course.rating) : 0,
      durationHours: course.durationHours,
    })),
  });

  // Transform all courses using the helper function
  const transformedCourses = courses.map(transformCourse);
  const transformedRecommended = recommendedCourses.map(transformCourse);
  const transformedPopular = popularCourses.map(transformCourse);
  const transformedPartners = recommendedPartners.map(transformPartner);

  const userData = {
    id: fullUser.id,
    email: fullUser.email,
    phone: fullUser.phone || "",
    firstName: fullUser.firstName,
    lastName: fullUser.lastName,
    role: fullUser.role,
    name: `${fullUser.firstName} ${fullUser.lastName}`,
  };

  return (
    <TrainingClient
      user={userData}
      artisanProfile={artisanProfile}
      userServices={transformedUserServices}
      courses={transformedCourses}
      recommendedCourses={transformedRecommended}
      popularCourses={transformedPopular}
      recommendedPartners={transformedPartners}
      allServices={transformedAllServices}
      industries={transformedIndustries}
    />
  );
}