// app/api/industries/[industryId]/services/route.ts
import { NextResponse } from "next/server";
import { prisma } from "~/lib/db";



export async function GET(
  request: Request,
  { params }: { params: Promise<{ industryId: string }> }
) {
  try {
    const { industryId } = await params;
    const industryIdNum = parseInt(industryId);
    
    const services = await prisma.service.findMany({
      where: {
        industryId: industryIdNum,
        status: true,
      },
      include: {
        requirements: {
          where: {
            status: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}