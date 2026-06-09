import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/books - List all books with search/filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [books, total, settings] = await Promise.all([
      prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          borrowRequests: {
            where: { status: { in: ['PENDING', 'APPROVED'] } },
            select: { id: true }
          }
        }
      }),
      prisma.book.count({ where }),
      prisma.settings.findUnique({ where: { id: 'default' } })
    ]);

    const booksWithRequestCounts = books.map(book => {
      const activeRequestsCount = book.borrowRequests.length;
      const { borrowRequests, ...bookData } = book;
      return { ...bookData, activeRequestsCount };
    });

    return NextResponse.json({
      success: true,
      data: booksWithRequestCounts,
      settings: {
        maxOnlineCopiesPerBook: settings?.maxOnlineCopiesPerBook ?? 3
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Books fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}
// POST /api/books - Create a new book
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'STAFF'].includes((session.user as { role: string }).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, author, isbn, category, publisher, quantity, description, coverImage } = body;

    if (!title || !author || !isbn || !category) {
      return NextResponse.json({ error: 'Title, author, ISBN, and category are required' }, { status: 400 });
    }

    const bookQty = quantity !== undefined ? Number(quantity) : 5;
    if (bookQty < 5) {
      return NextResponse.json({ error: 'A new book must be created with at least 5 copies' }, { status: 400 });
    }

    const existingBook = await prisma.book.findUnique({ where: { isbn } });
    if (existingBook) {
      return NextResponse.json({ error: 'A book with this ISBN already exists' }, { status: 400 });
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        category,
        publisher: publisher || null,
        quantity: bookQty,
        available: bookQty,
        description: description || null,
        coverImage: coverImage || null,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: (session.user as { id: string }).id,
        action: 'BOOK_ADDED',
        details: `Added book "${title}" (ISBN: ${isbn})`,
      },
    });

    return NextResponse.json({ success: true, data: book });
  } catch (error) {
    console.error('Book create error:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
