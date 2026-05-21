// app/api/artisan/apply-certification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Type assertion for the body
    const { artisanId, serviceId, status = "SUBMITTED" } = body as {
      artisanId?: string | number;
      serviceId?: number;
      status?: string;
    };

    if (!artisanId || !serviceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert artisanId to string if it's a number (or keep as is)
    const artisanIdStr = artisanId.toString();

    // Verify the artisan belongs to the user
    const artisanProfile = await prisma.artisanProfile.findFirst({
      where: {
        id: artisanIdStr, // Now this matches Prisma's expected string type
        userId: user.id,
      },
    });

    if (!artisanProfile) {
      return NextResponse.json({ error: "Artisan profile not found" }, { status: 404 });
    }

    // Check if all required documents are uploaded (only for SUBMITTED status)
    if (status === "SUBMITTED") {
      const requirements = await prisma.requirement.findMany({
        where: {
          serviceId: serviceId,
          status: true,
        },
      });

      const requiredRequirementIds = requirements
        .filter(r => r.type === "MANDATORY")
        .map(r => r.id);

      const uploadedDocs = await prisma.requirementUpload.findMany({
        where: {
          artisanId: artisanIdStr,
          serviceId: serviceId,
          requirementId: { in: requiredRequirementIds },
        },
      });

      const missingRequirements = requiredRequirementIds.filter(
        id => !uploadedDocs.some(doc => doc.requirementId === id)
      );

      if (missingRequirements.length > 0) {
        return NextResponse.json(
          { error: "Please upload all required documents before applying" },
          { status: 400 }
        );
      }
    }

    // Check if an application already exists and is not rejected/expired
    const existingApplication = await prisma.application.findFirst({
      where: {
        artisanId: artisanIdStr,
        serviceId: serviceId,
        status: { notIn: ["REJECTED", "EXPIRED"] },
      },
    });

    // If application exists and is DRAFT, return it
    if (existingApplication && existingApplication.status === "DRAFT") {
      return NextResponse.json({
        success: true,
        application: {
          id: existingApplication.id,
          applicationNumber: existingApplication.applicationNumber,
          status: existingApplication.status,
        },
      });
    }

    // If application exists and is not DRAFT, return error
    if (existingApplication && existingApplication.status !== "DRAFT") {
      return NextResponse.json(
        { error: "You already have an active application" },
        { status: 400 }
      );
    }

    // Generate application number
    const applicationNumber = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the application
    const application = await prisma.application.create({
      data: {
        applicationNumber,
        artisanId: artisanIdStr,
        serviceId: serviceId,
        status: status === "SUBMITTED" ? "SUBMITTED" : "DRAFT",
        completionScore: 0,
        paymentStatus: status === "SUBMITTED" ? "PENDING" : "PENDING",
        submittedAt: status === "SUBMITTED" ? new Date() : null,
      },
    });

    // If status is SUBMITTED, create application requirements records
    if (status === "SUBMITTED") {
      const requirements = await prisma.requirement.findMany({
        where: {
          serviceId: serviceId,
          status: true,
        },
      });

      const uploadedDocs = await prisma.requirementUpload.findMany({
        where: {
          artisanId: artisanIdStr,
          serviceId: serviceId,
        },
      });

      for (const req of requirements) {
        const upload = uploadedDocs.find(doc => doc.requirementId === req.id);
        
        await prisma.applicationRequirement.create({
          data: {
            applicationId: application.id,
            requirementId: req.id,
            isMet: !!upload,
            uploadId: upload?.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        applicationNumber: application.applicationNumber,
        status: application.status,
      },
    });
  } catch (error) {
    console.error("Apply certification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}