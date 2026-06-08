import { NextResponse } from 'next/server';
const mockRequests = [
  {
    id: 'req-1',
    requestDate: new Date().toISOString(),
    status: 'PENDING',
    book: { id: '5', title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Fiction', coverImage: null },
    user: { name: 'Jane Smith', email: 'jane@example.com' }
  }
];
export async function GET() { return NextResponse.json({ success: true, data: mockRequests }); }
export async function POST() { return NextResponse.json({ success: true }); }
