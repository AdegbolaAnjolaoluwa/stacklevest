"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Package, Calendar, HelpCircle, LayoutGrid, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Animated Illustration */}
      <div className="relative w-64 h-64 mb-8">
        {/* Center Dashed Box with Question Mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50/50 flex items-center justify-center rotate-12 z-10"
        >
          <HelpCircle className="w-10 h-10 text-blue-400" />
        </motion.div>

        {/* Top Left - Package Box */}
        <motion.div
          animate={{ 
            y: [-10, 10, -10],
            rotate: [-5, 5, -5]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0
          }}
          className="absolute top-8 left-10 w-20 h-20 bg-blue-200 rounded-xl shadow-lg flex items-center justify-center -rotate-6 z-20"
        >
          <Package className="w-8 h-8 text-blue-700" />
        </motion.div>

        {/* Top Right - Check Box */}
        <motion.div
          animate={{ 
            y: [10, -10, 10],
            rotate: [5, -5, 5]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute top-4 right-12 w-20 h-20 bg-blue-600 rounded-xl shadow-lg flex items-center justify-center rotate-6 z-30"
        >
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
             <Check className="w-5 h-5 text-blue-600 stroke-[3]" />
          </div>
        </motion.div>

        {/* Bottom Right - Calendar Box */}
        <motion.div
          animate={{ 
            y: [-8, 8, -8],
            rotate: [-3, 3, -3]
          }}
          transition={{ 
            duration: 4.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-10 right-14 w-16 h-16 bg-white border border-slate-200 rounded-xl shadow-md flex items-center justify-center rotate-3 z-20"
        >
          <Calendar className="w-6 h-6 text-slate-400" />
        </motion.div>
      </div>

      {/* Text Content */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center space-y-4 max-w-md mx-auto"
      >
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <h2 className="text-2xl font-bold text-slate-900">Page Not Found</h2>
        <p className="text-slate-500 leading-relaxed">
          It looks like this page does not exist or the task has been moved to another project workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button 
            className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 gap-2 h-11" 
            onClick={() => router.push('/dashboard')}
          >
            <LayoutGrid className="w-4 h-4" />
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto gap-2 h-11 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
            onClick={() => router.push('/dashboard')}
          >
            <CheckCircle2 className="w-4 h-4" />
            View My Tasks
          </Button>
        </div>

        <div className="pt-8">
          <Link href="#" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline gap-1">
            Need help? Contact support
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
