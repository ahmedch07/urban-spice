import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { getCurrentUser } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Supported file types: JPG/JPEG, PNG, WEBP, SVG, GIF
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    const fileType = file.type.toLowerCase();
    const hasAllowedExtension = /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file.name);

    if (!allowedMimeTypes.includes(fileType) && !hasAllowedExtension) {
      return NextResponse.json(
        { error: 'Please select a valid JPG, PNG, or WEBP image.' },
        { status: 400 }
      );
    }

    // Size limit: 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image file size must be less than 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if Cloudinary is configured
    const isCloudinaryConfigured =
      Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
      Boolean(process.env.CLOUDINARY_API_KEY) &&
      Boolean(process.env.CLOUDINARY_API_SECRET);

    let fileUrl = '';

    if (isCloudinaryConfigured) {
      // Upload directly to Cloudinary
      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'urban-spice',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Cloudinary upload failed'));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(buffer);
      });

      fileUrl = uploadResult.secure_url;
    } else {
      // Fallback to local storage if Cloudinary credentials are not set in .env
      const extName = path.extname(file.name) || `.${fileType.split('/')[1] || 'jpg'}`;
      const cleanExt = extName.toLowerCase();
      const uniqueName = `img-${Date.now()}-${Math.floor(Math.random() * 10000)}${cleanExt}`;

      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, uniqueName);
        await writeFile(filePath, buffer);
        fileUrl = `/uploads/${uniqueName}`;
      } catch (fsError) {
        const base64String = buffer.toString('base64');
        fileUrl = `data:${fileType};base64,${base64String}`;
      }
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: 'Image uploaded successfully.',
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image to Cloudinary. Please check your credentials.' },
      { status: 500 }
    );
  }
}
