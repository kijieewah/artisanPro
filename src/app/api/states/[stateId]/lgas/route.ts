// app/api/states/[stateId]/lgas/route.ts
import { NextResponse } from "next/server";
import { prisma } from "~/lib/db";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ stateId: string }> }
) {
  try {
    const { stateId } = await params;
    const stateIdNum = parseInt(stateId);
    
    const lgas = await prisma.localGovernment.findMany({
      where: {
        stateId: stateIdNum,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: lgas,
    });
  } catch (error) {
    console.error("Error fetching LGAs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch local governments" },
      { status: 500 }
    );
  }
}