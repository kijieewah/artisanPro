// app/api/states/route.ts
import { NextResponse } from "next/server";
import { prisma } from "~/lib/db";

export async function GET() {
  try {
    const states = await prisma.state.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: states,
    });
  } catch (error) {
    console.error("Error fetching states:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch states" },
      { status: 500 }
    );
  }
}