"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const AnimatedSplashCard = () => {
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

      {/* Main Graphic - Shield Animation */}
      <div className="relative z-10 flex flex-col items-center justify-center mb-16 scale-90 md:scale-100">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Shield Container */}
          <div className="relative w-64 h-72 border-[10px] border-[#111827] bg-white rounded-[40px] rounded-b-[60px] flex items-end justify-center pb-12 gap-4 px-8 shadow-2xl">
            
            {/* Navy Bar - Left */}
            <motion.div 
              className="w-12 bg-[#111827] rounded-t-full shadow-lg"
              initial={{ height: "6rem" }}
              animate={{ 
                height: ["6rem", "7.5rem", "6rem"],
                filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0
              }}
            />

            {/* Blue Bar - Center */}
            <motion.div 
              className="w-12 bg-[#3b82f6] rounded-t-full shadow-lg shadow-blue-500/20"
              initial={{ height: "10rem" }}
              animate={{ 
                height: ["10rem", "11.5rem", "10rem"],
                filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1.3 // Staggered
              }}
            />

            {/* Purple Bar - Right */}
            <div className="relative w-12 h-56 flex items-end justify-center">
              <motion.div 
                className="w-12 bg-[#8b5cf6] rounded-t-full shadow-lg shadow-purple-500/20"
                initial={{ height: "13rem" }}
                animate={{ 
                  height: ["13rem", "14.5rem", "13rem"],
                  filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 2.6 // More staggered
                }}
              />
              
              {/* Coin - Floats above purple bar */}
              <motion.div 
                className="absolute -top-6 left-1/2 -translate-x-1/2 z-20"
                animate={{ 
                  y: [0, -8, 0],
                  rotateY: [0, 360]
                }}
                transition={{
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  rotateY: { duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 1 }
                }}
              >
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white/20"
                  animate={{ 
                    filter: ["brightness(1)", "brightness(1.3) drop-shadow(0 0 15px rgba(250, 204, 21, 0.8))", "brightness(1)"] 
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-white font-bold text-2xl select-none drop-shadow-md">$</span>
                  <div className="absolute inset-1 border border-white/40 rounded-full"></div>
                </motion.div>
              </motion.div>
            </div>

          </div>
        </motion.div>
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
