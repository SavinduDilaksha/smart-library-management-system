import { NextResponse } from 'next/server';
const mockUsers = [
  { id: 'admin-id', name: 'System Admin', email: 'admin@library.com', role: 'ADMIN', status: 'ACTIVE', phone: '1234567890', createdAt: new Date().toISOString(), _count: { issues: 0, fines: 0 } },
  { id: 'staff-id', name: 'Library Staff', email: 'staff@library.com', role: 'STAFF', status: 'ACTIVE', phone: '0987654321', createdAt: new Date().toISOString(), _count: { issues: 0, fines: 0 } },
  { id: 'member-id', name: 'John Doe', email: 'john@example.com', role: 'MEMBER', status: 'ACTIVE', phone: '5555555555', createdAt: new Date().toISOString(), _count: { issues: 2, fines: 1 } }
];
export async function GET() { return NextResponse.json({ success: true, data: mockUsers }); }
export async function POST() { return NextResponse.json({ success: true }); }
