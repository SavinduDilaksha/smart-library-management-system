export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_BOOKS: '/admin/books',
  ADMIN_USERS: '/admin/users',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_ISSUE_RETURN: '/admin/issue-return',
  ADMIN_FINES: '/admin/fines',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_SETTINGS: '/admin/settings',

  // Staff
  STAFF_DASHBOARD: '/staff/dashboard',
  STAFF_ISSUE_BOOK: '/staff/issue-book',
  STAFF_RETURN_BOOK: '/staff/return-book',
  STAFF_BORROWED_BOOKS: '/staff/borrowed-books',
  STAFF_OVERDUE_BOOKS: '/staff/overdue-books',
  STAFF_REPORTS: '/staff/reports',

  // User
  USER_DASHBOARD: '/user/dashboard',
  USER_CATALOG: '/user/catalog',
  USER_HISTORY: '/user/history',
  USER_BORROW: '/user/borrow',
  USER_RETURN: '/user/return',
  USER_FINES: '/user/fines',
  USER_NOTIFICATIONS: '/user/notifications',
  USER_PROFILE: '/user/profile',
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  MEMBER: 'MEMBER',
} as const;

export const ISSUE_STATUS = {
  ISSUED: 'ISSUED',
  RETURNED: 'RETURNED',
  OVERDUE: 'OVERDUE',
} as const;

export const FINE_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  WAIVED: 'WAIVED',
} as const;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export const BOOK_CATEGORIES = [
  'Fiction',
  'Science',
  'History',
  'Technology',
  'Literature',
  'Mathematics',
  'Philosophy',
  'Art',
  'Biography',
  'Self-Help',
  'Business',
  'Other',
] as const;

export const MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGIN_FAILED: 'Invalid credentials',
  REGISTER_SUCCESS: 'Registration successful. Please wait for approval.',
  BOOK_ADDED: 'Book added successfully',
  BOOK_UPDATED: 'Book updated successfully',
  BOOK_DELETED: 'Book deleted successfully',
  BOOK_ISSUED: 'Book issued successfully',
  BOOK_RETURNED: 'Book returned successfully',
  FINE_PAID: 'Fine paid successfully',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_UNAUTHORIZED: 'You are not authorized to perform this action.',
  ERROR_NOT_FOUND: 'Resource not found.',
} as const;
