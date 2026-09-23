"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Star, ShoppingCart, ArrowRight, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { JarIcon, ComboIcon } from "../vivaan/JarIcon";

// Default descriptions by category for carousel products missing a description
const CAROUSEL_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  ghee: 'Pure A2 Gir Cow Bilona Ghee, hand-churned using traditional methods.',
  honey: 'Raw unprocessed forest honey, ethically harvested from wild bee colonies.',
  sweets: 'Artisanal farm sweets made with pure A2 ghee & jaggery.',
  combo: 'Curated combo of our finest farm-fresh products.',
  default: 'Farm-fresh, naturally pure & crafted with tradition.',
};

export interface CarouselProduct {
  id: string | number;
  name: string;
  description?: string;
  quantity?: string;
  vol?: string;
  price: number;
  originalPrice?: number;
  mrpPrice?: number;
  discount?: string;
  off?: string;
  deliveryTime?: string;
  imageUrl?: string;
  imageUrls?: string[];
  rating?: number;
  reviewCount?: number;
  badges?: string[];
  cat?: string;
  pi?: number;
  isInCart?: boolean;
}

export interface ProductCardProps {
  product: CarouselProduct;
  onAdd?: (product: CarouselProduct) => void;
  onClick?: (product: CarouselProduct) => void;
  isInCart?: boolean;
}

export interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: CarouselProduct[];
  viewAllHref?: string;
  onViewAll?: () => void;
  onAddToCart?: (product: CarouselProduct) => void;
  onProductClick?: (product: CarouselProduct) => void;
  cartIds?: (string | number)[];
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAdd, 
  onClick,
  isInCart: externalIsInCart
}) => {
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice || product.mrpPrice) || 0;
  const quantity = product.quantity || product.vol || "500 ml";
  const deliveryTime = product.deliveryTime || "SAME DAY";
  
  const startPos = React.useRef<{ x: number; y: number } | null>(null);
  const isSwiping = React.useRef<boolean>(false);

  const discountText = product.discount || product.off || (
    originalPrice > price 
      ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF` 
      : undefined
  );

  const isInCart = externalIsInCart || product.isInCart;

  // Smart description with category fallback
  const description = (() => {
    if (product.description && product.description.trim() && product.description.trim() !== product.name.trim()) {
      return product.description;
    }
    return CAROUSEL_CATEGORY_DESCRIPTIONS[product.cat || 'default'] || CAROUSEL_CATEGORY_DESCRIPTIONS['default'];
  })();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Mobile haptic vibration if supported
    if (typeof window !== 'undefined' && 'navigator' in window && typeof window.navigator.vibrate === 'function') {
      try { window.navigator.vibrate(10); } catch {}
    }
    if (onAdd) {
      onAdd(product);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    isSwiping.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const deltaX = Math.abs(e.clientX - startPos.current.x);
    const deltaY = Math.abs(e.clientY - startPos.current.y);
    if (deltaX > 8 || deltaY > 8) {
      isSwiping.current = true;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isSwiping.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onClick) {
      onClick(product);
    }
  };

  const renderImage = () => {
    const mainImage = product.imageUrl || (product.imageUrls && product.imageUrls[0]);
    const altImage = product.imageUrls && product.imageUrls.length > 1 ? product.imageUrls[1] : null;

    if (mainImage) {
      return (
        <div className="relative w-full h-full">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-105 pointer-events-none",
              altImage ? "group-hover:opacity-0" : "opacity-100"
            )}
            sizes="(max-width: 640px) 180px, 240px"
          />
          {altImage && (
            <Image
              src={altImage}
              alt={`${product.name} alternate`}
              fill
              className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              sizes="(max-width: 640px) 180px, 240px"
            />
          )}
        </div>
      );
    }

    if (product.cat === 'combo') {
      return <ComboIcon className="scale-75 md:scale-90" />;
    }

    return (
      <JarIcon
        c1={((Number(product.pi) || 0) % 2 === 0) ? '#D4EDE0' : '#EBF5EE'}
        c2={((Number(product.pi) || 0) % 2 === 0) ? '#1B5E3B' : '#0D3520'}
        sub=""
        idSuffix={String(product.id)}
        className="scale-75 md:scale-90"
      />
    );
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className="group relative w-[170px] sm:w-[210px] md:w-[240px] h-[370px] sm:h-[400px] md:h-[430px] flex-shrink-0 cursor-pointer select-none snap-start touch-pan-x"
    >
      <div className="flex flex-col h-full overflow-hidden rounded-2xl md:rounded-3xl border border-[#E8ECE9] bg-white transition-all duration-300 hover:shadow-xl hover:border-primary/20">
        {/* Top Section: Fixed Height Image Area */}
        <div className="relative h-[150px] sm:h-[175px] md:h-[200px] w-full bg-[#FAF8F5] p-2 md:p-3 flex items-center justify-center overflow-hidden border-b border-[#F2ECE1] shrink-0">
          {discountText && (
            <div className="absolute left-1.5 top-1.5 z-10 rounded-full bg-primary px-1.5 py-0.5 text-[9px] md:text-[10px] font-black text-white shadow-xs">
              {discountText}
            </div>
          )}

          {product.badges && product.badges.length > 0 && (
            <div className="absolute right-1.5 top-1.5 z-10 rounded-full bg-[#D4A017] px-1.5 py-0.5 text-[7px] md:text-[9px] font-extrabold uppercase text-white shadow-xs">
              {product.badges[0]}
            </div>
          )}

          <div className="relative z-0 h-full w-full flex items-center justify-center pointer-events-none">
            {renderImage()}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 justify-between p-2.5 sm:p-3 md:p-4 gap-1 overflow-hidden">
          <div className="space-y-1 md:space-y-1.5 flex-1 min-h-0">
            {/* Delivery Time / Volume & Rating */}
            <div className="flex items-center justify-between text-[9px] md:text-xs font-bold text-[#7A6848] h-5">
              <div className="flex items-center space-x-1 text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 shrink-0">
                <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 text-emerald-600" />
                <span className="text-[8px] md:text-[10px] font-extrabold uppercase">{deliveryTime}</span>
              </div>

              {product.rating ? (
                <div className="flex items-center gap-0.5 bg-[#FFF8E7] px-1.5 py-0.5 rounded-md border border-[#F5D110]/30 shrink-0">
                  <Star className="w-2.5 h-2.5 text-[#F5D110] fill-current" />
                  <span className="font-black text-[#100C06] text-[9px] md:text-xs">{product.rating}</span>
                </div>
              ) : (
                <span className="text-[9px] font-extrabold text-primary bg-primary/5 px-2 py-0.5 rounded-md truncate max-w-[80px]">
                  {quantity}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h3 className="font-headline text-[11px] sm:text-xs md:text-sm font-bold text-[#100C06] leading-snug line-clamp-2 h-[2.4em] md:h-[2.6em] group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Description — fills the white gap */}
            <p className="text-[9px] sm:text-[10px] md:text-[11px] text-[#8C8275] font-medium leading-relaxed line-clamp-2 h-[2.6em] md:h-[2.8em]">
              {description}
            </p>

            {/* Purity Indicator */}
            <div className="flex items-center gap-1 pt-0.5">
              <Leaf className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
              <span className="text-[8px] sm:text-[9px] font-bold text-emerald-700 uppercase tracking-wider truncate">
                100% Natural · {quantity}
              </span>
            </div>
          </div>

          {/* Pricing & Add Button */}
          <div className="pt-1.5 border-t border-[#F3F0E9] flex items-center justify-between gap-1.5 mt-auto shrink-0">
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-black text-primary leading-none">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {originalPrice > price && (
                <span className="text-[10px] md:text-xs text-[#8C8275] line-through font-semibold mt-0.5">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleAdd}
              className={cn(
                "h-8 md:h-9 px-2.5 md:px-3.5 rounded-xl flex items-center gap-1 text-[10px] md:text-xs font-black uppercase tracking-wider transition-all shadow-xs border-none shrink-0 cursor-pointer",
                isInCart 
                  ? "bg-emerald-800 text-white" 
                  : "bg-primary text-white hover:bg-secondary"
              )}
            >
              <span>{isInCart ? "ADDED" : "ADD"}</span>
              <ShoppingCart className="w-3 h-3 ml-0.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ProductCarousel = React.forwardRef<HTMLDivElement, ProductCarouselProps>(
  ({ 
    title, 
    subtitle,
    products, 
    viewAllHref, 
    onViewAll, 
    onAddToCart, 
    onProductClick,
    cartIds = [],
    className 
  }, ref) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [isScrollable, setIsScrollable] = React.useState(false);
    const [isAtStart, setIsAtStart] = React.useState(true);
    const [isAtEnd, setIsAtEnd] = React.useState(false);
    const isMouseDownRef = React.useRef(false);
    const startXRef = React.useRef(0);
    const scrollLeftRef = React.useRef(0);

    const handleScroll = (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
        scrollContainerRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    };

    const checkScrollState = React.useCallback(() => {
      const el = scrollContainerRef.current;
      if (!el) return;

      const scrollable = el.scrollWidth > el.clientWidth;
      setIsScrollable(scrollable);
      setIsAtStart(el.scrollLeft <= 5);
      setIsAtEnd(Math.abs(el.scrollWidth - el.scrollLeft - el.clientWidth) <= 10);
    }, []);

    React.useEffect(() => {
      checkScrollState();
      const el = scrollContainerRef.current;
      el?.addEventListener("scroll", checkScrollState, { passive: true });
      window.addEventListener("resize", checkScrollState);

      return () => {
        el?.removeEventListener("scroll", checkScrollState);
        window.removeEventListener("resize", checkScrollState);
      };
    }, [checkScrollState, products]);

    const handleMouseDown = (e: React.MouseEvent) => {
      const el = scrollContainerRef.current;
      if (!el) return;
      isMouseDownRef.current = true;
      startXRef.current = e.pageX - el.offsetLeft;
      scrollLeftRef.current = el.scrollLeft;
    };

    const handleMouseLeave = () => {
      isMouseDownRef.current = false;
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isMouseDownRef.current) return;
      const el = scrollContainerRef.current;
      if (!el) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startXRef.current) * 1.5;
      el.scrollLeft = scrollLeftRef.current - walk;
    };

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.08,
        },
      },
    };

    const handleViewAllClick = (e: React.MouseEvent) => {
      if (onViewAll) {
        e.preventDefault();
        onViewAll();
      }
    };

    return (
      <section className={cn("relative w-full space-y-2 md:space-y-4 py-4 md:py-8 select-none", className)} ref={ref}>
        {/* Header */}
        <div className="flex items-end justify-between px-4 sm:px-6 md:px-10">
          <div>
            {subtitle && (
              <span className="text-[9px] md:text-xs font-black uppercase tracking-[2px] text-primary block mb-0.5">
                {subtitle}
              </span>
            )}
            <h2 className="font-headline text-xl sm:text-2xl md:text-4xl font-extrabold text-[#100C06] tracking-tight">
              {title}
            </h2>
          </div>

          {(viewAllHref || onViewAll) && (
            <a
              href={viewAllHref || "#"}
              onClick={handleViewAllClick}
              className="inline-flex items-center gap-1 text-xs md:text-sm font-extrabold text-primary hover:text-secondary uppercase tracking-wider transition-colors group"
            >
              <span>See All</span>
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform group-hover:translate-x-1" />
            </a>
          )}
        </div>

        {/* Mobile Swipe Hint */}
        {isScrollable && (
          <div className="md:hidden flex items-center gap-1 text-[10px] font-bold text-[#7A6848]/70 px-4 pt-0.5">
            <span className="animate-pulse">👈 Swipe cards to explore 👉</span>
          </div>
        )}

        {/* Carousel Outer Wrapper */}
        <div className="relative group/carousel">
          {/* Scrollable Container */}
          <motion.div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="no-scrollbar flex space-x-3 sm:space-x-4 md:space-x-6 overflow-x-auto px-4 sm:px-6 md:px-10 py-2 snap-x snap-mandatory scroll-smooth touch-pan-x cursor-grab active:cursor-grabbing"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isInCart={cartIds.some(id => String(id) === String(product.id))}
                onAdd={onAddToCart}
                onClick={onProductClick}
              />
            ))}
          </motion.div>

          {/* Navigation Arrows for Desktop/Tablet */}
          {isScrollable && (
            <>
              {!isAtStart && (
                <button
                  onClick={() => handleScroll("left")}
                  aria-label="Scroll left"
                  className={cn(
                    "hidden md:flex absolute left-2 sm:left-4 top-1/2 z-20 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full border border-[#E8ECE9] bg-white text-primary p-0 shadow-lg transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 active:scale-95 items-center justify-center cursor-pointer"
                  )}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {!isAtEnd && (
                <button
                  onClick={() => handleScroll("right")}
                  aria-label="Scroll right"
                  className={cn(
                    "hidden md:flex absolute right-2 sm:right-4 top-1/2 z-20 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full border border-[#E8ECE9] bg-white text-primary p-0 shadow-lg transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 active:scale-95 items-center justify-center cursor-pointer"
                  )}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </>
          )}
        </div>
      </section>
    );
  }
);

ProductCarousel.displayName = "ProductCarousel";
