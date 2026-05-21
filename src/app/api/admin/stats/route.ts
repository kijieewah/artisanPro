// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";

// GET - Fetch admin dashboard statistics
export async function GET() {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const [
      totalUsers,
      totalArtisans,
      totalPartners,
      totalIndustries,
      totalServices,
      totalRequirements,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.artisanProfile.count(),
      prisma.partnerProfile.count(),
      prisma.industry.count(),
      prisma.service.count(),
      prisma.requirement.count(),
    ]);

    // Calculate pending verifications from artisan profiles
    const pendingVerifications = await prisma.artisanProfile.count({
      where: {
        OR: [
          { verificationStatus: "PENDING" },
          { permitStatus: "PENDING" },
          { approvalStatus: "PENDING" },
        ],
      },
    });

    return NextResponse.json({
      totalUsers,
      totalArtisans,
      totalPartners,
      totalBusinesses: totalPartners, // Partners are businesses
      totalProducts: 0, // No product model in schema
      pendingVerifications,
      totalIndustries,
      totalServices,
      totalRequirements,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}