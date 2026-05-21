// lib/auth.ts
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from 'bcrypt';
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from './db';

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    phone: string;
    role: string;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      phone: string;
      role: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          phone: user.phone,
          role: user.role,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          phone: token.phone,
          role: token.role,
        }
      }
    },
  },
  pages: {
    signIn: '/auth/sign-in'
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!existingUser) {
          return null;
        }

        const passwordMatch = await compare(credentials.password, existingUser.passwordHash);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
          phone: existingUser.phone,
          role: existingUser.role,
          name: `${existingUser.firstName} ${existingUser.lastName}`,
        }
      },
      credentials: {
        email: { label: "Email", placeholder: "jsmith@gmail.com", type: "email" },
        password: { label: "Password", type: "password" }
      },
      name: "Credentials",
    })
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
}