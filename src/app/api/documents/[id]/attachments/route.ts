import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { dbService, UPLOADS_DIR } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const uploadedBy = (formData.get('uploadedBy') as string) || 'user_alice';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const originalName = file.name;
    const fileExt = path.extname(originalName);
    const sanitizedBase = path.basename(originalName, fileExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${sanitizedBase}_${Date.now()}${fileExt}`;
    const destinationPath = path.join(UPLOADS_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(destinationPath, buffer);

    const result = dbService.addAttachment(id, {
      originalName,
      filename,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: buffer.length,
      uploadedBy,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, attachment: result.attachment });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get('attachmentId');
    const currentUserId = searchParams.get('userId') || 'user_alice';

    if (!attachmentId) {
      return NextResponse.json({ success: false, error: 'attachmentId is required' }, { status: 400 });
    }

    const result = dbService.deleteAttachment(id, attachmentId, currentUserId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: 'Attachment deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
