import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

// PUT /api/borrow/request/[id] - Update request status
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json();

    const { role, id: currentUserId } = session.user as { role: string; id: string };

    const borrowReq = await prisma.borrowRequest.findUnique({
      where: { id },
      include: {
        book: { select: { title: true, id: true } },
        user: { select: { name: true, email: true, id: true } },
      },
    });

    if (!borrowReq) {
      return NextResponse.json({ error: 'Borrow request not found' }, { status: 404 });
    }

    if (action === 'CANCEL') {
      // Only the user who created the request can cancel it
      if (borrowReq.userId !== currentUserId) {
        return NextResponse.json({ error: 'Unauthorized to cancel this request' }, { status: 403 });
      }

      if (!['PENDING', 'APPROVED'].includes(borrowReq.status)) {
        return NextResponse.json({ error: `Cannot cancel request in ${borrowReq.status} status` }, { status: 400 });
      }

      // Perform cancellation in transaction
      const updatedReq = await prisma.$transaction(async (tx) => {
        // 1. Update status
        const req = await tx.borrowRequest.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });

        // 2. Re-increment book availability
        await tx.book.update({
          where: { id: borrowReq.bookId },
          data: { available: { increment: 1 } },
        });

        // 3. Log activity
        await tx.activity.create({
          data: {
            userId: currentUserId,
            action: 'BOOK_REQUEST_CANCELLED',
            details: `Cancelled request for "${borrowReq.book.title}"`,
          },
        });

        return req;
      });

      return NextResponse.json({ success: true, data: updatedReq });
    }

    // All other actions require STAFF or ADMIN role
    if (!['ADMIN', 'STAFF'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (action === 'APPROVE') {
      if (borrowReq.status !== 'PENDING') {
        return NextResponse.json({ error: 'Only PENDING requests can be approved' }, { status: 400 });
      }

      const updatedReq = await prisma.$transaction(async (tx) => {
        // 1. Update request status
        const req = await tx.borrowRequest.update({
          where: { id },
          data: { status: 'APPROVED' },
        });

        // 2. Notify member
        await tx.notification.create({
          data: {
            userId: borrowReq.userId,
            message: `Your borrow request for "${borrowReq.book.title}" has been approved! Please visit the library to collect it.`,
            type: 'SUCCESS',
          },
        });

        // 3. Log activity
        await tx.activity.create({
          data: {
            userId: currentUserId,
            action: 'BOOK_REQUEST_APPROVED',
            details: `Approved borrow request for "${borrowReq.book.title}" by ${borrowReq.user.name}`,
          },
        });

        return req;
      });

      return NextResponse.json({ success: true, data: updatedReq });
    }

    if (action === 'REJECT') {
      if (!['PENDING', 'APPROVED'].includes(borrowReq.status)) {
        return NextResponse.json({ error: `Cannot reject request in ${borrowReq.status} status` }, { status: 400 });
      }

      const updatedReq = await prisma.$transaction(async (tx) => {
        // 1. Update request status
        const req = await tx.borrowRequest.update({
          where: { id },
          data: { status: 'REJECTED' },
        });

        // 2. Re-increment book availability
        await tx.book.update({
          where: { id: borrowReq.bookId },
          data: { available: { increment: 1 } },
        });

        // 3. Notify member
        await tx.notification.create({
          data: {
            userId: borrowReq.userId,
            message: `Your borrow request for "${borrowReq.book.title}" was rejected by the library staff.`,
            type: 'DANGER',
          },
        });

        // 4. Log activity
        await tx.activity.create({
          data: {
            userId: currentUserId,
            action: 'BOOK_REQUEST_REJECTED',
            details: `Rejected borrow request for "${borrowReq.book.title}" by ${borrowReq.user.name}`,
          },
        });

        return req;
      });

      return NextResponse.json({ success: true, data: updatedReq });
    }

    if (action === 'ISSUE') {
      if (!['PENDING', 'APPROVED'].includes(borrowReq.status)) {
        return NextResponse.json({ error: `Cannot issue book from request in ${borrowReq.status} status` }, { status: 400 });
      }

      // Check max books limit for user
      const settings = await prisma.settings.findUnique({ where: { id: 'default' } });
      const activeIssuesCount = await prisma.issue.count({
        where: { userId: borrowReq.userId, status: 'ISSUED' },
      });

      if (activeIssuesCount >= (settings?.maxBooksPerUser ?? 5)) {
        return NextResponse.json({
          error: `${borrowReq.user.name} has already reached the maximum limit of ${settings?.maxBooksPerUser ?? 5} active loans.`,
        }, { status: 400 });
      }

      const updatedReq = await prisma.$transaction(async (tx) => {
        // 1. Update request status to ISSUED
        const req = await tx.borrowRequest.update({
          where: { id },
          data: { status: 'ISSUED' },
        });

        // 2. Create Issue record
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (settings?.maxBorrowDays ?? 14));

        await tx.issue.create({
          data: {
            userId: borrowReq.userId,
            bookId: borrowReq.bookId,
            dueDate,
            status: 'ISSUED',
          },
        });

        // 3. Dispatch Notification
        await tx.notification.create({
          data: {
            userId: borrowReq.userId,
            message: `The book "${borrowReq.book.title}" has been issued to you. Due date: ${formatDate(dueDate.toISOString())}.`,
            type: 'SUCCESS',
          },
        });

        // 4. Log activity
        await tx.activity.create({
          data: {
            userId: currentUserId,
            action: 'BOOK_ISSUED',
            details: `Issued book "${borrowReq.book.title}" to ${borrowReq.user.name} from online request`,
          },
        });

        return req;
      });

      return NextResponse.json({ success: true, data: updatedReq });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Request status update error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
