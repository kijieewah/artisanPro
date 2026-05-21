// app/api/admin/requirements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { z } from "zod";

// Define validation schemas
const createRequirementSchema = z.object({
  serviceId: z.number().min(1, "Service ID is required"),
  name: z.string().min(1, "Requirement name is required"),
  type: z.enum(["MANDATORY", "OPTIONAL"]).optional().default("MANDATORY"),
  status: z.boolean().optional().default(true),
});

const updateRequirementSchema = z.object({
  serviceId: z.number().optional(),
  name: z.string().optional(),
  type: z.enum(["MANDATORY", "OPTIONAL"]).optional(),
  status: z.boolean().optional(),
});

// GET - Fetch all requirements with pagination and search
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
        { service: { name: { contains: search, mode: 'insensitive' } } },
      ],
    } : {};

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
        orderBy: { createdAt: "desc" },
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
    const body = await request.json();
    
    // Validate with Zod
    const validation = createRequirementSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { serviceId, name, type, status } = validation.data;

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
        type,
        status,
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Requirement ID is required" },
        { status: 400 }
      );
    }

    // Validate with Zod
    const validation = updateRequirementSchema.safeParse(body);
    
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

    const requirement = await prisma.requirement.update({
      where: { id: parseInt(id) },
      data: updateData,
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