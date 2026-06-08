import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    success: true,
    data: { finePerDay: 5, maxBorrowDays: 14, maxBooksPerUser: 5, libraryName: 'City Library', maxOnlineRequestsPerUser: 3, maxOnlineCopiesPerBook: 3 }
  });
}
export async function PUT() { return NextResponse.json({ success: true }); }
