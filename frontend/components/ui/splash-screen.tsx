"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");
  
  // Animation stages based on progress
  const showBottomBlock = progress > 10;
  const showMiddleBlock = progress > 40;
  const showTopBlock = progress > 70;
  const isReady = progress === 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        
        // Non-linear progress simulation
        const increment = Math.random() * 2 + 0.5;
        const newProgress = Math.min(prev + increment, 100);
        
        // Update text based on progress
        if (newProgress < 30) setLoadingText("Initializing...");
        else if (newProgress < 60) setLoadingText("Configuring modules...");
        else if (newProgress < 90) setLoadingText("Assembling blocks...");
        else setLoadingText("Ready");
        
        return newProgress;
      });
    }, 30); // Adjust speed here

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 800); // Slight delay after completion before unmounting
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 overflow-hidden">
      {/* Background Ripple Effect */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-[600px] h-[600px] rounded-full border border-slate-200"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.05, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-[800px] h-[800px] rounded-full border border-slate-200"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Stack Animation */}
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          {/* Bottom Block */}
          <AnimatePresence>
            {showBottomBlock && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 16, scale: 1 }}
                className="absolute w-16 h-8 bg-blue-700 rounded-lg shadow-lg"
                style={{ zIndex: 1 }}
              />
            )}
          </AnimatePresence>

          {/* Middle Block */}
          <AnimatePresence>
            {showMiddleBlock && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute w-16 h-8 bg-blue-500 rounded-lg shadow-md"
                style={{ zIndex: 2 }}
              />
            )}
          </AnimatePresence>

          {/* Top Block */}
          <AnimatePresence>
            {showTopBlock && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                animate={{ opacity: 1, y: -16, scale: 1 }}
                className="absolute w-16 h-8 bg-slate-700 rounded-lg shadow-sm flex items-center justify-center"
                style={{ zIndex: 3 }}
              >
                {isReady && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">StackleVest</h1>
          <p className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase">
            Productivity Reimagined
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-64">
          <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
            <span className="min-w-[120px]">{loadingText}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
