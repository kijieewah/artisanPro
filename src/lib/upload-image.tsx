// lib/upload-image.ts

import cloudinary from "./claudinary";

// Define the type for the successful upload result
export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

export const uploadImage = async (
  file: File,
  folder: string,
): Promise<CloudinaryUploadResult> => {
  const buffer = await file.arrayBuffer();
  const bytes = Buffer.from(buffer);

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: folder,
          transformation: [
            {
              width: 800,
              crop: "limit",
              quality: "auto:eco",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            return reject(error.message);
          }

          if (!result) {
            return reject("Cloudinary upload failed with no result.");
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      )
      .end(bytes);
  });
};

// Buffer upload wrapper for flexibility
export const uploadImageFromBuffer = async (
  buffer: Buffer,
  folder: string,
  options?: { public_id?: string }
): Promise<CloudinaryUploadResult> => {
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: folder,
          public_id: options?.public_id,
          transformation: [
            {
              width: 800,
              crop: "limit",
              quality: "auto:eco",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            return reject(error.message);
          }

          if (!result) {
            return reject("Cloudinary upload failed with no result.");
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      )
      .end(buffer);
  });
};