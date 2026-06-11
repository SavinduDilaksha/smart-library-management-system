import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/notifications - Get current user's notifications
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { id, all } = body;

    if (all) {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    } else if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
    } else {
      return NextResponse.json({ error: 'Notification ID or "all" flag is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}

// POST /api/notifications - Broadcast an announcement to all users
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'STAFF'].includes((session.user as { role: string }).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { message, type } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });

    // Create notifications for all users
    const notificationsData = allUsers.map(user => ({
      userId: user.id,
      message: message.trim(),
      type: type || 'INFO',
    }));

    await prisma.notification.createMany({
      data: notificationsData,
    });

    // Log admin/staff action
    await prisma.activity.create({
      data: {
        userId: (session.user as { id: string }).id,
        action: 'ANNOUNCEMENT_BROADCASTED',
        details: `Broadcasted: "${message.substring(0, 50)}..."`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Broadcast announcement error:', error);
    return NextResponse.json({ error: 'Failed to broadcast announcement' }, { status: 500 });
  }
}
