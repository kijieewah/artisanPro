// app/api/admin/industries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";

// GET - Fetch all industries with pagination and search
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
        { description: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    // Get industries with count
    const [industries, total] = await Promise.all([
      prisma.industry.findMany({
        where,
        include: {
          services: {
            include: {
              requirements: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.industry.count({ where }),
    ]);

    // Add _count to each industry for display
    const industriesWithCount = industries.map(industry => ({
      ...industry,
      _count: {
        services: industry.services.length,
      },
    }));

    return NextResponse.json({ 
      industries: industriesWithCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching industries:", error);
    return NextResponse.json(
      { error: "Failed to fetch industries" },
      { status: 500 }
    );
  }
}

// POST - Create a new industry
export async function POST(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    const { name, description, status } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Industry name is required" },
        { status: 400 }
      );
    }

    const industry = await prisma.industry.create({
      data: {
        name,
        description: description || "",
        status: status !== undefined ? status : true,
      },
    });

    return NextResponse.json({ industry }, { status: 201 });
  } catch (error) {
    console.error("Error creating industry:", error);
    return NextResponse.json(
      { error: "Failed to create industry" },
      { status: 500 }
    );
  }
}

// PUT - Update an industry
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
        { error: "Industry ID is required" },
        { status: 400 }
      );
    }

    const { name, description, status } = body;

    const industry = await prisma.industry.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? status : undefined,
      },
    });

    return NextResponse.json({ industry });
  } catch (error) {
    console.error("Error updating industry:", error);
    return NextResponse.json(
      { error: "Failed to update industry" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an industry
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
        { error: "Industry ID is required" },
        { status: 400 }
      );
    }

    // Check if industry has services
    const services = await prisma.service.findMany({
      where: { industryId: parseInt(id) },
    });

    if (services.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete industry with existing services. Delete services first." },
        { status: 400 }
      );
    }

    await prisma.industry.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting industry:", error);
    return NextResponse.json(
      { error: "Failed to delete industry" },
      { status: 500 }
    );
  }
}