import { NextResponse } from 'next/server';
const mockBooks = [
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', category: 'Fiction', quantity: 5, available: 5, description: 'A story of Gatsby.' },
  { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', category: 'Classic', quantity: 7, available: 4, description: 'A story of racial injustice.' },
  { id: '3', title: '1984', author: 'George Orwell', isbn: '9780451524935', category: 'Dystopian', quantity: 10, available: 10, description: 'Big Brother is watching.' },
  { id: '4', title: 'Moby Dick', author: 'Herman Melville', isbn: '9781503280786', category: 'Adventure', quantity: 6, available: 2, description: 'The great white whale.' },
  { id: '5', title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439517', category: 'Romance', quantity: 8, available: 8, description: 'Love and society.' }
];
export async function GET() {
  return NextResponse.json({ success: true, data: mockBooks });
}
export async function POST() {
  return NextResponse.json({ success: true, data: { id: 'new-book-id', title: 'New Mock Book', author: 'Mock Author', isbn: '1111111111', category: 'Fiction', quantity: 5, available: 5 } });
}
