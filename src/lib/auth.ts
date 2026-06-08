import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        const email = credentials.email.toLowerCase();
        if (email.includes('admin')) {
          return { id: 'admin-id', email: 'admin@library.com', name: 'System Admin', role: 'ADMIN' };
        } else if (email.includes('staff')) {
          return { id: 'staff-id', email: 'staff@library.com', name: 'Library Staff', role: 'STAFF' };
        } else {
          return { id: 'member-id', email: email, name: 'Library Member', role: 'MEMBER' };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXT_PUBLIC_SECRET || 'secret',
};
