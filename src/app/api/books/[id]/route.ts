import { NextResponse } from 'next/server';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({
    success: true,
    data: {
      id,
      title: 'Mock Book ' + id,
      author: 'Mock Author',
      isbn: '1234567890',
      category: 'Fiction',
      publisher: 'Mock Publisher',
      quantity: 5,
      available: 3,
      description: 'Detailed mock description for book ' + id,
      coverImage: null,
      issues: [],
      activeRequestsCount: 0,
      userRequestStatus: null,
      userActiveRequestsCount: 0,
      settings: {
        maxOnlineRequestsPerUser: 5,
        maxOnlineCopiesPerBook: 5
      }
    }
  });
}
export async function PUT() { return NextResponse.json({ success: true }); }
export async function DELETE() { return NextResponse.json({ success: true }); }
