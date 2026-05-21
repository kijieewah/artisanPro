// app/api/artisan/upload-requirement/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { getCurrentUser } from "~/lib/auth1";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const artisanId = formData.get("artisanId") as string;
    const serviceId = parseInt(formData.get("serviceId") as string);
    const requirementId = parseInt(formData.get("requirementId") as string);

    if (!file || !artisanId || !serviceId || !requirementId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save file to disk (or upload to cloud storage)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const uploadDir = path.join(process.cwd(), "public/uploads/requirements");
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    
    // Save to database
    const requirementUpload = await prisma.requirementUpload.create({
      data: {
        artisanId,
        serviceId,
        requirementId,
        documentUrl: `/uploads/requirements/${filename}`,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, upload: requirementUpload });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}