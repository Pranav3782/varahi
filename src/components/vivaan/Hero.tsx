"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_BANNERS = [
  {
    id: 'banner-1',
    url: 'https://vivanfa.sirv.com/ChatGPT%20Image%20Sep%208%2C%202026%2C%2008_07_53%20AM.png',
    alt: 'Vivaan Farms - Pure A2 Gir Cow Bilona Ghee & Natural Farm Goods'
  },
  {
    id: 'banner-2',
    url: 'https://vivanfa.sirv.com/ChatGPT%20Image%20Sep%208%2C%202026%2C%2008_07_57%20AM.png',
    alt: 'Vivaan Farms - Traditional Vedic Bilona Method A2 Ghee'
  },
  {
    id: 'banner-3',
    url: 'https://vivanfa.sirv.com/ChatGPT%20Image%20Sep%208%2C%202026%2C%2008_08_08%20AM.png',
    alt: 'Vivaan Farms - Authentic Organic Farm in Gujarat'
  }
];

export const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isMouseDown = useRef<boolean>(false);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % HERO_BANNERS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length);
  }, []);

  // Auto-slide interval (6 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35; // px

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDown.current = true;
    touchStartX.current = e.clientX;
    touchEndX.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0.8,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <section className="w-full bg-[#F9F6EF] px-0 relative overflow-hidden select-none touch-pan-y">
      <div 
        className="relative w-full aspect-[16/7] md:aspect-[2.8/1] overflow-hidden shadow-sm bg-[#F9F6EF] cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={HERO_BANNERS[currentIndex].id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={HERO_BANNERS[currentIndex].url}
              alt={HERO_BANNERS[currentIndex].alt}
              fill
              priority
              loading="eager"
              sizes="100vw"
              className="object-cover object-center w-full h-full pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Swipe Visual Hint for Mobile */}
        <div className="absolute top-3 right-3 z-20 md:hidden bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs pointer-events-none">
          <span className="inline-block animate-pulse">👈 Swipe 👉</span>
        </div>

        {/* Navigation Indicator Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
          {HERO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-white shadow-xs' : 'w-1.5 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


