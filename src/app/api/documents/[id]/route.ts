import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || request.headers.get('x-user-id') || 'user_alice';

    const document = dbService.getDocumentById(id, userId);
    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, document });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const userId = body.userId || searchParams.get('userId') || request.headers.get('x-user-id') || 'user_alice';

    const result = dbService.updateDocument(
      id,
      {
        title: body.title,
        content: body.content,
      },
      userId
    );

    if (!result.success) {
      const isAuthError = result.error?.toLowerCase().includes('unauthorized');
      return NextResponse.json(
        { success: false, error: result.error },
        { status: isAuthError ? 403 : 400 }
      );
    }

    return NextResponse.json({ success: true, document: result.document });
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
    const userId = searchParams.get('userId') || request.headers.get('x-user-id') || 'user_alice';

    const result = dbService.deleteDocument(id, userId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
