"use client";

import { motion } from "framer-motion";
import { MessageSquare, WifiOff, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function OfflineScreen() {
  const [isChecking, setIsChecking] = useState(false);

  const handleReconnect = () => {
    setIsChecking(true);
    // Simulate checking connection
    setTimeout(() => {
      setIsChecking(false);
      if (navigator.onLine) {
        window.location.reload();
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Animated Icons Container */}
      <div className="relative w-80 h-48 mb-6 flex justify-center items-center">
        
        {/* Left Icon: Message Bubble */}
        <motion.div
          animate={{ 
            y: [-8, 8, -8],
            rotate: [-6, -12, -6]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0
          }}
          className="absolute left-10 top-8 w-20 h-20 bg-blue-600 rounded-2xl shadow-lg flex items-center justify-center -rotate-12 z-10"
        >
          <MessageSquare className="w-10 h-10 text-white fill-white" />
        </motion.div>

        {/* Right Icon: Checkmark */}
        <motion.div
          animate={{ 
            y: [-5, 5, -5],
            rotate: [6, 12, 6]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute right-12 top-10 w-16 h-16 bg-slate-200 rounded-xl shadow-md flex items-center justify-center rotate-6 z-10"
        >
          <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-slate-100" />
          </div>
        </motion.div>

        {/* Center Icon: Wifi Off */}
        <motion.div
          animate={{ 
            y: [-12, 12, -12],
            rotate: [-5, 5, -5] 
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute top-0 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center rotate-3 z-20 border border-slate-100"
        >
          <WifiOff className="w-10 h-10 text-blue-600" />
        </motion.div>
      </div>

      {/* Text Content */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center space-y-4 max-w-lg mx-auto"
      >
        <h1 className="text-3xl font-bold text-slate-900">You&apos;re currently offline.</h1>
        <p className="text-slate-500 leading-relaxed px-4">
          StackleVest requires an internet connection to sync your messages and tasks. 
          We&apos;ll reconnect as soon as you&apos;re back online.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 pb-12">
          <Button 
            className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 gap-2 h-11 px-6 shadow-md shadow-blue-700/20" 
            onClick={handleReconnect}
            disabled={isChecking}
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Reconnecting...' : 'Try Reconnecting'}
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2">
          <motion.div 
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-orange-400"
          />
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Checking connection status...
          </span>
        </div>
      </motion.div>
    </div>
  );
}
