"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedSplashCard } from "@/components/AnimatedSplashCard";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900">StackleVest</span>
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
              <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
              <p className="text-slate-500">Enter your details to access your team&apos;s workspace.</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@stacklevest.com" 
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••••••" 
                  icon={<Lock className="w-4 h-4" />}
                />
              </div>

              <Button className="w-full" size="lg">
                Sign In
              </Button>
            </form>

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
