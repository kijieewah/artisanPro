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
  const userServices = artisanProfile.artisanServices.map((as) => as.service);

  // Fetch available courses based on artisan's services
  let courses: any[] = [];
  let recommendedCourses: any[] = [];
  let popularCourses: any[] = [];

  if (userServices.length > 0) {
    const serviceIds = userServices.map((s) => s.id);
    
    // Fetch courses matching artisan's services
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

    // Get recommended courses (based on primary service)
    const primaryServiceId = userServices[0]?.id;
    if (primaryServiceId) {
      recommendedCourses = await prisma.course.findMany({
        where: {
          status: "PUBLISHED",
          primaryServiceId: primaryServiceId,
          enrollmentDeadline: { gt: new Date() },
        },
        include: {
          partner: {
            include: {
              user: {
                select: {
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
        orderBy: { enrollmentDeadline: "asc" },
        take: 6,
      });
    }

    // Get popular courses (most enrolled)
    popularCourses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        enrollmentDeadline: { gt: new Date() },
      },
      include: {
        partner: {
          include: {
            user: {
              select: {
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
      orderBy: { enrollments: { _count: "desc" } },
      take: 6,
    });
  } else {
    // If no services selected, show all published courses
    courses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        enrollmentDeadline: { gt: new Date() },
      },
      include: {
        partner: {
          include: {
            user: {
              select: {
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
  }

  // Fetch all services for filtering
  const allServices = await prisma.service.findMany({
    where: { status: true },
    include: {
      industry: true,
    },
    orderBy: { name: "asc" },
  });

  // Fetch all industries for filtering
  const industries = await prisma.industry.findMany({
    where: { status: true },
    include: {
      services: true,
    },
    orderBy: { name: "asc" },
  });

  // Transform courses for client
  const transformedCourses = courses.map((course) => ({
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description,
    syllabus: course.syllabus,
    durationHours: course.durationHours,
    durationDays: course.durationDays,
    cost: course.cost,
    currency: course.currency,
    deliveryMode: course.deliveryMode,
    startDate: course.startDate,
    endDate: course.endDate,
    enrollmentDeadline: course.enrollmentDeadline,
    maxStudents: course.maxStudents,
    currentEnrollment: course.currentEnrollment,
    thumbnailUrl: course.thumbnailUrl,
    rating: course.rating,
    reviewCount: course.reviewCount,
    partner: {
      id: course.partner.id,
      businessName: course.partner.businessName,
      logoUrl: course.partner.logoUrl,
      partnerType: course.partner.partnerType,
    },
    primaryService: {
      id: course.primaryService.id,
      name: course.primaryService.name,
      industryName: course.primaryService.industry?.name,
    },
    otherServices: course.courseServices.map((cs: any) => ({
      id: cs.service.id,
      name: cs.service.name,
      industryName: cs.service.industry?.name,
    })),
    enrollmentCount: course._count?.enrollments || 0,
  }));

  const transformedRecommended = recommendedCourses.map((course) => ({
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description,
    durationHours: course.durationHours,
    durationDays: course.durationDays,
    cost: course.cost,
    currency: course.currency,
    deliveryMode: course.deliveryMode,
    startDate: course.startDate,
    enrollmentDeadline: course.enrollmentDeadline,
    thumbnailUrl: course.thumbnailUrl,
    rating: course.rating,
    reviewCount: course.reviewCount,
    partner: {
      id: course.partner.id,
      businessName: course.partner.businessName,
      logoUrl: course.partner.logoUrl,
    },
    primaryService: {
      id: course.primaryService.id,
      name: course.primaryService.name,
    },
    enrollmentCount: course._count?.enrollments || 0,
  }));

  const transformedPopular = popularCourses.map((course) => ({
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description,
    durationHours: course.durationHours,
    durationDays: course.durationDays,
    cost: course.cost,
    currency: course.currency,
    deliveryMode: course.deliveryMode,
    startDate: course.startDate,
    enrollmentDeadline: course.enrollmentDeadline,
    thumbnailUrl: course.thumbnailUrl,
    rating: course.rating,
    reviewCount: course.reviewCount,
    partner: {
      id: course.partner.id,
      businessName: course.partner.businessName,
      logoUrl: course.partner.logoUrl,
    },
    primaryService: {
      id: course.primaryService.id,
      name: course.primaryService.name,
    },
    enrollmentCount: course._count?.enrollments || 0,
  }));

  const userData = {
    id: userWithProfile.id,
    email: userWithProfile.email,
    phone: userWithProfile.phone || "",
    firstName: userWithProfile.firstName,
    lastName: userWithProfile.lastName,
    role: userWithProfile.role,
  };

  return (
    <TrainingClient
      user={userData}
      artisanProfile={artisanProfile}
      userServices={userServices}
      courses={transformedCourses}
      recommendedCourses={transformedRecommended}
      popularCourses={transformedPopular}
      allServices={allServices}
      industries={industries}
    />
  );
}