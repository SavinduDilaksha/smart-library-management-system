import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/fines
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userRole = (session.user as { role: string }).role;

    const where: Record<string, unknown> = {};

    if (userRole === 'MEMBER') {
      where.userId = (session.user as { id: string }).id;
    }

    if (status) {
      where.status = status;
    }

    const fines = await prisma.fine.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        issue: {
          include: {
            book: { select: { title: true, author: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: fines });
  } catch (error) {
    console.error('Fines fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch fines' }, { status: 500 });
  }
}
