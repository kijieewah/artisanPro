// app/api/admin/services/route.ts (UPDATED)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";

// GET - Fetch all services with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { industry: { name: { contains: search, mode: 'insensitive' } } },
      ],
    } : {};

    // Get services with count
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          industry: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
            },
          },
          requirements: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    // Add _count to each service for display
    const servicesWithCount = services.map(service => ({
      ...service,
      _count: {
        requirements: service.requirements.length,
      },
    }));

    return NextResponse.json({ 
      services: servicesWithCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST - Create a new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industryId, name, description, image, status } = body;

    if (!industryId) {
      return NextResponse.json(
        { error: "Industry ID is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Service name is required" },
        { status: 400 }
      );
    }

    // Verify industry exists
    const industry = await prisma.industry.findUnique({
      where: { id: industryId },
    });

    if (!industry) {
      return NextResponse.json(
        { error: "Industry not found" },
        { status: 404 }
      );
    }

    const service = await prisma.service.create({
      data: {
        industryId,
        name,
        description: description || "",
        image: image || "",
        status: status !== undefined ? status : true,
      },
      include: {
        industry: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

// PUT - Update a service
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    const { industryId, name, description, image, status } = body;

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        industryId: industryId || undefined,
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        image: image !== undefined ? image : undefined,
        status: status !== undefined ? status : undefined,
      },
      include: {
        industry: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Check if service has requirements
    const requirements = await prisma.requirement.findMany({
      where: { serviceId: parseInt(id) },
    });

    if (requirements.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete service with existing requirements. Delete requirements first." },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}