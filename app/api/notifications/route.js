import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth/session';
import { getUserNotifications, markNotificationsAsRead, createNotification, clearUserNotifications } from '@/server/services/notificationService';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    const notifications = await getUserNotifications(session || null);
    const unreadCount = (notifications || []).filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, message, type, link, userId, targetRole } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Title and message required' }, { status: 400 });
    }

    const notification = await createNotification({
      userId: userId || null,
      targetRole: targetRole || null,
      title,
      message,
      type: type || 'SYSTEM',
      link: link || null,
    });

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;
    const body = await request.json().catch(() => ({}));
    const { notificationIds } = body;

    await markNotificationsAsRead(notificationIds || [], session?.userId || null);

    return NextResponse.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await clearUserNotifications(session);

    return NextResponse.json({ success: true, message: 'All notifications cleared successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
