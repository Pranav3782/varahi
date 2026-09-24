"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-primary flex flex-col items-center justify-center overflow-hidden">
      {/* Background Decorative Element */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.08, scale: 1.4 }}
        transition={{ duration: 3, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
        className="absolute w-[600px] h-[600px] rounded-full bg-white pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Logo Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-32 h-32 md:w-48 md:h-48 relative mb-10 brightness-0 invert"
        >
          <Image 
            src="/mobile-logo.png"
            alt="Vivaan Farms Logo"
            fill
            className="object-contain"
            priority
          />
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-white/10 blur-2xl rounded-full"
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, letterSpacing: "12px" }}
          animate={{ opacity: 1, letterSpacing: "6px" }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="font-headline text-4xl md:text-7xl font-extrabold text-white mb-6 uppercase tracking-widest"
        >
          VIVAAN FARMS
        </motion.h1>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-0.5 bg-white/40 mb-6 rounded-full" />
          <p className="text-white/80 text-[10px] md:text-sm font-black uppercase tracking-[4px] leading-relaxed">
            Traditional Wisdom <span className="mx-2 text-white/30">|</span> Modern Purity
          </p>
        </motion.div>
      </div>

      {/* Modern Loading Indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48">
        <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          />
        </div>
        <p className="text-[8px] text-white/30 font-black uppercase tracking-[2px] mt-3 text-center animate-pulse">
          Harvesting Purity...
        </p>
      </div>
    </div>
  );
};
