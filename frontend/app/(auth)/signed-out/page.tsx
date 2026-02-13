"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function SignedOutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <Logo width={120} height={40} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6"
      >
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <LogOut className="w-8 h-8 ml-1" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 font-fredoka">Signed Out</h1>
          <p className="text-slate-500">
            You have successfully signed out of your workspace. See you again soon!
          </p>
        </div>

        <div className="pt-4">
          <Link href="/login" className="w-full">
            <Button className="w-full h-11 text-base font-medium gap-2">
              Sign Back In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="text-xs text-slate-400 pt-4 border-t border-slate-100">
          Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact Support</Link>
        </div>
      </motion.div>
    </div>
  );
}
