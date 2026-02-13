"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Handle password reset logic here
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[400px] space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col items-center text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center relative"
            >
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Mail className="w-10 h-10 text-blue-700 fill-blue-700" />
              </motion.div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="absolute top-5 right-5 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm"
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full ring-2 ring-blue-100" />
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="space-y-2"
            >
              <h1 className="text-2xl font-bold text-slate-900 font-fredoka">Check your email</h1>
              <p className="text-slate-500 text-sm px-4 leading-relaxed">
                We&apos;ve sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>. Please check your inbox and follow the instructions.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Button 
                className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-semibold" 
                size="lg"
                onClick={() => router.push("/login")}
              >
                Return to Login
              </Button>
              
              <div className="flex justify-center">
                <p className="text-sm text-slate-500">
                  Didn&apos;t receive the email?{" "}
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Click to resend
                  </button>
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Link 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSubmitted(false);
                }}
                className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to forgot password
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <RotateCcw className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 font-fredoka">Forgot your password?</h1>
            <p className="text-slate-500 text-sm px-4 leading-relaxed">
              Enter your work email and we will send you a link to reset your password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold text-slate-700">Company Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@company.com"
              icon={<Mail className="w-4 h-4" />}
              required
              className="h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-semibold" size="lg">
            Send Reset Link
          </Button>
        </form>

        <div className="flex justify-center pt-2">
          <Link 
            href="/login" 
            className="flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800 gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
