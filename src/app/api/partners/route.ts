// app/api/artisan/partners/route.ts
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

    // Get the service to find its industry
    const service = await prisma.service.findUnique({
      where: { id: serviceIdNum },
      include: { industry: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Fetch all active partners related to this service or industry
    const partners = await prisma.partnerProfile.findMany({
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
        ],
      },
      include: {
        partnerServices: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If you need to differentiate between training and certification partners,
    // you can filter by business name patterns
    const trainingPartners = partners.filter(partner => 
      !partner.businessName.toLowerCase().includes("certification") &&
      !partner.businessName.toLowerCase().includes("accreditation") &&
      !partner.businessName.toLowerCase().includes("board") &&
      !partner.businessName.toLowerCase().includes("council")
    );
    
    const certificationPartners = partners.filter(partner =>
      partner.businessName.toLowerCase().includes("certification") ||
      partner.businessName.toLowerCase().includes("accreditation") ||
      partner.businessName.toLowerCase().includes("board") ||
      partner.businessName.toLowerCase().includes("council")
    );

    return NextResponse.json({
      success: true,
      trainingPartners,
      certificationPartners,
      allPartners: partners,
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}