import { NextResponse } from 'next/server';
const mockFines = [
  { id: 'fine-1', amount: 30, status: 'PENDING', createdAt: new Date().toISOString(), user: { id: 'member-id', name: 'John Doe', email: 'john@example.com' }, issue: { book: { title: 'Moby Dick' } } }
];
export async function GET() {
  return NextResponse.json({ success: true, data: mockFines });
}
