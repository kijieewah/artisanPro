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
  
  // Transform userServices - convert null to undefined
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
    cost: course.cost,
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
      partnerType: course.partner.partnerType || undefined,
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

  // Transform all courses using the helper function
  const transformedCourses = courses.map(transformCourse);
  const transformedRecommended = recommendedCourses.map(transformCourse);
  const transformedPopular = popularCourses.map(transformCourse);

  const userData = {
    id: fullUser.id,
    email: fullUser.email,
    phone: fullUser.phone || "",
    firstName: fullUser.firstName,
    lastName: fullUser.lastName,
    role: fullUser.role,
  };

  return (
    <TrainingClient
      user={userData}
      artisanProfile={artisanProfile}
      userServices={transformedUserServices}
      courses={transformedCourses}
      recommendedCourses={transformedRecommended}
      popularCourses={transformedPopular}
      allServices={transformedAllServices}
      industries={transformedIndustries}
    />
  );
}