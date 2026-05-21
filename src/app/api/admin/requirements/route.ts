// app/api/admin/requirements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";

// GET - Fetch all requirements with pagination and search
export async function GET(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user || session.user.role !== "ADMIN") {
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
        { name: { contains: search, mode: 'insensitive' } },
        { service: { name: { contains: search, mode: 'insensitive' } } },
      ],
    } : {};

    // Get requirements with count
    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
        where,
        include: {
          service: {
            include: {
              industry: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.requirement.count({ where }),
    ]);

    return NextResponse.json({ 
      requirements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}

// POST - Create a new requirement
export async function POST(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    const { serviceId, name, type, status } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Requirement name is required" },
        { status: 400 }
      );
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const requirement = await prisma.requirement.create({
      data: {
        serviceId,
        name,
        type: type || "MANDATORY",
        status: status !== undefined ? status : true,
      },
      include: {
        service: {
          include: {
            industry: true,
          },
        },
      },
    });

    return NextResponse.json({ requirement }, { status: 201 });
  } catch (error) {
    console.error("Error creating requirement:", error);
    return NextResponse.json(
      { error: "Failed to create requirement" },
      { status: 500 }
    );
  }
}

// PUT - Update a requirement
export async function PUT(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Requirement ID is required" },
        { status: 400 }
      );
    }

    const { serviceId, name, type, status } = body;

    const requirement = await prisma.requirement.update({
      where: { id: parseInt(id) },
      data: {
        serviceId: serviceId || undefined,
        name: name || undefined,
        type: type || undefined,
        status: status !== undefined ? status : undefined,
      },
      include: {
        service: {
          include: {
            industry: true,
          },
        },
      },
    });

    return NextResponse.json({ requirement });
  } catch (error) {
    console.error("Error updating requirement:", error);
    return NextResponse.json(
      { error: "Failed to update requirement" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a requirement
export async function DELETE(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Requirement ID is required" },
        { status: 400 }
      );
    }

    await prisma.requirement.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting requirement:", error);
    return NextResponse.json(
      { error: "Failed to delete requirement" },
      { status: 500 }
    );
  }
}