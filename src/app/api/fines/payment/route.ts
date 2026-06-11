import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/fines/payment - Mark fine as paid or waived
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'STAFF'].includes((session.user as { role: string }).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { fineId, action } = await request.json();

    if (!fineId || !action) {
      return NextResponse.json({ error: 'Fine ID and action are required' }, { status: 400 });
    }

    if (!['PAID', 'WAIVED'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be PAID or WAIVED' }, { status: 400 });
    }

    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
      include: { user: { select: { name: true } }, issue: { include: { book: { select: { title: true } } } } },
    });

    if (!fine) {
      return NextResponse.json({ error: 'Fine not found' }, { status: 404 });
    }

    const updatedFine = await prisma.fine.update({
      where: { id: fineId },
      data: { status: action },
    });

    await prisma.activity.create({
      data: {
        userId: (session.user as { id: string }).id,
        action: action === 'PAID' ? 'FINE_PAID' : 'FINE_WAIVED',
        details: `Fine ₹${fine.amount} ${action.toLowerCase()} for "${fine.issue.book.title}" - ${fine.user.name}`,
      },
    });

    return NextResponse.json({ success: true, data: updatedFine });
  } catch (error) {
    console.error('Fine payment error:', error);
    return NextResponse.json({ error: 'Failed to process fine payment' }, { status: 500 });
  }
}
