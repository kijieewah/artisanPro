// app/api/artisan/upload-requirement/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/lib/db";
import { getCurrentUser } from "~/lib/auth1";
import { uploadImage } from "~/lib/upload-image";
import { deleteImage } from "~/lib/delete-image";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb", // Allow larger file uploads for documents
    },
  },
};

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

    // Validate required fields
    if (!file || !artisanId || !serviceId || !requirementId) {
      return NextResponse.json(
        { error: "Missing required fields: file, artisanId, serviceId, requirementId" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images, PDFs, and Word documents are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Check if requirement already has an upload
    const existingUpload = await prisma.requirementUpload.findFirst({
      where: {
        artisanId,
        serviceId,
        requirementId,
      },
    });

    let documentUrl: string;
    let publicId: string;

    // If existing upload found, delete old file from Cloudinary
    if (existingUpload) {
      // Extract public ID from existing document URL
      const oldPublicId = existingUpload.documentUrl.split("/").pop()?.split(".")[0];
      if (oldPublicId) {
        try {
          await deleteImage(`requirements/${oldPublicId}`);
        } catch (error) {
          console.error("Error deleting old file:", error);
          // Continue even if delete fails
        }
      }
    }

    // Upload new file to Cloudinary
    try {
      // Convert file to buffer for Cloudinary upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create a File object from buffer for uploadImage function
      const cloudinaryFile = new File([buffer], file.name, { type: file.type });
      
      const uploadResult = await uploadImage(cloudinaryFile, "requirements");
      
      if (!uploadResult || !uploadResult.secure_url || !uploadResult.public_id) {
        throw new Error("Failed to upload to Cloudinary");
      }
      
      documentUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload document to cloud storage" },
        { status: 500 }
      );
    }

    // Save or update in database
    let requirementUpload;
    if (existingUpload) {
      // Update existing upload
      requirementUpload = await prisma.requirementUpload.update({
        where: { id: existingUpload.id },
        data: {
          documentUrl,
          status: "PENDING",
          rejectionReason: null,
          verifiedBy: null,
          verifiedAt: null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new upload
      requirementUpload = await prisma.requirementUpload.create({
        data: {
          artisanId,
          serviceId,
          requirementId,
          documentUrl,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      upload: requirementUpload,
      message: "Document uploaded successfully" 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document: " + (error as Error).message },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch all uploads for an artisan
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const artisanId = searchParams.get("artisanId");
    const serviceId = searchParams.get("serviceId");

    if (!artisanId) {
      return NextResponse.json(
        { error: "artisanId is required" },
        { status: 400 }
      );
    }

    const whereClause: any = { artisanId };
    if (serviceId) {
      whereClause.serviceId = parseInt(serviceId);
    }

    const uploads = await prisma.requirementUpload.findMany({
      where: whereClause,
      include: {
        requirement: true,
        service: {
          include: {
            industry: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error("Error fetching uploads:", error);
    return NextResponse.json(
      { error: "Failed to fetch uploads" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove an uploaded document
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get("uploadId");

    if (!uploadId) {
      return NextResponse.json(
        { error: "uploadId is required" },
        { status: 400 }
      );
    }

    // Get the upload to find the public ID
    const upload = await prisma.requirementUpload.findUnique({
      where: { id: parseInt(uploadId) },
    });

    if (!upload) {
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    const publicId = upload.documentUrl.split("/").pop()?.split(".")[0];
    if (publicId) {
      try {
        await deleteImage(`requirements/${publicId}`);
      } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        // Continue even if Cloudinary delete fails
      }
    }

    // Delete from database
    await prisma.requirementUpload.delete({
      where: { id: parseInt(uploadId) },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Document deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting upload:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}