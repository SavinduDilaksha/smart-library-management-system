import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/borrow/overdue - Get all overdue books
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // First, update any ISSUED books that are past due date to OVERDUE
    await prisma.issue.updateMany({
      where: {
        status: 'ISSUED',
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    });

    const where: Record<string, unknown> = { status: 'OVERDUE' };

    // Members only see their own overdue
    if ((session.user as { role: string }).role === 'MEMBER') {
      where.userId = (session.user as { id: string }).id;
    }

    const overdueIssues = await prisma.issue.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        book: { select: { id: true, title: true, author: true, isbn: true } },
        fine: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ success: true, data: overdueIssues });
  } catch (error) {
    console.error('Overdue fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch overdue books' }, { status: 500 });
  }
}
