// app/api/partners/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { uploadImage } from "~/lib/upload-image";
import { hash } from "bcrypt";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

interface IndustryServiceSelection {
  industryId: number;
  serviceIds: number[];
}

// Type guard function to validate IndustryServiceSelection
function isValidIndustryServiceSelection(data: unknown): data is IndustryServiceSelection {
  if (typeof data !== 'object' || data === null) return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.industryId === 'number' &&
    Array.isArray(obj.serviceIds) &&
    obj.serviceIds.every((id: unknown) => typeof id === 'number')
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const businessName = formData.get("businessName") as string;
    const registrationNumber = formData.get("registrationNumber") as string;
    const taxId = formData.get("taxId") as string;
    const businessEmail = formData.get("businessEmail") as string;
    const businessPhone = formData.get("businessPhone") as string;
    const website = formData.get("website") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const description = formData.get("description") as string;
    const partnerType = formData.get("partnerType") as string;
    const contactName = formData.get("contactName") as string;
    const contactPosition = formData.get("contactPosition") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const industriesJson = formData.get("industries") as string;
    
    const accreditationDoc = formData.get("accreditationDoc") as File;
    const logo = formData.get("logo") as File;
    
    // Parse industries with their services - with proper type checking using type guard
    let selectedIndustriesWithServices: IndustryServiceSelection[] = [];
    
    if (industriesJson) {
      try {
        const parsed = JSON.parse(industriesJson);
        if (Array.isArray(parsed)) {
          // Filter and validate each item using the type guard
          selectedIndustriesWithServices = parsed.filter(isValidIndustryServiceSelection);
        }
      } catch (error) {
        console.error("Failed to parse industries JSON:", error);
        selectedIndustriesWithServices = [];
      }
    }
    
    // Extract unique industry IDs
    const selectedIndustryIds = selectedIndustriesWithServices.map(item => item.industryId);
    // Extract all service IDs
    const allSelectedServiceIds = selectedIndustriesWithServices.flatMap(item => item.serviceIds);
    
    // Validate required fields
    if (!businessName || !registrationNumber || !businessEmail || !businessPhone || 
        !address || !city || !state || !contactName || !contactPosition || 
        !contactEmail || !contactPhone || !accreditationDoc) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    if (selectedIndustryIds.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one industry" },
        { status: 400 }
      );
    }
    
    // Upload files to Cloudinary
    let accreditationDocUrl = "";
    let logoUrl = "";
    
    try {
      // Upload accreditation document
      const accreditationResult = await uploadImage(accreditationDoc, "partners/accreditation");
      if (accreditationResult) {
        accreditationDocUrl = accreditationResult.secure_url;
      }
      
      // Upload logo if provided
      if (logo && logo.size > 0) {
        const logoResult = await uploadImage(logo, "partners/logos");
        if (logoResult) {
          logoUrl = logoResult.secure_url;
        }
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload documents. Please try again." },
        { status: 500 }
      );
    }
    
    // Generate a temporary password for the partner user
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await hash(tempPassword, 10);
    
    // Create user account for partner with partner profile
    const user = await prisma.user.create({
      data: {
        email: businessEmail,
        phone: businessPhone,
        passwordHash: hashedPassword,
        firstName: contactName.split(" ")[0],
        lastName: contactName.split(" ").slice(1).join(" ") || "Partner",
        role: "PARTNER",
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false,
        partnerProfile: {
          create: {
            businessName,
            registrationNumber,
            taxId: taxId || null,
            businessEmail,
            businessPhone,
            website: website || null,
            address,
            city,
            state,
            description: description || null,
            logoUrl: logoUrl || null,
            accreditationDocUrl,
            status: "PENDING_VERIFICATION",
            commissionRate: 10.0,
          },
        },
      },
      include: {
        partnerProfile: true,
      },
    });
    
    if (!user.partnerProfile) {
      throw new Error("Failed to create partner profile");
    }
    
    const partnerId = user.partnerProfile.id;
    
    // Create partner-industry associations
    if (selectedIndustryIds.length > 0) {
      await prisma.partnerIndustry.createMany({
        data: selectedIndustryIds.map(industryId => ({
          partnerId: partnerId,
          industryId: industryId,
        })),
        skipDuplicates: true,
      });
    }
    
    // Create partner-service associations
    if (allSelectedServiceIds.length > 0) {
      // User selected specific services
      await prisma.partnerService.createMany({
        data: allSelectedServiceIds.map(serviceId => ({
          partnerId: partnerId,
          serviceId: serviceId,
        })),
        skipDuplicates: true,
      });
    } else {
      // No specific services selected - add all services from selected industries
      const allServicesInIndustries = await prisma.service.findMany({
        where: {
          industryId: { in: selectedIndustryIds },
          status: true,
        },
        select: { id: true },
      });
      
      if (allServicesInIndustries.length > 0) {
        await prisma.partnerService.createMany({
          data: allServicesInIndustries.map(service => ({
            partnerId: partnerId,
            serviceId: service.id,
          })),
          skipDuplicates: true,
        });
      }
    }
    
    // TODO: Send email to partner with login credentials
    // await sendPartnerWelcomeEmail(businessEmail, tempPassword);
    
    return NextResponse.json({
      success: true,
      message: "Partner application submitted successfully",
      partnerId: partnerId,
    });
  } catch (error) {
    console.error("Partner registration error:", error);
    return NextResponse.json(
      { error: "Failed to submit partner application: " + (error as Error).message },
      { status: 500 }
    );
  }
}