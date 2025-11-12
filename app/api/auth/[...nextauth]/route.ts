import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// ✅ Export this so you can import it elsewhere (for getServerSession)
export const authOptions: NextAuthOptions = {
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

        const user = await User.findOne({ email: credentials?.email });
        if (!user) throw new Error("No user found with this email");

        const isValid = await bcrypt.compare(credentials!.password!, user.password!);
        if (!isValid) throw new Error("Invalid email or password");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    // 🔹 Sign in logic for both Google and credentials
    async signIn({ user, account }) {
      await connectDB();

      if (account?.provider === "google") {
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            provider: "google",
            role: "user",
          });
          user.role = "user";
        } else {
          user.role = existingUser.role || "user";
          user.id = existingUser._id.toString();
        }
      }

      if (account?.provider === "credentials" && user.email) {
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          user.role = dbUser.role || "user";
          user.id = dbUser._id.toString();
        }
      }

      return true;
    },

    // 🔹 Add user info to JWT token
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email || "";

        if (token.email) {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          token.role = dbUser?.role || user.role || "user";
          token.id = dbUser?._id.toString() || user.id;
        } else {
          token.role = user.role || "user";
        }
      }

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

    // 🔹 Expose data to client session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
};

// ✅ Create the handler from authOptions
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
