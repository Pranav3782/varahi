"use client";

import React from 'react';
import Image from 'next/image';

const NATIVE_CARDS = [
  {
    title: "From Native Geographies",
    subtitle: "to Ideal Growing Seasons",
    desc: "We take care of every factor when sourcing local ingredients.",
    image: "https://vivanfa.sirv.com/ChatGPT%20Image%20Sep%2011%2C%202026%2C%2001_02_36%20AM.png",
  },
  {
    title: "What Do We Look For?",
    subtitle: "Nutrition over Cost",
    desc: "Not high yield. Not lower cost. Just flavour, nutrition, and soul.",
    image: "https://vivanfa.sirv.com/ChatGPT%20Image%20Sep%2011%2C%202026%2C%2001_02_43%20AM.png",
  },
  {
    title: "Impurities, Out.",
    subtitle: "Goodness, In.",
    desc: "Only the best seeds & purest milk make the cut from our Gujarat farms.",
    image: "https://vivanfa.sirv.com/ChatGPT%20Image%20Sep%2011%2C%202026%2C%2001_03_02%20AM.png",
  },
  {
    title: "Native Heritage",
    subtitle: "A2 Gir Milk & Seeds",
    desc: "We dare you to find better native ingredients than our farm direct goods.",
    image: "https://vivanfa.sirv.com/ChatGPT%20Image%20Sep%2011%2C%202026%2C%2011_51_13%20AM.png",
  }
];

export const NativeSection: React.FC = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.firstElementChild?.clientWidth || 1;
    const index = Math.round(scrollPosition / (cardWidth + 16));
    setActiveIndex(Math.min(Math.max(index, 0), NATIVE_CARDS.length - 1));
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.firstElementChild?.clientWidth || 0;
    container.scrollTo({
      left: index * (cardWidth + 16),
      behavior: 'smooth'
    });
  };

  return (
    <section className="py-8 md:py-24 bg-[#F9F6EF] border-t border-border/50 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="font-headline text-3xl md:text-6xl font-extrabold text-primary leading-tight">
            Native Ingredients. No Substitutes.
          </h2>
          <div className="w-24 h-1 bg-primary/20 mx-auto mt-4 md:mt-6 rounded-full"></div>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 md:gap-6 -mx-5 px-5 md:mx-0 md:px-0 pb-4 md:pb-0 scroll-smooth touch-pan-x"
        >
          {NATIVE_CARDS.map((card, i) => (
            <div 
              key={i} 
              className="relative min-w-[82vw] sm:min-w-[320px] md:min-w-0 md:w-full aspect-[4/5] rounded-[20px] md:rounded-[24px] overflow-hidden group shadow-lg bg-white shrink-0 snap-center"
            >
              <Image 
                src={card.image}
                alt={card.title}
                fill
                referrerPolicy="no-referrer"
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 85vw, 350px"
              />
            </div>
          ))}
        </div>

        {/* Mobile Carousel Indicators */}
        <div className="flex md:hidden justify-center items-center gap-2 mt-4">
          {NATIVE_CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i 
                  ? "w-6 bg-primary" 
                  : "w-2 bg-primary/25 hover:bg-primary/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
