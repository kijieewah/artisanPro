// app/api/artisan/profile/route.ts
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
    
    // Type assertion for the body
    const {
      firstName,
      lastName,
      phone,
      gender,
      dateOfBirth,
      address,
      stateId,
      localGovernmentId,
      workingAddress,
      yearsOfExperience,
      bio,
      skills,
      artisanServices,
    } = body as {
      firstName?: string;
      lastName?: string;
      phone?: string;
      gender?: string;
      dateOfBirth?: string;
      address?: string;
      stateId?: number;
      localGovernmentId?: number;
      workingAddress?: string;
      yearsOfExperience?: number;
      bio?: string;
      skills?: string[];
      artisanServices?: Array<{ serviceId: number; experience?: number | string }>;
    };

    // Update user
    if (firstName || lastName || phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone || undefined,
        },
      });
    }

    // Update or create artisan profile
    const existingProfile = await prisma.artisanProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      // Build update data dynamically
      const profileUpdateData: any = {};
      if (gender !== undefined) profileUpdateData.gender = gender;
      if (dateOfBirth !== undefined) profileUpdateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      if (address !== undefined) profileUpdateData.address = address;
      if (stateId !== undefined) profileUpdateData.stateId = stateId;
      if (localGovernmentId !== undefined) profileUpdateData.localGovernmentId = localGovernmentId;
      if (workingAddress !== undefined) profileUpdateData.workingAddress = workingAddress;
      if (yearsOfExperience !== undefined) profileUpdateData.yearsOfExperience = yearsOfExperience;
      if (bio !== undefined) profileUpdateData.bio = bio;
      if (skills !== undefined) profileUpdateData.skills = skills;

      if (Object.keys(profileUpdateData).length > 0) {
        await prisma.artisanProfile.update({
          where: { userId: user.id },
          data: profileUpdateData,
        });
      }

      // Update artisan services if provided
      if (artisanServices && artisanServices.length > 0) {
        // Delete existing services
        await prisma.artisanService.deleteMany({
          where: { artisanId: existingProfile.id },
        });

        // Create new services
        for (const service of artisanServices) {
          if (service.serviceId) {
            // Convert experience to number if it's a string
            let experienceValue: number | null = null;
            if (service.experience !== undefined && service.experience !== null) {
              experienceValue = typeof service.experience === 'string' 
                ? parseInt(service.experience) 
                : service.experience;
              if (isNaN(experienceValue)) {
                experienceValue = null;
              }
            }
            
            await prisma.artisanService.create({
              data: {
                artisanId: existingProfile.id,
                serviceId: service.serviceId,
                experience: experienceValue,
              },
            });
          }
        }
      }
    } else {
      // Create new profile if it doesn't exist
      const profileData: any = {
        userId: user.id,
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address || null,
        stateId: stateId || null,
        localGovernmentId: localGovernmentId || null,
        workingAddress: workingAddress || null,
        yearsOfExperience: yearsOfExperience || null,
        bio: bio || null,
        skills: skills || [],
        verificationStatus: "PENDING",
        permitStatus: "PENDING",
        approvalStatus: "PENDING",
        completionScore: 0,
        isProfileComplete: false,
      };

      const newProfile = await prisma.artisanProfile.create({
        data: profileData,
      });

      // Create artisan services if provided
      if (artisanServices && artisanServices.length > 0) {
        for (const service of artisanServices) {
          if (service.serviceId) {
            // Convert experience to number if it's a string
            let experienceValue: number | null = null;
            if (service.experience !== undefined && service.experience !== null) {
              experienceValue = typeof service.experience === 'string' 
                ? parseInt(service.experience) 
                : service.experience;
              if (isNaN(experienceValue)) {
                experienceValue = null;
              }
            }
            
            await prisma.artisanService.create({
              data: {
                artisanId: newProfile.id,
                serviceId: service.serviceId,
                experience: experienceValue,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET - Fetch artisan profile
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with artisan profile
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        artisanProfile: {
          include: {
            artisanServices: {
              include: {
                service: {
                  include: {
                    industry: true,
                    requirements: true,
                  },
                },
              },
            },
            state: true,
            localGovernment: true,
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = userData.artisanProfile;

    // Build response object with only fields that exist
    const responseData = {
      success: true,
      profile: {
        id: profile?.id || null,
        userId: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        gender: profile?.gender || null,
        dateOfBirth: profile?.dateOfBirth || null,
        address: profile?.address || null,
        stateId: profile?.stateId || null,
        stateName: profile?.state?.name || null,
        localGovernmentId: profile?.localGovernmentId || null,
        localGovernmentName: profile?.localGovernment?.name || null,
        workingAddress: profile?.workingAddress || null,
        yearsOfExperience: profile?.yearsOfExperience || null,
        bio: profile?.bio || null,
        skills: profile?.skills || [],
        verificationStatus: profile?.verificationStatus || "PENDING",
        permitStatus: profile?.permitStatus || "PENDING",
        approvalStatus: profile?.approvalStatus || "PENDING",
        completionScore: profile?.completionScore || 0,
        isProfileComplete: profile?.isProfileComplete || false,
        onDuty: profile?.onDuty || false,
        sanaaId: profile?.sanaaId || null,
        artisanServices: profile?.artisanServices?.map(as => ({
          serviceId: as.serviceId,
          serviceName: as.service.name,
          serviceDescription: as.service.description,
          industryId: as.service.industryId,
          industryName: as.service.industry?.name,
          experience: as.experience,
          requirements: as.service.requirements,
        })) || [],
        createdAt: profile?.createdAt,
        updatedAt: profile?.updatedAt,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}