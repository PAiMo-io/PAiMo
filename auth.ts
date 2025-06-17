import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import connect from "@/utils/mongoose";
import User from "@/models/User";

// Extend the default session user type to include id and role
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      clubs?: string[];
    };
  }
}

// Extend JWT to carry the user role
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    clubs?: string[];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connect();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user._id.toString(), email: user.email, name: user.username };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      await connect();
      let dbUser = null;
      if (user && user.email) {
        dbUser = await User.findOne({ email: user.email });
      } else if (token.id) {
        dbUser = await User.findById(token.id);
      }
      if (dbUser) {
        token.id = dbUser._id.toString();
        token.role = dbUser.role || null;
        token.clubs = dbUser.clubs ? dbUser.clubs.map((c: any) => c.toString()) : [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        session.user.role = (token.role as string) || null;
        session.user.clubs = (token.clubs as string[]) || [];
      }
      return session;
    },
    async signIn({ user }) {
      await connect();
      const existingUser = await User.findOne({ email: user.email });

      if (existingUser) {
        return true;
      } else {
        // If user does not exist, create a new user
        await User.create({
          email: user.email,
          image: user.image,
          clubs: [],
        });
      }
      // Redirect new users to create-profile
      return "/create-profile";
    },
    async redirect({ url, baseUrl }) {
      // If redirecting to create-profile, allow it
      if (url.startsWith(`${baseUrl}/create-profile`)) {
        return url;
      }
      // Otherwise, send to /user
      return `${baseUrl}/user`;
    },
  },
}

export default NextAuth(authOptions)
