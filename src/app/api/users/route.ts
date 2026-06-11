import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/users
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'STAFF'].includes((session.user as { role: string }).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            issues: true,
            fines: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Admin/Staff creates user
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'STAFF'].includes((session.user as { role: string }).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    // Only admin can create staff/admin accounts
    if (role && role !== 'MEMBER' && (session.user as { role: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can create staff accounts' }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'MEMBER',
        phone: phone || null,
        status: 'ACTIVE',
      },
    });

    await prisma.activity.create({
      data: {
        userId: (session.user as { id: string }).id,
        action: 'USER_CREATED',
        details: `Created ${user.role} account for "${user.name}"`,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('User create error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
