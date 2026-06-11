import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().min(1, 'ISBN is required'),
  category: z.string().min(1, 'Category is required'),
  publisher: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const issueSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  bookId: z.string().min(1, 'Book is required'),
});

export const settingsSchema = z.object({
  finePerDay: z.number().min(0, 'Fine per day must be non-negative'),
  maxBorrowDays: z.number().int().min(1, 'Max borrow days must be at least 1'),
  maxBooksPerUser: z.number().int().min(1, 'Max books per user must be at least 1'),
  libraryName: z.string().min(1, 'Library name is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookInput = z.infer<typeof bookSchema>;
export type IssueInput = z.infer<typeof issueSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
