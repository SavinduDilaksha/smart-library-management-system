import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/borrow/return - Process book return
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'STAFF'].includes((session.user as { role: string }).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { issueId } = await request.json();

    if (!issueId) {
      return NextResponse.json({ error: 'Issue ID is required' }, { status: 400 });
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        user: { select: { name: true, email: true } },
        book: { select: { id: true, title: true } },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue record not found' }, { status: 404 });
    }

    if (issue.status === 'RETURNED') {
      return NextResponse.json({ error: 'Book already returned' }, { status: 400 });
    }

    const returnDate = new Date();
    const dueDate = new Date(issue.dueDate);
    const isOverdue = returnDate > dueDate;

    // Update issue
    await prisma.issue.update({
      where: { id: issueId },
      data: {
        returnDate,
        status: 'RETURNED',
      },
    });

    // Update book availability
    await prisma.book.update({
      where: { id: issue.book.id },
      data: { available: { increment: 1 } },
    });

    // Calculate and create fine if overdue
    let fineData = null;
    if (isOverdue) {
      const settings = await prisma.settings.findUnique({ where: { id: 'default' } });
      const overdueDays = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const fineAmount = overdueDays * (settings?.finePerDay || 5);

      fineData = await prisma.fine.create({
        data: {
          issueId,
          userId: issue.userId,
          amount: fineAmount,
          status: 'PENDING',
        },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: (session.user as { id: string }).id,
        action: 'BOOK_RETURNED',
        details: `Returned "${issue.book.title}" from ${issue.user.name}${isOverdue ? ' (OVERDUE - Fine applied)' : ''}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        issueId,
        returnDate,
        isOverdue,
        fine: fineData,
      },
    });
  } catch (error) {
    console.error('Return error:', error);
    return NextResponse.json({ error: 'Failed to return book' }, { status: 500 });
  }
}
