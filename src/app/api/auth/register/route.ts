// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "~/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract basic user info
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const genderInput = formData.get("gender") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const role = formData.get("role") as string;
    
    // Location info
    const stateId = formData.get("stateId") as string;
    const lgaId = formData.get("lgaId") as string;
    const address = formData.get("address") as string;
    const postalCode = formData.get("postalCode") as string;
    
    // Professional info
    const serviceId = formData.get("serviceId") as string;
    const yearsOfExperience = formData.get("yearsOfExperience") as string;
    const bio = formData.get("bio") as string;
    const skillsRaw = formData.get("skills") as string;

    // Map gender to enum values
    const genderMap: Record<string, "MALE" | "FEMALE" | "OTHER"> = {
      "Male": "MALE",
      "Female": "FEMALE",
      "Other": "OTHER",
    };
    
    const gender = genderMap[genderInput];

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !gender || !role) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: phone },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Parse skills with proper type assertion
    let skillsArray: string[] = [];
    if (skillsRaw) {
      try {
        const parsed = JSON.parse(skillsRaw);
        // Ensure parsed is an array of strings
        if (Array.isArray(parsed)) {
          skillsArray = parsed.filter((item): item is string => typeof item === 'string');
        } else {
          skillsArray = [];
        }
      } catch {
        skillsArray = [];
      }
    }

    // Parse years of experience - ensure it's a reasonable number (0-50)
    let experienceYears = 0;
    if (yearsOfExperience) {
      experienceYears = parseInt(yearsOfExperience);
      if (isNaN(experienceYears)) experienceYears = 0;
      if (experienceYears > 50) experienceYears = 50; // Cap at 50 years
    }

    // Create user and artisan profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          phone,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          role: role as "ARTISAN",
          isActive: true,
        },
      });

      // Create artisan profile
      const artisanProfile = await tx.artisanProfile.create({
        data: {
          userId: user.id,
          gender: gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address: address || null,
          stateId: stateId ? parseInt(stateId) : null,
          localGovernmentId: lgaId ? parseInt(lgaId) : null,
          workingAddress: address || null,
          yearsOfExperience: experienceYears,
          bio: bio || null,
          skills: skillsArray,
          verificationStatus: "PENDING",
          permitStatus: "PENDING",
          approvalStatus: "PENDING",
        },
      });

      // Create artisan service association
      if (serviceId) {
        await tx.artisanService.create({
          data: {
            artisanId: artisanProfile.id,
            serviceId: parseInt(serviceId),
            experience: experienceYears,
          },
        });

        // Create application for certification
        const applicationNumber = `APP-${Date.now()}-${user.id.slice(0, 8)}`;
        
        const application = await tx.application.create({
          data: {
            artisanId: artisanProfile.id,
            serviceId: parseInt(serviceId),
            applicationNumber,
            status: "DRAFT",
            completionScore: 0,
          },
        });

        // Get all requirements for this service and create application requirements
        const requirements = await tx.requirement.findMany({
          where: {
            serviceId: parseInt(serviceId),
            status: true,
          },
        });

        for (const requirement of requirements) {
          await tx.applicationRequirement.create({
            data: {
              applicationId: application.id,
              requirementId: requirement.id,
              isMet: false,
            },
          });
        }
      }

      return { user, artisanProfile };
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: result.user.id,
        email: result.user.email,
        name: `${result.user.firstName} ${result.user.lastName}`,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 }
    );
  }
}