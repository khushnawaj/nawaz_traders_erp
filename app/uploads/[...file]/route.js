import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const fileParams = await params;
    const filePathArray = fileParams?.file || [];
    const filename = Array.isArray(filePathArray) ? filePathArray.join('/') : filePathArray;

    if (!filename) {
      return NextResponse.json({ error: 'Filename missing' }, { status: 400 });
    }

    // Target file path inside public/uploads/
    const fullPath = path.join(process.cwd(), 'public', 'uploads', filename);
    const fileBuffer = await readFile(fullPath);

    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
