export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'MEMBER';
  phone?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string | null;
  quantity: number;
  available: number;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  userId: string;
  bookId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
  user?: User;
  book?: Book;
  fine?: Fine | null;
  createdAt: string;
}

export interface Fine {
  id: string;
  issueId: string;
  userId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'WAIVED';
  createdAt: string;
  issue?: Issue;
  user?: User;
}

export interface Settings {
  id: string;
  finePerDay: number;
  maxBorrowDays: number;
  maxBooksPerUser: number;
  libraryName: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'DUE_REMINDER' | 'OVERDUE_ALERT' | 'FINE_NOTICE' | 'ANNOUNCEMENT';
  sentAt: string;
  read: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  details?: string | null;
  timestamp: string;
  user?: User;
}

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalStaff: number;
  issuedToday: number;
  overdueBooks: number;
  totalFinesPending: number;
  totalFinesCollected: number;
  availableBooks: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
