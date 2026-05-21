// app/api/admin/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { z } from "zod";

// Define validation schemas
const createServiceSchema = z.object({
  industryId: z.number().min(1, "Industry ID is required"),
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional().default(""),
  image: z.string().optional().default(""),
  status: z.boolean().optional().default(true),
});

const updateServiceSchema = z.object({
  industryId: z.number().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  status: z.boolean().optional(),
});

// GET - Fetch all services with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { industry: { name: { contains: search, mode: 'insensitive' } } },
      ],
    } : {};

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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

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
    
    // Validate with Zod
    const validation = createServiceSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { industryId, name, description, image, status } = validation.data;

    // Verify industry exists
    const industry = await prisma.industries.findUnique({
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
        status,
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

    // Validate with Zod
    const validation = updateServiceSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Only update if there's data to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: updateData,
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