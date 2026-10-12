import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const cleanFileName = (file.name || 'upload.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${cleanFileName}`;

    // Target upload directory: public/uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory already exists or created
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    // If it's an image under 2MB, generate Data URL for database persistence across container restarts
    const isImage = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
    let dataUrl = null;
    if (isImage && buffer.length <= 2 * 1024 * 1024) {
      const mime = file.type || 'image/jpeg';
      dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully!',
      url: dataUrl || publicUrl,
      publicUrl,
      dataUrl,
    });
  } catch (error) {
    console.error('Error in file upload API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
