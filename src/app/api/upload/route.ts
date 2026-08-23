import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';

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

    // Save directly to local filesystem in public/uploads (100% offline)
    const extName = path.extname(file.name) || `.${fileType.split('/')[1] || 'jpg'}`;
    const cleanExt = extName.toLowerCase();
    const uniqueName = `img-${Date.now()}-${Math.floor(Math.random() * 10000)}${cleanExt}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, uniqueName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: 'Image saved locally successfully.',
    });
  } catch (error) {
    console.error('Local file upload error:', error);
    return NextResponse.json(
      { error: 'Failed to save image locally.' },
      { status: 500 }
    );
  }
}
