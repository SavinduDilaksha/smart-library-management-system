import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/dashboard/stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalBooks,
      totalUsers,
      totalStaff,
      issuedToday,
      overdueBooks,
      pendingFines,
      paidFines,
      availableBooks,
      recentIssues,
      recentActivities,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.user.count({ where: { role: 'STAFF' } }),
      prisma.issue.count({ where: { issueDate: { gte: today, lt: tomorrow } } }),
      prisma.issue.count({ where: { status: 'OVERDUE' } }),
      prisma.fine.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),
      prisma.fine.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.book.aggregate({ _sum: { available: true } }),
      prisma.issue.findMany({
        take: 5,
        orderBy: { issueDate: 'desc' },
        include: {
          user: { select: { name: true } },
          book: { select: { title: true } },
        },
      }),
      prisma.activity.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { name: true } } },
      }),
    ]);

    // Also update overdue status
    await prisma.issue.updateMany({
      where: { status: 'ISSUED', dueDate: { lt: new Date() } },
      data: { status: 'OVERDUE' },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalBooks,
        totalUsers,
        totalStaff,
        issuedToday,
        overdueBooks,
        totalFinesPending: pendingFines._sum.amount || 0,
        totalFinesCollected: paidFines._sum.amount || 0,
        availableBooks: availableBooks._sum.available || 0,
        recentIssues,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
