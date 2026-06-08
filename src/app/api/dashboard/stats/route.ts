import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      totalBooks: 150,
      availableBooks: 125,
      totalUsers: 45,
      totalStaff: 5,
      issuedToday: 2,
      overdueBooks: 1,
      totalFinesPending: 30,
      totalFinesCollected: 120,
      recentIssues: [
        { id: 'iss-1', issueDate: new Date().toISOString(), status: 'ISSUED', user: { name: 'Jane Smith' }, book: { title: 'Pride and Prejudice' } }
      ],
      recentActivities: [
        { id: 'act-1', action: 'BOOK_BORROWED', details: 'Jane Smith borrowed Pride and Prejudice', timestamp: new Date().toISOString(), user: { name: 'Jane Smith' } }
      ]
    }
  });
}
