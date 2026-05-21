import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const session = await getServerSession(authOptions);
    
    // if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { id } = await params;

    const partner = await prisma.partnerProfile.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            isActive: true,
            createdAt: true,
          },
        },
        partnerIndustries: {
          include: {
            industry: true,
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
      },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    // Transform the data
    const formattedPartner = {
      ...partner,
      industries: partner.partnerIndustries.map(pi => pi.industry),
      services: partner.partnerServices.map(ps => ({
        ...ps.service,
        industry: ps.service.industry,
      })),
    };

    return NextResponse.json({
      success: true,
      partner: formattedPartner,
    });
  } catch (error) {
    console.error("Error fetching partner:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch partner" },
      { status: 500 }
    );
  }
}