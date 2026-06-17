// app/api/artisan/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";

// Types
interface CartRequestBody {
  itemType: "CERTIFICATION_APPLICATION" | "COURSE_ENROLLMENT" | "CERTIFICATION_SERVICE";
  itemId: string;
  quantity?: number;
}

interface PutRequestBody {
  itemId: string;
  quantity: number;
}

// GET - Fetch user's cart
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { artisanId: user.id },
      include: {
        items: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: { artisanId: user.id },
        include: { items: true },
      });
    }

    // Enhance cart items with details
    const enhancedItems = await Promise.all(
      cart.items.map(async (item) => {
        let details = null;
        
        if (item.itemType === "CERTIFICATION_APPLICATION") {
          const application = await prisma.application.findUnique({
            where: { id: item.itemId },
            include: { 
              service: true,
              artisan: {
                include: { user: true }
              }
            },
          });
          if (application) {
            details = {
              id: application.id,
              name: `${application.service.name} Certification`,
              serviceName: application.service.name,
              type: "certification",
              applicationNumber: application.applicationNumber,
              status: application.status,
              completionScore: application.completionScore,
            };
          }
        } else if (item.itemType === "COURSE_ENROLLMENT") {
          // First check if this is a partner (training provider)
          const partner = await prisma.partnerProfile.findUnique({
            where: { id: item.itemId },
          });

          if (partner) {
            // This is a training partner
            details = {
              id: partner.id,
              name: `${partner.businessName} Training Program`,
              partnerName: partner.businessName,
              type: "partner_training",
              description: partner.description,
              logoUrl: partner.logoUrl,
              city: partner.city,
              state: partner.state,
            };
          } else {
            // This is a course
            const course = await prisma.course.findUnique({
              where: { id: item.itemId },
              include: { 
                primaryService: true, 
                partner: true,
              },
            });
            if (course) {
              details = {
                id: course.id,
                name: course.name,
                serviceName: course.primaryService.name,
                partnerName: course.partner.businessName,
                type: "course",
                duration: course.durationHours,
                deliveryMode: course.deliveryMode,
                startDate: course.startDate,
                thumbnailUrl: course.thumbnailUrl,
              };
            }
          }
        } else if (item.itemType === "CERTIFICATION_SERVICE") {
          // This is a certification service from a partner
          const partnerService = await prisma.partnerService.findUnique({
            where: { id: parseInt(item.itemId) },
            include: {
              partner: true,
              service: {
                include: {
                  industry: true,
                },
              },
            },
          });
          
          if (partnerService) {
            details = {
              id: partnerService.id,
              name: `${partnerService.service.name} Certification`,
              serviceName: partnerService.service.name,
              partnerName: partnerService.partner.businessName,
              partnerId: partnerService.partner.id,
              industryName: partnerService.service.industry?.name,
              type: "certification_service",
              fee: Number(item.unitPrice),
              description: partnerService.service.description,
              logoUrl: partnerService.partner.logoUrl,
            };
          }
        }
        
        return { 
          ...item, 
          details,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        };
      })
    );

    const subtotal = enhancedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = 0;
    const total = subtotal + tax;

    return NextResponse.json({
      success: true,
      cart: {
        id: cart.id,
        items: enhancedItems,
        subtotal,
        tax,
        total,
        itemCount: enhancedItems.length,
      },
    });
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use type assertion to fix the TypeScript error
    const body = (await request.json()) as CartRequestBody;
    const { itemType, itemId, quantity = 1 } = body;

    if (!itemType || !itemId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate item type - must match the enum values exactly
    let validItemType: "CERTIFICATION_APPLICATION" | "COURSE_ENROLLMENT" | "CERTIFICATION_SERVICE";
    
    if (itemType === "CERTIFICATION_APPLICATION") {
      validItemType = "CERTIFICATION_APPLICATION";
    } else if (itemType === "COURSE_ENROLLMENT") {
      validItemType = "COURSE_ENROLLMENT";
    } else if (itemType === "CERTIFICATION_SERVICE") {
      validItemType = "CERTIFICATION_SERVICE";
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid item type. Must be CERTIFICATION_APPLICATION, COURSE_ENROLLMENT, or CERTIFICATION_SERVICE" },
        { status: 400 }
      );
    }

    // Validate item and get price
    let unitPrice = 0;
    let metadata = {};

    if (validItemType === "CERTIFICATION_APPLICATION") {
      const application = await prisma.application.findUnique({
        where: { id: itemId },
        include: { 
          service: true, 
          artisan: true,
          applicationRequirements: {
            include: { requirement: true }
          }
        },
      });

      if (!application) {
        return NextResponse.json(
          { success: false, error: "Application not found" },
          { status: 404 }
        );
      }

      // Check if user owns this application
      const artisanProfile = await prisma.artisanProfile.findUnique({
        where: { userId: user.id },
      });

      if (application.artisanId !== artisanProfile?.id) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Check if application is in DRAFT status
      if (application.status !== "DRAFT") {
        return NextResponse.json(
          { success: false, error: "Application already submitted or processed" },
          { status: 400 }
        );
      }

      // Check if all mandatory requirements are met
      const mandatoryRequirements = application.applicationRequirements.filter(
        r => r.requirement.type === "MANDATORY"
      );
      const allMandatoryMet = mandatoryRequirements.every(r => r.isMet);

      if (!allMandatoryMet) {
        return NextResponse.json(
          { success: false, error: "Please complete all mandatory requirements before adding to cart" },
          { status: 400 }
        );
      }

      unitPrice = 5000;
      metadata = {
        applicationNumber: application.applicationNumber,
        serviceName: application.service.name,
        serviceId: application.serviceId,
        completionScore: application.completionScore,
        type: "certification",
      };
    } else if (validItemType === "COURSE_ENROLLMENT") {
      // First check if this is a partner (training provider)
      const partner = await prisma.partnerProfile.findUnique({
        where: { id: itemId },
        include: {
          partnerServices: {
            include: { service: true },
            take: 3,
          },
        },
      });

      if (partner) {
        if (partner.status !== "ACTIVE") {
          return NextResponse.json(
            { success: false, error: "Partner is not currently available" },
            { status: 400 }
          );
        }

        unitPrice = 5000;
        metadata = {
          partnerName: partner.businessName,
          partnerId: partner.id,
          type: "partner_training",
          description: partner.description,
          services: partner.partnerServices.map(ps => ps.service.name),
          city: partner.city,
          state: partner.state,
        };
      } else {
        const course = await prisma.course.findUnique({
          where: { id: itemId },
          include: { primaryService: true, partner: true },
        });

        if (!course) {
          return NextResponse.json(
            { success: false, error: "Course not found" },
            { status: 404 }
          );
        }

        if (course.status !== "PUBLISHED") {
          return NextResponse.json(
            { success: false, error: "Course is not available for enrollment" },
            { status: 400 }
          );
        }

        if (course.enrollmentDeadline && new Date(course.enrollmentDeadline) < new Date()) {
          return NextResponse.json(
            { success: false, error: "Enrollment deadline has passed" },
            { status: 400 }
          );
        }

        const existingEnrollment = await prisma.enrollment.findFirst({
          where: {
            courseId: itemId,
            artisanId: user.id,
          },
        });

        if (existingEnrollment) {
          return NextResponse.json(
            { success: false, error: "Already enrolled in this course" },
            { status: 400 }
          );
        }

        unitPrice = Number(course.cost);
        metadata = {
          courseName: course.name,
          courseCode: course.code,
          serviceName: course.primaryService.name,
          partnerName: course.partner.businessName,
          deliveryMode: course.deliveryMode,
          durationHours: course.durationHours,
          thumbnailUrl: course.thumbnailUrl,
          type: "course",
        };
      }
    } else if (validItemType === "CERTIFICATION_SERVICE") {
      const partnerService = await prisma.partnerService.findUnique({
        where: { id: parseInt(itemId) },
        include: {
          partner: true,
          service: {
            include: {
              industry: true,
            },
          },
        },
      });

      if (!partnerService) {
        return NextResponse.json(
          { success: false, error: "Certification service not found" },
          { status: 404 }
        );
      }

      if (partnerService.partner.status !== "ACTIVE") {
        return NextResponse.json(
          { success: false, error: "Certification partner is not available" },
          { status: 400 }
        );
      }

      if (!partnerService.status) {
        return NextResponse.json(
          { success: false, error: "Certification service is not available" },
          { status: 400 }
        );
      }

      unitPrice = 5000;
      metadata = {
        partnerServiceId: partnerService.id,
        partnerName: partnerService.partner.businessName,
        partnerId: partnerService.partner.id,
        serviceName: partnerService.service.name,
        serviceId: partnerService.serviceId,
        industryName: partnerService.service.industry?.name,
        type: "certification_service",
        description: partnerService.service.description,
      };
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { artisanId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { artisanId: user.id },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        itemType: validItemType,
        itemId: itemId,
        status: "ACTIVE",
      },
    });

    if (existingItem) {
      // Convert Decimal to number for calculation
      const existingUnitPrice = Number(existingItem.unitPrice);
      
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          totalPrice: (existingItem.quantity + quantity) * existingUnitPrice,
        },
      });
      return NextResponse.json({ 
        success: true, 
        item: {
          ...updatedItem,
          unitPrice: Number(updatedItem.unitPrice),
          totalPrice: Number(updatedItem.totalPrice),
        },
        message: "Item quantity updated in cart"
      });
    }

    // Add new item
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        itemType: validItemType,
        itemId: itemId,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
        metadata,
      },
    });

    return NextResponse.json({ 
      success: true, 
      item: {
        ...cartItem,
        unitPrice: Number(cartItem.unitPrice),
        totalPrice: Number(cartItem.totalPrice),
      },
      message: "Item added to cart successfully"
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use type assertion for PUT as well
    const body = (await request.json()) as PutRequestBody;
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { success: false, error: "Quantity cannot be negative" },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { artisanId: user.id },
        status: "ACTIVE",
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { status: "REMOVED" },
      });
      return NextResponse.json({ 
        success: true, 
        removed: true,
        message: "Item removed from cart"
      });
    }

    // Convert Decimal to number before multiplication
    const unitPrice = Number(cartItem.unitPrice);
    
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        totalPrice: quantity * unitPrice,
      },
    });

    return NextResponse.json({ 
      success: true, 
      item: {
        ...updatedItem,
        unitPrice: Number(updatedItem.unitPrice),
        totalPrice: Number(updatedItem.totalPrice),
      },
      message: "Cart updated successfully"
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Item ID required" },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { artisanId: user.id },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { status: "REMOVED" },
    });

    return NextResponse.json({ 
      success: true,
      message: "Item removed from cart"
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}

// PATCH - Clear entire cart
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findFirst({
      where: { artisanId: user.id },
    });

    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Cart not found" },
        { status: 404 }
      );
    }

    await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        status: "ACTIVE",
      },
      data: { status: "REMOVED" },
    });

    return NextResponse.json({ 
      success: true,
      message: "Cart cleared successfully"
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}