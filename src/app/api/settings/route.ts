import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/settings
export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 'default',
          finePerDay: 5,
          maxBorrowDays: 14,
          maxBooksPerUser: 5,
          libraryName: 'City Library',
          maxOnlineRequestsPerUser: 3,
          maxOnlineCopiesPerBook: 3,
        },
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const settings = await prisma.settings.update({
      where: { id: 'default' },
      data: {
        finePerDay: body.finePerDay,
        maxBorrowDays: body.maxBorrowDays,
        maxBooksPerUser: body.maxBooksPerUser,
        libraryName: body.libraryName,
        maxOnlineRequestsPerUser: body.maxOnlineRequestsPerUser,
        maxOnlineCopiesPerBook: body.maxOnlineCopiesPerBook,
      },
    });

    await prisma.activity.create({
      data: {
        userId: (session.user as { id: string }).id,
        action: 'SETTINGS_UPDATED',
        details: 'System settings updated',
      },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
