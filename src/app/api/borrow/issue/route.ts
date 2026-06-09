import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/borrow/issue - Staff issues a book to member
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'STAFF'].includes((session.user as { role: string }).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, bookId } = await request.json();

    if (!userId || !bookId) {
      return NextResponse.json({ error: 'User ID and Book ID are required' }, { status: 400 });
    }

    // Check user exists and is active
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 400 });
    }

    // Check book availability
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    if (book.available <= 0) {
      return NextResponse.json({ error: 'Book not available' }, { status: 400 });
    }

    // Check max books per user
    const settings = await prisma.settings.findUnique({ where: { id: 'default' } });
    const activeIssues = await prisma.issue.count({
      where: { userId, status: 'ISSUED' },
    });

    if (activeIssues >= (settings?.maxBooksPerUser || 5)) {
      return NextResponse.json({ error: `User has reached the maximum limit of ${settings?.maxBooksPerUser || 5} books` }, { status: 400 });
    }

    // Check if user already has this book
    const existingIssue = await prisma.issue.findFirst({
      where: { userId, bookId, status: 'ISSUED' },
    });
    if (existingIssue) {
      return NextResponse.json({ error: 'User already has this book issued' }, { status: 400 });
    }

    // Create issue
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (settings?.maxBorrowDays || 14));

    const issue = await prisma.issue.create({
      data: {
        userId,
        bookId,
        dueDate,
        status: 'ISSUED',
      },
      include: {
        user: { select: { name: true, email: true } },
        book: { select: { title: true } },
      },
    });

    // Update book availability
    await prisma.book.update({
      where: { id: bookId },
      data: { available: { decrement: 1 } },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: (session.user as { id: string }).id,
        action: 'BOOK_ISSUED',
        details: `Issued "${issue.book.title}" to ${issue.user.name}`,
      },
    });

    return NextResponse.json({ success: true, data: issue });
  } catch (error) {
    console.error('Issue error:', error);
    return NextResponse.json({ error: 'Failed to issue book' }, { status: 500 });
  }
}
