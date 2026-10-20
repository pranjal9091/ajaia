import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || request.headers.get('x-user-id') || 'user_alice';

    const documents = dbService.getDocuments(userId);
    return NextResponse.json({ success: true, documents });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, ownerId } = body;

    const currentUserId = ownerId || request.headers.get('x-user-id') || 'user_alice';

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ success: false, error: 'Document title is required' }, { status: 400 });
    }

    const document = dbService.createDocument({
      title,
      content,
      ownerId: currentUserId,
    });

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
