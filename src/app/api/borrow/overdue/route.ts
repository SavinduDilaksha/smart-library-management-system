import { NextResponse } from 'next/server';
const mockOverdue = [
  {
    id: 'iss-2',
    issueDate: new Date(Date.now() - 20*24*60*60*1000).toISOString(),
    dueDate: new Date(Date.now() - 6*24*60*60*1000).toISOString(),
    user: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
    book: { title: 'Moby Dick', author: 'Herman Melville' },
    fine: { amount: 30 }
  }
];
export async function GET() {
  return NextResponse.json({ success: true, data: mockOverdue });
}
