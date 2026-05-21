// app/api/admin/artisans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";

// GET - Fetch all artisans with pagination and search
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
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
        { sanaaId: search ? { equals: parseInt(search) || undefined } : undefined },
      ],
    } : {};

    // Get artisans with user data
    const [artisans, total] = await Promise.all([
      prisma.artisanProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.artisanProfile.count({ where }),
    ]);

    // Format the data
    const formattedArtisans = artisans.map(artisan => ({
      id: artisan.id,
      userId: artisan.userId,
      sanaaId: artisan.sanaaId,
      gender: artisan.gender,
      dateOfBirth: artisan.dateOfBirth,
      address: artisan.address,
      yearsOfExperience: artisan.yearsOfExperience,
      bio: artisan.bio,
      skills: artisan.skills,
      verificationStatus: artisan.verificationStatus,
      permitStatus: artisan.permitStatus,
      approvalStatus: artisan.approvalStatus,
      completionScore: artisan.completionScore,
      isProfileComplete: artisan.isProfileComplete,
      onDuty: artisan.onDuty,
      createdAt: artisan.createdAt,
      updatedAt: artisan.updatedAt,
      user: artisan.user,
    }));

    return NextResponse.json({ 
      artisans: formattedArtisans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching artisans:", error);
    return NextResponse.json(
      { error: "Failed to fetch artisans" },
      { status: 500 }
    );
  }
}

// PATCH - Update artisan status or details
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    const { verificationStatus, permitStatus, approvalStatus, onDuty } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Artisan ID is required" },
        { status: 400 }
      );
    }

    const artisan = await prisma.artisanProfile.update({
      where: { id: id },
      data: {
        verificationStatus: verificationStatus || undefined,
        permitStatus: permitStatus || undefined,
        approvalStatus: approvalStatus || undefined,
        onDuty: onDuty !== undefined ? onDuty : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      artisan,
      message: "Artisan updated successfully",
    });
  } catch (error) {
    console.error("Error updating artisan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update artisan" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an artisan
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Artisan ID is required" },
        { status: 400 }
      );
    }

    // First, get the user ID associated with this artisan
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id: id },
      select: { userId: true },
    });

    if (!artisan) {
      return NextResponse.json(
        { error: "Artisan not found" },
        { status: 404 }
      );
    }

    // Delete the artisan profile first
    await prisma.artisanProfile.delete({
      where: { id: id },
    });

    // Optionally, also delete the user account
    // await prisma.user.delete({
    //   where: { id: artisan.userId },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting artisan:", error);
    return NextResponse.json(
      { error: "Failed to delete artisan" },
      { status: 500 }
    );
  }
}