"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Layers, ArrowLeft, ShieldCheck, Clock, Headset, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedSplashCard } from "@/components/AnimatedSplashCard";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    if (step === "otp") {
      // Focus first input when entering OTP step
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    const combinedOtp = newOtpValues.join("");
    setOtp(combinedOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.length === 0) return;

    const newOtpValues = [...otpValues];
    pastedData.forEach((char, index) => {
      if (index < 6 && !isNaN(Number(char))) {
        newOtpValues[index] = char;
      }
    });
    setOtpValues(newOtpValues);
    setOtp(newOtpValues.join(""));
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      return `http://${window.location.hostname}:8080`;
    }
    return 'http://localhost:8080';
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setTimer(59);
    setOtpValues(["", "", "", "", "", ""]);
    setOtp("");
    inputRefs.current[0]?.focus();
    
    // Call login API again to trigger OTP
    try {
      await fetch(`${getApiUrl()}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      console.error("Failed to resend OTP");
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${getApiUrl()}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requiresOtp) {
          setStep("otp");
          setTimer(59); // Reset timer on new send
        } else {
          // No OTP needed (Regular Login) -> Sign In directly
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
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Is the server running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call NextAuth sign in with OTP
      const result = await signIn("credentials", {
        email,
        otp,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid OTP code");
        setIsLoading(false);
      } else {
        // Success - Check if onboarding is needed
        // Note: We can't easily check 'needsOnboarding' from here unless we fetch user data again
        // OR we just redirect to dashboard and let Middleware/Layout handle it.
        // But for now, let's just push to dashboard, and we'll add a redirect in a separate effect or check.
        // Actually, better: We know we just used OTP, which ONLY happens for onboarding users.
        router.push("/onboarding");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Render OTP Step (New Design)
  if (step === "otp") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4">
        <div className="flex flex-col items-center mb-8">
          <Logo width={160} height={50} className="mb-4" />
          <p className="text-slate-500 text-sm">Bespoke Workspace Platform</p>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Secure Verification</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Verification Code Sent. Please enter the 6-digit code sent to your registered email address.
              </p>
              <div className="mt-2 text-sm font-medium text-slate-900">{email}</div>
            </div>

            <form onSubmit={handleOtpVerify} className="space-y-8">
              <div className="flex justify-between gap-2">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-semibold border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white"
                  />
                ))}
              </div>

              {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}

              <Button 
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all" 
                size="lg" 
                disabled={isLoading || otp.length < 6}
              >
                {isLoading ? "Verifying..." : "Verify Identity"} 
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>Didn't receive the code?</span>
                {timer > 0 ? (
                  <span className="text-slate-400">Resend in 0:{timer.toString().padStart(2, '0')}</span>
                ) : (
                  <button onClick={handleResend} className="text-blue-600 font-semibold hover:underline">
                    Resend
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-2">
                 <button 
                   onClick={() => setStep("email")}
                   className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                 >
                   <ArrowLeft className="w-3 h-3" />
                   Back to login
                 </button>
              </div>
              
              <div className="flex items-center justify-center pt-2">
                 <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                    <Headset className="w-4 h-4" />
                    <span>Contact Support</span>
                 </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-slate-300 tracking-widest uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>End-to-end encrypted auth</span>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-slate-900">
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
                {isLoading ? "Loading..." : "Verify & Send Code"}
              </Button>
            </form>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Demo Accounts</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => { setEmail("david@stacklevest.com"); setPassword("password123"); setError(""); }}
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