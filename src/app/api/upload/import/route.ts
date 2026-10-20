import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { dbService } from '@/lib/db';
import { markdownToHtml } from '@/lib/markdown-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const ownerId = (formData.get('ownerId') as string) || request.headers.get('x-user-id') || 'user_alice';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const filename = file.name;
    const ext = path.extname(filename).toLowerCase();

    // Check supported file types
    if (ext !== '.txt' && ext !== '.md' && ext !== '.markdown') {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type "${ext}". We currently support importing .txt and .md files directly into editable documents.`,
        },
        { status: 400 }
      );
    }

    const textContent = await file.text();

    // Extract title from first markdown H1 or filename
    let docTitle = path.basename(filename, ext);
    const h1Match = textContent.match(/^#\s+(.+)$/m);
    if (h1Match && h1Match[1].trim()) {
      docTitle = h1Match[1].trim();
    } else {
      // Clean up title from filename
      docTitle = docTitle.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const htmlContent = markdownToHtml(textContent);

    const document = dbService.createDocument({
      title: docTitle,
      content: htmlContent,
      ownerId,
    });

    return NextResponse.json(
      {
        success: true,
        document,
        message: `Imported "${filename}" into a new document successfully!`,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
