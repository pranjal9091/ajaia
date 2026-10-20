import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const currentUserId = body.currentUserId || searchParams.get('userId') || request.headers.get('x-user-id') || 'user_alice';

    const { targetEmailOrId, accessLevel } = body;

    if (!targetEmailOrId || !accessLevel) {
      return NextResponse.json(
        { success: false, error: 'targetEmailOrId and accessLevel (editor | viewer) are required' },
        { status: 400 }
      );
    }

    const result = dbService.shareDocument(id, targetEmailOrId, accessLevel, currentUserId);
    if (!result.success) {
      const isAuth = result.error?.toLowerCase().includes('unauthorized');
      return NextResponse.json(
        { success: false, error: result.error },
        { status: isAuth ? 403 : 400 }
      );
    }

    return NextResponse.json({ success: true, share: result.share });
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
    const targetUserId = searchParams.get('targetUserId');
    const currentUserId = searchParams.get('currentUserId') || request.headers.get('x-user-id') || 'user_alice';

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'targetUserId query param is required' },
        { status: 400 }
      );
    }

    const result = dbService.removeShare(id, targetUserId, currentUserId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: 'Share access revoked successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
