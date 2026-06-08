import { NextResponse } from 'next/server';
const mockHistory = [
  {
    id: 'iss-1', issueDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(), dueDate: new Date(Date.now() + 9*24*60*60*1000).toISOString(), status: 'ISSUED',
    book: { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', coverImage: null },
    user: { name: 'John Doe', email: 'john@example.com' },
    fine: null
  },
  {
    id: 'iss-2', issueDate: new Date(Date.now() - 20*24*60*60*1000).toISOString(), dueDate: new Date(Date.now() - 6*24*60*60*1000).toISOString(), status: 'OVERDUE',
    book: { id: '4', title: 'Moby Dick', author: 'Herman Melville', isbn: '9781503280786', coverImage: null },
    user: { name: 'John Doe', email: 'john@example.com' },
    fine: { amount: 30, status: 'PENDING' }
  }
];
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  
  let data = mockHistory;
  if (status) {
    data = mockHistory.filter(item => item.status === status);
  }
  
  return NextResponse.json({ success: true, data });
}
