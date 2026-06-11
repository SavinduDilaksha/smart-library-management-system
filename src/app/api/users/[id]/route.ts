import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/users/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, phone: true, status: true, createdAt: true,
        _count: { select: { issues: true, fines: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'STAFF'].includes((session.user as { role: string }).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name || existingUser.name,
        email: body.email || existingUser.email,
        role: body.role || existingUser.role,
        phone: body.phone !== undefined ? body.phone : existingUser.phone,
        status: body.status || existingUser.status,
      },
      select: { id: true, name: true, email: true, role: true, phone: true, status: true },
    });

    await prisma.activity.create({
      data: {
        userId: (session.user as { id: string }).id,
        action: 'USER_UPDATED',
        details: `Updated user "${updatedUser.name}" (${body.status ? 'status: ' + body.status : 'info updated'})`,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { issues: { where: { status: 'ISSUED' } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.issues.length > 0) {
      return NextResponse.json({ error: 'Cannot delete user with active book issues' }, { status: 400 });
    }

    await prisma.notification.deleteMany({ where: { userId: id } });
    await prisma.activity.deleteMany({ where: { userId: id } });
    await prisma.fine.deleteMany({ where: { userId: id } });
    await prisma.issue.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
