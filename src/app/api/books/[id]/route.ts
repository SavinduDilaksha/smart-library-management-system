import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
// GET /api/books/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        issues: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { issueDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as { id: string }).id : undefined;

    let userRequestStatus: string | null = null;
    let userActiveRequestsCount = 0;

    if (userId) {
      const userRequest = await prisma.borrowRequest.findFirst({
        where: { bookId: id, userId, status: { in: ['PENDING', 'APPROVED'] } },
        select: { status: true },
      });
      userRequestStatus = userRequest?.status || null;

      userActiveRequestsCount = await prisma.borrowRequest.count({
        where: { userId, status: { in: ['PENDING', 'APPROVED'] } },
      });
    }

    const activeRequestsCount = await prisma.borrowRequest.count({
      where: { bookId: id, status: { in: ['PENDING', 'APPROVED'] } },
    });

    const settings = await prisma.settings.findUnique({ where: { id: 'default' } });

    return NextResponse.json({
      success: true,
      data: {
        ...book,
        activeRequestsCount,
        userRequestStatus,
        userActiveRequestsCount,
        settings: {
          maxOnlineRequestsPerUser: settings?.maxOnlineRequestsPerUser ?? 3,
          maxOnlineCopiesPerBook: settings?.maxOnlineCopiesPerBook ?? 3,
        },
      },
    });
  } catch (error) {
    console.error('Book fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

// PUT /api/books/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'STAFF'].includes((session.user as { role: string }).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Calculate available change if quantity changed
    const quantityDiff = (body.quantity || existingBook.quantity) - existingBook.quantity;
    const newAvailable = Math.max(0, existingBook.available + quantityDiff);

    const book = await prisma.book.update({
      where: { id },
      data: {
        title: body.title || existingBook.title,
        author: body.author || existingBook.author,
        isbn: body.isbn || existingBook.isbn,
        category: body.category || existingBook.category,
        publisher: body.publisher !== undefined ? body.publisher : existingBook.publisher,
        quantity: body.quantity || existingBook.quantity,
        available: newAvailable,
        description: body.description !== undefined ? body.description : existingBook.description,
        coverImage: body.coverImage !== undefined ? body.coverImage : existingBook.coverImage,
      },
    });

    await prisma.activity.create({
      data: {
        userId: (session.user as { id: string }).id,
        action: 'BOOK_UPDATED',
        details: `Updated book "${book.title}"`,
      },
    });

    return NextResponse.json({ success: true, data: book });
  } catch (error) {
    console.error('Book update error:', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

// DELETE /api/books/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'STAFF'].includes((session.user as { role: string }).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    const book = await prisma.book.findUnique({ where: { id }, include: { issues: { where: { status: 'ISSUED' } } } });
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.issues.length > 0) {
      return NextResponse.json({ error: 'Cannot delete book with active issues' }, { status: 400 });
    }

    // Delete related issues and fines first
    await prisma.fine.deleteMany({ where: { issue: { bookId: id } } });
    await prisma.issue.deleteMany({ where: { bookId: id } });
    await prisma.book.delete({ where: { id } });

    await prisma.activity.create({
      data: {
        userId: (session.user as { id: string }).id,
        action: 'BOOK_DELETED',
        details: `Deleted book "${book.title}"`,
      },
    });

    return NextResponse.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    console.error('Book delete error:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
