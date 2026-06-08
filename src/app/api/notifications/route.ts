import { NextResponse } from 'next/server';
const mockNotifications = [
  { id: 'notif-1', message: 'Your borrow request for Pride and Prejudice is pending staff approval.', type: 'INFO', sentAt: new Date().toISOString(), read: false }
];
export async function GET() { return NextResponse.json({ success: true, data: mockNotifications }); }
export async function PUT() { return NextResponse.json({ success: true }); }
export async function POST() { return NextResponse.json({ success: true }); }
