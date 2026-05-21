// app/api/admin/partners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";

// GET - Fetch all partners with pagination and search
export async function GET(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin/super_admin
    // if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search ? {
      OR: [
        { businessName: { contains: search, mode: 'insensitive' } },
        { businessEmail: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ],
    } : {};

    const [partners, total] = await Promise.all([
      prisma.partnerProfile.findMany({
        where,
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.partnerProfile.count({ where }),
    ]);

    // Transform the data for easier consumption
    const formattedPartners = partners.map(partner => ({
      id: partner.id,
      userId: partner.userId,
      businessName: partner.businessName,
      registrationNumber: partner.registrationNumber,
      taxId: partner.taxId,
      businessEmail: partner.businessEmail,
      businessPhone: partner.businessPhone,
      website: partner.website,
      address: partner.address,
      city: partner.city,
      state: partner.state,
      country: partner.country,
      description: partner.description,
      logoUrl: partner.logoUrl,
      accreditationDocUrl: partner.accreditationDocUrl,
      status: partner.status,
      rejectionReason: partner.rejectionReason,
      approvedAt: partner.approvedAt,
      approvedBy: partner.approvedBy,
      commissionRate: partner.commissionRate,
      totalRevenue: partner.totalRevenue,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
      user: partner.user,
      industries: partner.partnerIndustries.map(pi => ({
        id: pi.industry.id,
        name: pi.industry.name,
        description: pi.industry.description,
      })),
      services: partner.partnerServices.map(ps => ({
        id: ps.service.id,
        name: ps.service.name,
        description: ps.service.description,
        industryId: ps.service.industryId,
        industry: ps.service.industry ? {
          id: ps.service.industry.id,
          name: ps.service.industry.name,
        } : null,
      })),
    }));

    return NextResponse.json({
      success: true,
      partners: formattedPartners,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

// PATCH - Update partner status (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin/super_admin
    // if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("id");
    const body = await request.json();
    const { status, rejectionReason } = body;

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID is required" },
        { status: 400 }
      );
    }

    // Update partner status
    const updatedPartner = await prisma.partnerProfile.update({
      where: { id: partnerId },
      data: {
        status: status,
        rejectionReason: rejectionReason || null,
        approvedAt: status === "ACTIVE" ? new Date() : null,
        approvedBy: status === "ACTIVE" ? "ADMIN" : null,
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
        partnerIndustries: {
          include: {
            industry: true,
          },
        },
        partnerServices: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      partner: updatedPartner,
      message: status === "ACTIVE" ? "Partner approved successfully" : "Partner rejected successfully",
    });
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update partner" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a partner
export async function DELETE(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin/super_admin
    // if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("id");

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID is required" },
        { status: 400 }
      );
    }

    // Delete partner (this will cascade delete related records)
    await prisma.partnerProfile.delete({
      where: { id: partnerId },
    });

    return NextResponse.json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete partner" },
      { status: 500 }
    );
  }
}