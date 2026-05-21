// app/api/industries/route.ts
import { NextResponse } from "next/server";
import { prisma } from "~/lib/db";

export async function GET() {
  try {
    const industries = await prisma.industries.findMany({
      where: {
        status: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: industries,
    });
  } catch (error) {
    console.error("Error fetching industries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch industries" },
      { status: 500 }
    );
  }
}