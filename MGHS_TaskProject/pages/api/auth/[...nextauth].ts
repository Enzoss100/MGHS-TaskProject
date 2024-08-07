import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "@/app/firebase";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// Define custom user and session types
interface CustomUser extends NextAuthUser {
  id: string;
}

interface CustomSession extends Session {
  user: CustomUser;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, credentials?.email || '', credentials?.password || '');
          const user = userCredential.user;
          return { id: user.uid, email: user.email, name: user.displayName } as CustomUser;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/signin'
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      const customSession = session as CustomSession;
      customSession.user = {
        id: token.sub as string,
        email: token.email as string,
        name: token.name as string
      };
      return customSession;
    },
    async jwt({ token, user }: { token: JWT; user?: CustomUser }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    }
  }
};

export default NextAuth(authOptions);
