import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/borrow/history
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const userRole = (session.user as { role: string }).role;
    const currentUserId = (session.user as { id: string }).id;

    const where: Record<string, unknown> = {};

    // Members can only see their own history
    if (userRole === 'MEMBER') {
      where.userId = currentUserId;
    } else if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true, author: true, isbn: true } },
        fine: true,
      },
      orderBy: { issueDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: issues });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
