import { Readable } from 'stream';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

import { configureCloudinary } from 'src/config/cloudinary';

export async function uploadFileBufferToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  folder = 'uploads',
): Promise<string> {
  try {
    const cloudinary = configureCloudinary();

    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          public_id: fileName.split('.')[0],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error('Failed to upload to Cloudinary'));
          }

          return resolve(result.secure_url);
        },
      );

      Readable.from(fileBuffer).pipe(uploadStream);
    });
  } catch (error) {
    console.error('Unexpected Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

export async function deleteFileFromCloudinary(fileUrl: string): Promise<void> {
  try {
    const cloudinary = configureCloudinary();

    const urlParts = fileUrl.split('/');
    const publicIdWithExtension = urlParts.at(-1);
    const publicId = publicIdWithExtension?.split('.')[0];

    const folderStartIndex = urlParts.indexOf('upload') + 1;
    const folderPath = urlParts.slice(folderStartIndex, -1).join('/');
    const fullPublicId = folderPath ? `${folderPath}/${publicId}` : publicId;

    if (!fullPublicId) {
      throw new Error('Could not extract public ID from URL');
    }

    await cloudinary.uploader.destroy(fullPublicId, { resource_type: 'auto' });
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
}
