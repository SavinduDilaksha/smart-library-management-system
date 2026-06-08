import { NextResponse } from 'next/server';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ success: true, data: { id, name: 'User ' + id, email: 'user@example.com', role: 'MEMBER', status: 'ACTIVE', createdAt: new Date().toISOString(), _count: { issues: 0, fines: 0 } } });
}
export async function PUT() { return NextResponse.json({ success: true }); }
export async function DELETE() { return NextResponse.json({ success: true }); }
