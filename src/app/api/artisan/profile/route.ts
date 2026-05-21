import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      gender,
      dateOfBirth,
      address,
      city,
      stateId,
      localGovernmentId,
      workingAddress,
      yearsOfExperience,
      bio,
      skills,
      artisanServices,
    } = body;

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        phone,
      },
    });

    // Update or create artisan profile
    const existingProfile = await prisma.artisanProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      await prisma.artisanProfile.update({
        where: { userId: user.id },
        data: {
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          city,
          stateId,
          localGovernmentId,
          workingAddress,
          yearsOfExperience,
          bio,
          skills,
        },
      });

      // Update artisan services
      await prisma.artisanService.deleteMany({
        where: { artisanId: existingProfile.id },
      });

      for (const service of artisanServices) {
        await prisma.artisanService.create({
          data: {
            artisanId: existingProfile.id,
            serviceId: service.serviceId,
            experience: service.experience,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}