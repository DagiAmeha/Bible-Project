import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    // ✅ Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ✅ Email/password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await connectDB();

        // 1️⃣ Find user by email
        const user = await User.findOne({ email: credentials?.email });
        if (!user) throw new Error("No user found with this email");

        // 2️⃣ Compare passwords
        const isValid = await bcrypt.compare(credentials!.password!, user.password!);
        if (!isValid) throw new Error("Invalid password");
        

        // 3️⃣ Return user object
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  // ✅ Store session as JWT (not in DB)
  session: { strategy: "jwt" },


  // ✅ Callbacks for Google & JWT handling
  callbacks: {
    // When a user signs in (Google or credentials)
    async signIn({ user, account }) {
      await connectDB();

      // Handle Google users — create in DB if not exists and fetch role
      if (account?.provider === "google") {
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            provider: "google",
            role: "user", // Default role for new Google users
          });
          // Set role on user object for JWT callback
          user.role = "user";
        } else {
          // Fetch role from existing user
          user.role = existingUser.role || "user";
          user.id = existingUser._id.toString();
        }
      }

      // For credentials provider, fetch role from database if not already set
      if (account?.provider === "credentials" && user.email) {
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          user.role = dbUser.role || "user";
          user.id = dbUser._id.toString();
        }
      }

      return true; // allow sign-in
    },

    // Add custom data to JWT
    async jwt({ token, user, trigger }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email || "";
        
        // Fetch role from database to ensure it's always current
        if (token.email) {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.role = dbUser.role || "user";
            token.id = dbUser._id.toString();
          } else {
            token.role = user.role || "user";
          }
        } else {
          token.role = user.role || "user";
        }
      }

      // On session update, refresh user data from database
      if (trigger === "update" && token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role || "user";
          token.id = dbUser._id.toString();
        }
      }

      return token;
    },

    // Make data available in session (on client side)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },
  },

  // ✅ Secret for token encryption
  secret: process.env.NEXTAUTH_SECRET!,
});

export { handler as GET, handler as POST };
