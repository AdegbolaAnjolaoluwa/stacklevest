"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Shield, User, Building2, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordStep } from "@/components/onboarding/password-step";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { ProfileStep } from "@/components/onboarding/profile-step";
import { SecurityStep } from "@/components/onboarding/security-step";
import Silk from "@/components/Silk";
import { Logo } from "@/components/logo";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const finishOnboarding = () => {
    router.push("/dashboard");
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background Effect for Step 2 (Welcome) */}
      {step === 2 && (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <Silk color="#3b82f6" speed={2} />
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo width={120} height={40} />
        </div>
        {step > 1 && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
             {step === 1 && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold uppercase">Security Check</span>}
             {step === 3 && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold uppercase">Onboarding Mode</span>}
             {step === 4 && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold uppercase">Employee Access</span>}
             {step === 4 && <Lock className="w-4 h-4" />}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col"
          >
            {step === 1 && <PasswordStep onNext={nextStep} />}
            {step === 2 && <WelcomeStep onNext={nextStep} />}
            {step === 3 && <ProfileStep onNext={nextStep} onPrev={prevStep} />}
            {step === 4 && <SecurityStep onFinish={finishOnboarding} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer / Progress Steps (Only for Step 2 as per design) */}
      {step === 2 && (
        <footer className="relative z-10 pb-12 pt-6">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-between items-center relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10" />
              
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-blue-600">Identity</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-500">Department</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-500">Security Briefing</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
