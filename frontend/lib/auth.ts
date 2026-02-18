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

    const { user, accessToken, refreshToken } = data;

    if (user && accessToken) {
      console.log("Authorize success for:", credentials.email);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.avatar,
        role: (user.role || "staff").toLowerCase(),
        needsOnboarding: user.needsOnboarding,
        jobTitle: user.jobTitle,
        reportingManager: user.reportingManager,
        staffNumber: user.staffNumber,
        department: user.department,
        accessToken: accessToken,
        refreshToken: refreshToken, // Store for rotation
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
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken; // For rotation
        (token as any).accessTokenExpiresAt = Math.floor(Date.now() / 1000) + (5 * 60);
        token.lastRefreshed = Math.floor(Date.now() / 1000);
      }

      // Handle manual updates (if any)
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      // Periodically refresh user data from backend (optional, but keep it if needed)
      // BUT prioritized: Check if Access Token is expired (5 mins)
      const now = Math.floor(Date.now() / 1000);
      const accessTokenExpiresAt = (token as any).accessTokenExpiresAt || 0;

      // If token expires in less than 30 seconds, refresh it
      if (now > accessTokenExpiresAt - 30) {
        console.log("AccessToken expiring soon, attempting refresh...");
        try {
          const res = await fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Since refreshToken is in HttpOnly cookie, we need to pass it
              // Wait, if it's in a cookie, the server-side fetch won't have it unless we pass it.
              // But we also stored it in the token as fallback.
              "Cookie": `refreshToken=${(token as any).refreshToken}`
            },
          });

          if (res.ok) {
            const data = await res.json();
            console.log("Token rotation successful");
            return {
              ...token,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken || (token as any).refreshToken, // Rotate if provided
              accessTokenExpiresAt: now + (5 * 60),
            };
          } else {
            console.warn("Token rotation failed, forcing logout");
            return { ...token, error: "RefreshAccessTokenError" };
          }
        } catch (error) {
          console.error("Refresh fetch error:", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      // Existing user data refresh (every 1 hour)
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
          console.error("User data sync failed:", error);
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
        (session.user as any).accessToken = token.accessToken; // Pass to user object too
        (session as any).accessToken = token.accessToken;
        (session as any).error = token.error; // Pass error for client-side redirect
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
