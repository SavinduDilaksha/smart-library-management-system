import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getOverdueDays(dueDate: Date | string): number {
  const days = differenceInDays(new Date(), new Date(dueDate));
  return Math.max(0, days);
}

export function calculateFine(overdueDays: number, finePerDay: number): number {
  return overdueDays * finePerDay;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'ISSUED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'RETURNED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'OVERDUE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'PAID': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'WAIVED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'INACTIVE': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'STAFF': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'MEMBER': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}
