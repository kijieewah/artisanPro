import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { uploadImage } from "~/lib/upload-image";
import { hash } from "bcrypt";

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

interface IndustryServiceSelection {
  industryId: number;
  serviceIds: number[];
}

// Type guard for IndustryServiceSelection
function isValidIndustryServiceSelection(data: unknown): data is IndustryServiceSelection {
  if (typeof data !== 'object' || data === null) return false;
  
  const obj = data as Record<string, unknown>;
  
  if (typeof obj.industryId !== 'number') return false;
  if (!Array.isArray(obj.serviceIds)) return false;
  if (!obj.serviceIds.every((id: unknown) => typeof id === 'number')) return false;
  
  return true;
}

// Helper to safely parse JSON
function safeParseJSON<T>(jsonString: string, fallback: T): T {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    return fallback;
  }
}

// Helper to check if value is a File
function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

// GET handler for testing
export async function GET() {
  return NextResponse.json({
    status: "Partner Registration API is working",
    timestamp: new Date().toISOString(),
    methods: ["POST"]
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== Partner Registration Started ===");
    
    // Parse form data
    const formData = await request.formData();
    
    // Log form data keys for debugging
    const formKeys: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (isFile(value)) {
        formKeys.push(`${key}: File(${value.name}, ${value.size}bytes)`);
      } else {
        formKeys.push(`${key}: ${String(value).substring(0, 50)}`);
      }
    }
    console.log("Form fields received:", formKeys.join(", "));
    
    // Extract form fields
    const businessName = formData.get("businessName") as string;
    const registrationNumber = formData.get("registrationNumber") as string;
    const taxId = formData.get("taxId") as string || "";
    const businessEmail = formData.get("businessEmail") as string;
    const businessPhone = formData.get("businessPhone") as string;
    const website = formData.get("website") as string || "";
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const description = formData.get("description") as string || "";
    const partnerType = formData.get("partnerType") as string || "TRAINING_PROVIDER";
    const contactName = formData.get("contactName") as string;
    const contactPosition = formData.get("contactPosition") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const industriesJson = formData.get("industries") as string;
    
    const accreditationDoc = formData.get("accreditationDoc") as File | null;
    const logo = formData.get("logo") as File | null;
    
    // Validate required fields
    const requiredFields = {
      businessName,
      registrationNumber,
      businessEmail,
      businessPhone,
      address,
      city,
      state,
      contactName,
      contactPosition,
      contactEmail,
      contactPhone,
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === "")
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }
    
    // Validate file
    if (!accreditationDoc || !isFile(accreditationDoc)) {
      return NextResponse.json(
        { error: "Accreditation document is required" },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (accreditationDoc.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Accreditation document must be less than 5MB" },
        { status: 400 }
      );
    }
    
    // Parse industries
    let selectedIndustriesWithServices: IndustryServiceSelection[] = [];
    
    if (industriesJson) {
      const parsed = safeParseJSON<unknown>(industriesJson, null);
      if (Array.isArray(parsed)) {
        selectedIndustriesWithServices = parsed.filter(isValidIndustryServiceSelection);
        console.log(`Parsed ${selectedIndustriesWithServices.length} industry selections`);
      }
    }
    
    if (selectedIndustriesWithServices.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one industry" },
        { status: 400 }
      );
    }
    
    // Extract IDs
    const selectedIndustryIds = selectedIndustriesWithServices.map(item => item.industryId);
    const allSelectedServiceIds = selectedIndustriesWithServices.flatMap(item => item.serviceIds);
    
    console.log(`Processing ${selectedIndustryIds.length} industries, ${allSelectedServiceIds.length} services`);
    
    // Upload files
    let accreditationDocUrl = "";
    let logoUrl = "";
    
    try {
      // Upload accreditation
      console.log("Uploading accreditation document...");
      const accreditationResult = await uploadImage(accreditationDoc, "partners/accreditation");
      
      if (accreditationResult && accreditationResult.secure_url) {
        accreditationDocUrl = accreditationResult.secure_url;
        console.log("Accreditation uploaded successfully:", accreditationDocUrl);
      } else {
        throw new Error("Failed to upload accreditation document");
      }
      
      // Upload logo if provided
      if (logo && isFile(logo) && logo.size > 0) {
        console.log("Uploading logo...");
        const logoResult = await uploadImage(logo, "partners/logos");
        
        if (logoResult && logoResult.secure_url) {
          logoUrl = logoResult.secure_url;
          console.log("Logo uploaded successfully:", logoUrl);
        }
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { 
          error: "Failed to upload documents", 
          details: uploadError instanceof Error ? uploadError.message : "Unknown upload error"
        },
        { status: 500 }
      );
    }
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await hash(tempPassword, 10);
    
    // Create user and partner profile
    let partnerId: string;
    
    try {
      console.log("Creating database records...");
      
      // Check for existing user
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: businessEmail },
            { phone: businessPhone }
          ]
        }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: "A user with this email or phone already exists" },
          { status: 409 }
        );
      }
      
      // Create user with partner profile in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
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
                country: "Nigeria",
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
        
        const profileId = user.partnerProfile.id;
        
        // Create partner-industry associations
        if (selectedIndustryIds.length > 0) {
          await tx.partnerIndustry.createMany({
            data: selectedIndustryIds.map(industryId => ({
              partnerId: profileId,
              industryId: industryId,
            })),
            skipDuplicates: true,
          });
          console.log(`Created ${selectedIndustryIds.length} partner-industry associations`);
        }
        
        // Create partner-service associations
        if (allSelectedServiceIds.length > 0) {
          await tx.partnerService.createMany({
            data: allSelectedServiceIds.map(serviceId => ({
              partnerId: profileId,
              serviceId: serviceId,
              status: true,
            })),
            skipDuplicates: true,
          });
          console.log(`Created ${allSelectedServiceIds.length} partner-service associations`);
        } else {
          // No specific services - add all services from selected industries
          const allServicesInIndustries = await tx.service.findMany({
            where: {
              industryId: { in: selectedIndustryIds },
              status: true,
            },
            select: { id: true },
          });
          
          if (allServicesInIndustries.length > 0) {
            await tx.partnerService.createMany({
              data: allServicesInIndustries.map(service => ({
                partnerId: profileId,
                serviceId: service.id,
                status: true,
              })),
              skipDuplicates: true,
            });
            console.log(`Created ${allServicesInIndustries.length} service associations from industries`);
          }
        }
        
        return { partnerId: profileId, userId: user.id };
      });
      
      partnerId = result.partnerId;
      console.log(`Partner registration successful with ID: ${partnerId}`);
      
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { 
          error: "Database error", 
          details: dbError instanceof Error ? dbError.message : "Unknown database error"
        },
        { status: 500 }
      );
    }
    
    // TODO: Send welcome email
    
    return NextResponse.json({
      success: true,
      message: "Partner application submitted successfully",
      partnerId: partnerId,
    });
    
  } catch (error) {
    console.error("Partner registration error:", error);
    return NextResponse.json(
      { 
        error: "Failed to submit partner application",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}