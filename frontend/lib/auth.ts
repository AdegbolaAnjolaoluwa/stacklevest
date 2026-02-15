import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

// Update to Go backend port
const API_URL = process.env.API_URL || "http://localhost:8080";

export const authorize = async (credentials: any) => {
  if (!credentials?.email) return null;

  try {
    // Connect to our new Go Backend API
    console.log("Authorize: calling backend", { API_URL, email: credentials.email });
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        // otp: credentials.otp // TODO: Re-enable OTP in Go backend
      })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("Authorize: backend responded non-OK", { status: res.status, body: text });
      return null;
    }

    const data = await res.json();
    console.log("Authorize: backend response", data);

    // If backend indicates OTP is required
    if (data.requiresOtp) {
      console.warn("Authorize blocked: OTP required");
      return null; // TODO: handle OTP flow
    }

    const { user, token } = data;

    if (user && token) {
      console.log("Authorize success for:", credentials.email);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.avatar,
        // Custom fields - Normalize role to lowercase
        role: (user.role || "staff").toLowerCase(),
        needsOnboarding: user.needsOnboarding,
        jobTitle: user.jobTitle,
        reportingManager: user.reportingManager,
        staffNumber: user.staffNumber,
        department: user.department,
        accessToken: token, // Store JWT
      };
    }
  } catch (error) {
    console.error("Authorize error:", error);
    return null;
  }
  return null;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" }
      },
      authorize
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        (token as any).email = (user as any).email;
        token.role = (user as any).role;
        token.needsOnboarding = (user as any).needsOnboarding;
        token.jobTitle = (user as any).jobTitle;
        token.reportingManager = (user as any).reportingManager;
        token.staffNumber = (user as any).staffNumber;
        token.department = (user as any).department;
        token.accessToken = (user as any).accessToken; // Store Access Token
        token.lastRefreshed = Math.floor(Date.now() / 1000);
      }

      // Handle manual updates (if any)
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      // Periodically refresh user data from backend (every 1 hour)
      const now = Math.floor(Date.now() / 1000);
      const oneHour = 60 * 60;

      if (token.email && (!token.lastRefreshed || now - (token.lastRefreshed as number) > oneHour)) {
        try {
          const res = await fetch(`${API_URL}/api/users/email/${token.email}`);
          if (res.ok) {
            const userData = await res.json();
            token.role = (userData.role || "staff").toLowerCase();
            token.needsOnboarding = userData.needsOnboarding;
            token.jobTitle = userData.jobTitle;
            token.reportingManager = userData.reportingManager;
            token.staffNumber = userData.staffNumber;
            token.department = userData.department;
            token.lastRefreshed = now;
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).needsOnboarding = token.needsOnboarding;
        (session.user as any).id = token.sub;
        (session.user as any).jobTitle = token.jobTitle;
        (session.user as any).reportingManager = token.reportingManager;
        (session.user as any).staffNumber = token.staffNumber;
        (session.user as any).department = token.department;
        (session as any).accessToken = token.accessToken; // Pass Access Token to Session
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
};
