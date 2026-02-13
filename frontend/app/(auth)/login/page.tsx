"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedSplashCard } from "@/components/AnimatedSplashCard";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      return `http://${window.location.hostname}:8082`;
    }
    return 'http://localhost:8082';
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Direct sign in without OTP
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Network error. Is the server running?");
    } finally {
      setIsLoading(false);
    }
  };

  // Render Email Step (Existing Design)
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Logo width={120} height={40} />
        </div>
        <Button variant="ghost" className="text-sm font-medium">
          Contact Support
        </Button>
      </header>

      <main className="flex-1 flex">
        {/* Left Column - Hero Image */}
        <div className="hidden md:flex w-1/2 p-8 items-center justify-center bg-slate-50">
          <AnimatedSplashCard />
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 font-fredoka">
                Welcome back
              </h1>
              <p className="text-slate-500">
                Enter your details to access your team's workspace.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@stacklevest.com" 
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  icon={<Lock className="w-4 h-4" />}
                />
              </div>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <Button className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Loading..." : "Login"}
              </Button>
            </form>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Demo Accounts</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => { setEmail("abutankokingdavid@stacklevest.com"); setPassword("password123"); setError(""); }}
                  className="text-left text-xs p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                >
                  <div className="font-semibold text-slate-900">David (Admin)</div>
                  <div className="text-slate-500">Full access</div>
                </button>
                <button 
                  type="button"
                  onClick={() => { setEmail("anjeesax@gmail.com"); setPassword("password123"); setError(""); }}
                  className="text-left text-xs p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                >
                  <div className="font-semibold text-slate-900">Anjola (Member)</div>
                  <div className="text-slate-500">Engineering</div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 text-xs text-slate-400">
               <span>Protected by enterprise-grade security.</span>
               <div className="space-x-4">
                 <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                 <Link href="#" className="hover:underline">Terms of Service</Link>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}