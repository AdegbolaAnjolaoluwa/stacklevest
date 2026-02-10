"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Smooth progress simulation
        const increment = Math.random() * 2 + 1.5;
        return Math.min(prev + increment, 100);
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#020617] overflow-hidden font-sans text-slate-900">
       {/* Background Grid */}
       <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
         <svg height="100%" width="100%">
           <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
             <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"></path>
           </pattern>
           <rect fill="url(#grid)" height="100%" width="100%"></rect>
         </svg>
       </div>

       {/* Main Content */}
       <div className="relative z-10 flex flex-col items-center">
          {/* Logo Container - Floating Animation */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center scale-75 md:scale-100"
          >
             {/* Shield Graphic */}
             <div className="relative w-64 h-72 border-[10px] border-[#111827] dark:border-slate-400/20 rounded-[40px] rounded-b-[60px] flex items-end justify-center pb-12 gap-4 px-8 bg-white dark:bg-slate-900/50 backdrop-blur-sm shadow-2xl">
                {/* Navy Bar */}
                <div className="w-12 h-24 bg-[#111827] dark:bg-slate-700 rounded-full shadow-lg"></div>
                {/* Blue Bar */}
                <div className="w-12 h-40 bg-[#3b82f6] rounded-full shadow-lg shadow-blue-500/20"></div>
                {/* Purple Bar */}
                <div className="relative w-12 h-56 bg-[#8b5cf6] rounded-full shadow-lg shadow-purple-500/20">
                   {/* Coin */}
                   <motion.div 
                     animate={{ filter: ["brightness(1)", "brightness(1.3) drop-shadow(0 0 10px rgba(250, 204, 21, 0.6))", "brightness(1)"] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute -top-12 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white/20"
                   >
                      <span className="text-white font-bold text-2xl select-none">$</span>
                      <div className="absolute inset-1 border border-white/30 rounded-full"></div>
                   </motion.div>
                </div>
             </div>

             {/* Text */}
             <div className="mt-12 text-center">
                <h1 className="text-7xl font-extrabold tracking-tight flex items-baseline">
                   <span className="text-[#111827] dark:text-slate-100">Stackle</span>
                   <span className="text-[#3b82f6]">Vest</span>
                </h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold tracking-[0.3em] text-sm uppercase">
                   Smart Money Companion
                </p>
             </div>
          </motion.div>

          {/* Loading Bar */}
          <div className="absolute -bottom-48 w-full max-w-xs px-8">
             <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#3b82f6] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                />
             </div>
             <p className="text-center mt-4 text-xs font-medium text-slate-400 dark:text-slate-600 tracking-wider">
                INITIALIZING WORKSPACE...
             </p>
          </div>
       </div>
    </div>
  );
}
