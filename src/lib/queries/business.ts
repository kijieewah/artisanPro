import { prisma } from "~/lib/db";

// Assuming 'bussines_name' is a unique field in your Prisma schema.
export async function getBusinessByName(businessName: string) {
  try {
    const data = await prisma.bussiness.findUnique({
      where: { link_name: businessName },
      select: {
        // Explicitly select all required fields
        id: true,
        createdAt: true,
        updatedAt: true,
        bussines_name: true,
        link_name: true,
        bussinesId: true,
        address: true,
        aboutBusiness: true,
        type: true,
        whatsapp: true,
        link: true,
        logo: true,
        userId: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching business by name:", error);
    return null;
  }
}

export async function getBusinessWhatsapp(businessName: string) {
  try {
    const data = await prisma.bussiness.findUnique({
      where: { link_name: businessName },
      select: {
        // Explicitly select all required fields

        whatsapp: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching business by name:", error);
    return null;
  }
}
export async function getBusinessUser(businessId: string) {
  try {
    const data = await prisma.bussiness.findUnique({
      where: { bussinesId: businessId },
      include: {
        user: {
          select: {
            phone: true, // Selects only the phone field from the related user
          },
        },
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching business by name:", error);
    return null;
  }
}
