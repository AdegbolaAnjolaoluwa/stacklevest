"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export const AnimatedSplashCard = () => {
  const [cycle, setCycle] = useState(0);

  // Auto-cycle the animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCycle(prev => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background Elements - Subtle/Transparent */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', 
          backgroundSize: '40px 40px' 
        }}
      />

      {/* Ambient Gradient Blobs (Light Mode Friendly) */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: ["-20%", "20%", "-20%"],
          y: ["-10%", "10%", "-10%"],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: ["20%", "-20%", "20%"],
          y: ["10%", "-10%", "10%"],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Center Stacking Animation - Scaled Up 3x */}
      <div className="relative z-10 flex flex-col items-center justify-center mb-12">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Bottom Block */}
          <motion.div
            className="absolute w-48 h-24 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20"
            style={{ zIndex: 1 }}
            animate={{
              y: [60, 48, 48, 60], 
              opacity: [0, 1, 1, 0],
              scale: [0.9, 1, 1, 0.9]
            }}
            transition={{
              duration: 4,
              times: [0.1, 0.2, 0.8, 0.9],
              repeat: Infinity,
              ease: "easeOut"
            }}
          />

          {/* Middle Block */}
          <motion.div
            className="absolute w-48 h-24 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20"
            style={{ zIndex: 2 }}
            animate={{
              y: [30, 0, 0, 30],
              opacity: [0, 1, 1, 0],
              scale: [0.9, 1, 1, 0.9]
            }}
            transition={{
              duration: 4,
              times: [0.3, 0.4, 0.8, 0.9],
              repeat: Infinity,
              ease: "easeOut"
            }}
          />

          {/* Top Block */}
          <motion.div
            className="absolute w-48 h-24 bg-slate-900 rounded-2xl shadow-2xl flex items-center justify-center"
            style={{ zIndex: 3 }}
            animate={{
              y: [0, -48, -48, 0],
              opacity: [0, 1, 1, 0],
              scale: [0.9, 1, 1, 0.9]
            }}
            transition={{
              duration: 4,
              times: [0.5, 0.6, 0.8, 0.9],
              repeat: Infinity,
              ease: "easeOut"
            }}
          >
             <motion.div
                animate={{ scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 4, times: [0.6, 0.7, 0.8, 0.9], repeat: Infinity }}
             >
                <Check className="w-10 h-10 text-white" strokeWidth={4} />
             </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="z-10 text-center space-y-4 px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Built for high-performance
          </h2>
          <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
            Experience the new standard in team productivity and communication.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
