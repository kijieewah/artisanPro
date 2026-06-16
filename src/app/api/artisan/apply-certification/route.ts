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
    
    const { artisanId, serviceId, addToCart = true } = body as {
      artisanId?: string | number;
      serviceId?: number;
      addToCart?: boolean;
    };

    if (!artisanId || !serviceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert artisanId to string
    const artisanIdStr = artisanId.toString();

    // Verify the artisan belongs to the user
    const artisanProfile = await prisma.artisanProfile.findFirst({
      where: {
        id: artisanIdStr,
        userId: user.id,
      },
    });

    if (!artisanProfile) {
      return NextResponse.json({ error: "Artisan profile not found" }, { status: 404 });
    }

    // Check if all required documents are uploaded
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

    // Check if an application already exists
    let application = await prisma.application.findFirst({
      where: {
        artisanId: artisanIdStr,
        serviceId: serviceId,
        status: { notIn: ["REJECTED", "EXPIRED", "APPROVED"] },
      },
    });

    // If application exists and is DRAFT, update it
    if (application && application.status === "DRAFT") {
      // Update the application with the latest documents
      await prisma.application.update({
        where: { id: application.id },
        data: {
          updatedAt: new Date(),
        },
      });

      // Update or create application requirements
      for (const req of requirements) {
        const upload = uploadedDocs.find(doc => doc.requirementId === req.id);
        const existingReq = await prisma.applicationRequirement.findFirst({
          where: {
            applicationId: application.id,
            requirementId: req.id,
          },
        });

        if (existingReq) {
          await prisma.applicationRequirement.update({
            where: { id: existingReq.id },
            data: {
              isMet: !!upload,
              uploadId: upload?.id,
            },
          });
        } else {
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
    } 
    // If no application exists, create one
    else if (!application) {
      // Generate application number
      const applicationNumber = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create the application
      application = await prisma.application.create({
        data: {
          applicationNumber,
          artisanId: artisanIdStr,
          serviceId: serviceId,
          status: "DRAFT",
          completionScore: 100, // All requirements are met
          paymentStatus: "PENDING",
        },
      });

      // Create application requirements records
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
    // If application exists but is not in editable state
    else if (application && application.status !== "DRAFT") {
      return NextResponse.json(
        { error: `Cannot modify application in ${application.status} status` },
        { status: 400 }
      );
    }

    // Calculate completion score
    const allRequirements = await prisma.applicationRequirement.findMany({
      where: { applicationId: application!.id },
    });
    const completedReqs = allRequirements.filter(r => r.isMet).length;
    const completionScore = allRequirements.length > 0 
      ? Math.round((completedReqs / allRequirements.length) * 100)
      : 0;

    await prisma.application.update({
      where: { id: application!.id },
      data: { completionScore },
    });

    // Add to cart if requested
    let cartItem = null;
    if (addToCart) {
      // Check if already in cart
      const cart = await prisma.cart.findUnique({
        where: { artisanId: user.id },
        include: {
          items: {
            where: {
              itemType: "CERTIFICATION_APPLICATION",
              itemId: application!.id,
              status: "ACTIVE",
            },
          },
        },
      });

      let cartId = cart?.id;
      
      if (!cart) {
        const newCart = await prisma.cart.create({
          data: { artisanId: user.id },
        });
        cartId = newCart.id;
      }

      const existingCartItem = cart?.items?.[0];

      if (!existingCartItem) {
        // Get service details for metadata
        const service = await prisma.service.findUnique({
          where: { id: serviceId },
          select: { name: true },
        });

        cartItem = await prisma.cartItem.create({
          data: {
            cartId: cartId!,
            itemType: "CERTIFICATION_APPLICATION",
            itemId: application!.id,
            quantity: 1,
            unitPrice: 5000, // Certification fee
            totalPrice: 5000,
            metadata: {
              serviceName: service?.name,
              applicationNumber: application!.applicationNumber,
            },
          },
        });
      } else {
        cartItem = existingCartItem;
      }
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application!.id,
        applicationNumber: application!.applicationNumber,
        status: application!.status,
        completionScore,
      },
      cartItem: cartItem ? {
        id: cartItem.id,
        inCart: true,
      } : null,
      message: addToCart 
        ? "Application ready! Added to cart. Proceed to checkout when ready."
        : "Application created successfully!",
    });
  } catch (error) {
    console.error("Apply certification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}