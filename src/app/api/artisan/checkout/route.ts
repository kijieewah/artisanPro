// app/api/artisan/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get cart with active items
    const cart = await prisma.cart.findFirst({
      where: { artisanId: user.id },
      include: {
        items: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
    const tax = 0;
    const total = subtotal + tax;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        artisanId: user.id,
        cartId: cart.id,
        subtotal,
        tax,
        total,
        status: "PENDING_PAYMENT",
        invoiceNumber,
        orderItems: {
          create: cart.items.map(item => ({
            itemType: item.itemType,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            metadata: item.metadata,
          })),
        },
      },
    });

    // Create invoice
    await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        artisanId: user.id,
        artisanName: `${user.firstName} ${user.lastName}`,
        artisanEmail: user.email,
        artisanPhone: user.phone || "",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        subtotal,
        tax,
        total,
        paymentStatus: "UNPAID",
      },
    });

    // **FIX: Clear the cart items after successful checkout**
    await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        status: "ACTIVE",
      },
      data: { status: "REMOVED" },
    });

    // Return order info to redirect to dashboard payment page
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
      },
      redirectUrl: `/dashboard/payment?orderId=${order.id}&amount=${total}`,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Checkout failed" 
      },
      { status: 500 }
    );
  }
}