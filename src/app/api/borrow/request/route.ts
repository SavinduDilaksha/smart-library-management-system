import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/borrow/request
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id: userId } = session.user as { role: string; id: string };

    if (role === 'MEMBER') {
      // Members only see their own requests
      const requests = await prisma.borrowRequest.findMany({
        where: { userId },
        include: {
          book: {
            select: { id: true, title: true, author: true, category: true, coverImage: true, available: true },
          },
        },
        orderBy: { requestDate: 'desc' },
      });
      return NextResponse.json({ success: true, data: requests });
    } else {
      // Admin and Staff see all requests
      const requests = await prisma.borrowRequest.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, title: true, author: true, category: true, available: true } },
        },
        orderBy: { requestDate: 'desc' },
      });
      return NextResponse.json({ success: true, data: requests });
    }
  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST /api/borrow/request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId, name: userName } = session.user as { id: string; name: string };
    const { bookId } = await request.json();

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    // Get settings
    const settings = await prisma.settings.findUnique({ where: { id: 'default' } });
    const maxUserRequests = settings?.maxOnlineRequestsPerUser ?? 3;
    const maxBookRequests = settings?.maxOnlineCopiesPerBook ?? 3;

    // Check user active requests limit
    const activeUserRequests = await prisma.borrowRequest.count({
      where: { userId, status: { in: ['PENDING', 'APPROVED'] } },
    });

    if (activeUserRequests >= maxUserRequests) {
      return NextResponse.json({
        error: `You have reached the maximum online requests limit of ${maxUserRequests} active requests.`,
      }, { status: 400 });
    }

    // Check if user already has this book requested
    const existingRequest = await prisma.borrowRequest.findFirst({
      where: { userId, bookId, status: { in: ['PENDING', 'APPROVED'] } },
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a pending or approved request for this book.' }, { status: 400 });
    }

    // Check if user has this book issued currently
    const existingIssue = await prisma.issue.findFirst({
      where: { userId, bookId, status: 'ISSUED' },
    });

    if (existingIssue) {
      return NextResponse.json({ error: 'You already have this book checked out.' }, { status: 400 });
    }

    // Check book availability
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.available <= 0) {
      return NextResponse.json({ error: 'No copies of this book are currently available in the shelf.' }, { status: 400 });
    }

    // Check book online active requests limit
    const activeBookRequests = await prisma.borrowRequest.count({
      where: { bookId, status: { in: ['PENDING', 'APPROVED'] } },
    });

    if (activeBookRequests >= maxBookRequests) {
      return NextResponse.json({
        error: `No more online reservation copies available for this book. (Limit of ${maxBookRequests} reached).`,
      }, { status: 400 });
    }

    // Perform reservation in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create request
      const borrowReq = await tx.borrowRequest.create({
        data: { userId, bookId, status: 'PENDING' },
        include: { book: { select: { title: true } } },
      });

      // 2. Decrement physical availability to hold the copy
      await tx.book.update({
        where: { id: bookId },
        data: { available: { decrement: 1 } },
      });

      // 3. Log activity
      await tx.activity.create({
        data: {
          userId,
          action: 'BOOK_REQUESTED',
          details: `Requested book "${borrowReq.book.title}" online`,
        },
      });

      return borrowReq;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Failed to submit borrow request' }, { status: 500 });
  }
}
