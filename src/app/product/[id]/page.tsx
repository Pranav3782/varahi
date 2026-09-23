"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Star, 
  Truck, 
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Plus,
  Minus,
  MessageSquare,
  History,
  FlaskConical,
  ChefHat,
  Heart,
  Share2,
  ZoomIn,
  X,
  ShoppingBag,
  Sparkles,
  Award
} from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Product } from '@/types';
import { Header } from '@/components/vivaan/Header';
import { Footer } from '@/components/vivaan/Footer';
import { Ticker } from '@/components/vivaan/Ticker';
import { BottomNav } from '@/components/vivaan/BottomNav';
import { CartSidebar } from '@/components/vivaan/CartSidebar';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { JarIcon, ComboIcon } from '@/components/vivaan/JarIcon';
import { aiProductUsageAndRecipeIdeas, RecipeIdeasOutput } from '@/ai/flows/ai-product-usage-and-recipe-ideas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/vivaan/ProductCard';
import { ProductCarousel } from '@/components/ui/product-carousel';
import { ProductReviewsSection } from '@/components/vivaan/ProductReviewsSection';
import { ErrorCard } from '@/components/ui/ErrorCard';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const productRef = useMemoFirebase(() => id ? doc(db, 'products', id as string) : null, [db, id]);
  const { data: dbProduct, isLoading: productLoading, error: productError } = useDoc(productRef);
  
  // Related products query
  const relatedRef = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: allProducts } = useCollection(relatedRef);
  
  const { cart, addToCart, updateQty, removeFromCart, totalQty } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [aiData, setAiData] = useState<RecipeIdeasOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const galleryTouchStartX = React.useRef<number | null>(null);
  const galleryTouchEndX = React.useRef<number | null>(null);

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    galleryTouchEndX.current = null;
    galleryTouchStartX.current = e.targetTouches[0].clientX;
  };

  const handleGalleryTouchMove = (e: React.TouchEvent) => {
    galleryTouchEndX.current = e.targetTouches[0].clientX;
  };

  const handleGalleryTouchEnd = () => {
    if (!galleryTouchStartX.current || !galleryTouchEndX.current || galleryImages.length <= 1) return;
    const distance = galleryTouchStartX.current - galleryTouchEndX.current;
    if (distance > 35) {
      setSelectedImgIndex((prev) => (prev + 1) % galleryImages.length);
    } else if (distance < -35) {
      setSelectedImgIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
    galleryTouchStartX.current = null;
    galleryTouchEndX.current = null;
  };

  // Standardize product data
  const mapProductData = (p: any, index: number = 0): Product => {
    const basePrice = Number(p.basePrice) || 0;
    return {
      ...p,
      price: basePrice,
      mrpPrice: Number(p.mrpPrice) || basePrice,
      rat: Number(p.rating) || 4.9,
      revs: Number(p.reviewCount) || 120,
      sold: p.soldCountLabel || 'Hot',
      cat: (p.categoryId || 'ghee').toLowerCase(),
      vol: p.vol || (Array.isArray(p.vars) && p.vars.find((v: any) => v.on)?.s) || (p.volumeValue ? `${p.volumeValue}${p.volumeUnit || ''}` : 'Standard'),
      pi: index,
      vars: Array.isArray(p.vars) && p.vars.length > 0 
        ? p.vars 
        : [{ s: 'Standard', p: basePrice, on: true }]
    } as any;
  };

  // Transform main product
  const product = useMemo(() => {
    if (!dbProduct) return null;
    return mapProductData(dbProduct);
  }, [dbProduct]);

  // Transform and filter related products
  const relatedProducts = useMemo(() => {
    if (!allProducts || !product) return [];
    return allProducts
      .filter(p => p.id !== product.id && p.categoryId === product.categoryId)
      .map((p, i) => mapProductData(p, i))
      .slice(0, 4);
  }, [allProducts, product]);

  useEffect(() => {
    if (product) {
      const defaultVar = product.vars.find((v: any) => v.on) || product.vars[0];
      setSelectedSize(defaultVar.s);
      setSelectedImgIndex(0);
      
      const fetchAi = async () => {
        setLoadingAi(true);
        try {
          const res = await aiProductUsageAndRecipeIdeas({
            name: product.name,
            description: product.description || product.name,
            category: product.cat,
            volume: product.vol
          });
          setAiData(res);
        } catch (e) {
          console.error("AI fetch failed", e);
        } finally {
          setLoadingAi(false);
        }
      };
      fetchAi();
    }
  }, [product]);

  if (productLoading) {
    return (
      <div className="min-h-screen bg-[#F9F6EF] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="min-h-screen bg-[#F9F6EF] flex flex-col items-center justify-center p-6 text-center">
        <ErrorCard
          error={productError}
          title="Product Unavailable"
          message="We couldn't retrieve this item from our catalog. It may have been moved or there is a temporary network interruption."
          showHome={true}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F9F6EF] flex flex-col items-center justify-center p-10 text-center">
        <h1 className="font-headline text-3xl font-extrabold text-primary mb-4">Product Not Found</h1>
        <Button onClick={() => router.push('/')} className="bg-primary text-white rounded-full">Back to Shop</Button>
      </div>
    );
  }

  const currentVar = product.vars.find((v: any) => v.s === selectedSize) || product.vars[0];
  const displayPrice = currentVar?.p || product.price || 0;
  const productMrp = product.mrpPrice ?? product.mrp ?? 0;
  const currentVarMrp = currentVar?.mrp ?? 0;
  const rawMrp = currentVarMrp > displayPrice ? currentVarMrp : productMrp;
  const mrp: number = rawMrp > displayPrice ? rawMrp : 0;
  const discountPercent: number = mrp > displayPrice ? Math.round(((mrp - displayPrice) / mrp) * 100) : 0;
  const isWishlisted = isInWishlist(product.id);

  const galleryImages = (product.imageUrls && product.imageUrls.length > 0) 
    ? product.imageUrls 
    : [];

  const activeImageSrc = galleryImages[selectedImgIndex] || galleryImages[0];

  const handleBuyNow = () => {
    addToCart({ ...product, price: displayPrice, vol: selectedSize } as any, qty);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBFA] text-[#100C06] pb-28 md:pb-0">
      <Ticker />
      <Header 
        onOpenCart={() => setIsCartOpen(true)} 
        cartCount={totalQty}
        onFilter={() => router.push('/')}
        onSearch={() => router.push('/')}
      />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-10 py-2 sm:py-4 md:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-[#7A6848] uppercase tracking-wider mb-2 sm:mb-4 md:mb-6 overflow-x-auto whitespace-nowrap no-scrollbar">
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/')}>Home</span>
          <ChevronRight className="w-3 h-3 text-[#7A6848]/50" />
          <span className="cursor-pointer hover:text-primary transition-colors uppercase">{product.cat}</span>
          <ChevronRight className="w-3 h-3 text-[#7A6848]/50" />
          <span className="text-primary truncate max-w-[180px] sm:max-w-none">{product.name}</span>
        </div>

        {/* TOP SECTION: Visuals & Buy Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 md:gap-12 mb-8 md:mb-16">
          
          {/* Gallery Area - Compact and Balanced */}
          <div className="lg:col-span-6 space-y-2 sm:space-y-3">
            <div 
              onTouchStart={handleGalleryTouchStart}
              onTouchMove={handleGalleryTouchMove}
              onTouchEnd={handleGalleryTouchEnd}
              className="bg-[#F8F6F0] rounded-2xl md:rounded-[32px] border border-[#EEE0BC]/50 shadow-xs relative overflow-hidden group flex items-center justify-center h-[210px] xs:h-[250px] sm:h-[320px] md:h-[450px] lg:h-[500px] transition-all cursor-grab active:cursor-grabbing select-none touch-pan-x"
            >
              
              {/* Badges Floating inside Gallery */}
              <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                {discountPercent > 0 && (
                  <span className="bg-emerald-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
                    {discountPercent}% OFF
                  </span>
                )}
                <span className="bg-primary/90 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider backdrop-blur-xs">
                  100% PURE
                </span>
              </div>

              {/* Action Buttons Floating on top-right */}
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xs hover:bg-white text-gray-700 hover:text-red-500 transition-all cursor-pointer"
                  title="Wishlist"
                >
                  <Heart className={cn("w-4 h-4 transition-colors", isWishlisted && "fill-red-500 text-red-500")} />
                </button>
                <button 
                  onClick={handleShare}
                  className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xs hover:bg-white text-gray-700 transition-all cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Main Image */}
              <div 
                onClick={() => setIsLightboxOpen(true)}
                className="relative w-full h-full p-3 flex items-center justify-center cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
              >
                {activeImageSrc ? (
                  <Image 
                    src={activeImageSrc} 
                    alt={product.name} 
                    fill 
                    className="object-contain p-2 drop-shadow-md pointer-events-none"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  product.cat === 'combo' ? (
                    <ComboIcon className="scale-110 sm:scale-140" />
                  ) : (
                    <JarIcon c1="#D4EDE0" c2="#1B5E3B" sub="" idSuffix="page" className="scale-125 sm:scale-160" />
                  )
                )}

                {/* Click to Zoom indicator */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3 h-3" />
                  <span className="hidden sm:inline">Tap to Zoom</span>
                </div>
              </div>

              {/* Counter & Swipe Badge for Mobile */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10">
                  <div className="bg-black/60 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-md">
                    {selectedImgIndex + 1} / {galleryImages.length}
                  </div>
                  <div className="md:hidden bg-primary/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-md animate-pulse">
                    Swipe ⟷
                  </div>
                </div>
              )}
            </div>
            
            {/* Thumbnails Navigation */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 px-0.5">
                {galleryImages.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedImgIndex(i)}
                    className={cn(
                      "w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#F8F6F0] flex items-center justify-center shrink-0 border-2 transition-all overflow-hidden relative",
                      selectedImgIndex === i 
                        ? "border-primary ring-2 ring-primary/20 scale-105 shadow-xs" 
                        : "border-[#EEE0BC]/60 opacity-70 hover:opacity-100"
                    )}
                  >
                    <Image src={img} alt={`Thumb ${i+1}`} fill className="object-cover p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Purchasing Pane - Modern Sans Typography & High Clarity */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-3 sm:space-y-4">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-black tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-0.5 rounded-full">
                  FARM DIRECT · {product.vol || 'GUJARAT'}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> In Stock
                </span>
              </div>

              <h1 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl text-[#1B5E3B] leading-snug tracking-tight">
                {product.name}
              </h1>

              {/* Rating & Social proof */}
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-amber-900">{product.rating ?? product.rat ?? 4.9}</span>
                </div>
                <span className="text-xs font-bold text-[#7A6848]">
                  ({product.reviewCount ?? product.revs ?? 120} reviews)
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-[11px] font-bold text-secondary flex items-center gap-1">
                  🔥 {product.soldCountLabel ?? product.sold ?? '1.2k+'} units sold
                </span>
              </div>
            </div>

            {/* Price Block - Modern Clean Display */}
            <div className="bg-[#FAF7EF] border border-[#EEE0BC] rounded-2xl p-3 sm:p-4">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-sans text-3xl sm:text-4xl font-black text-primary tracking-tight">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </span>
                
                {mrp > displayPrice && (
                  <>
                    <span className="font-sans text-sm sm:text-base text-gray-400 line-through font-semibold">
                      ₹{mrp.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      SAVE ₹{(mrp - displayPrice).toLocaleString('en-IN')} ({discountPercent}%)
                    </span>
                  </>
                )}
              </div>
              <div className="text-[10.5px] text-[#7A6848] font-medium mt-1">
                Inclusive of all taxes · Free Shipping above ₹499
              </div>

              {/* Reward Coin Offer */}
              <div className="mt-2 pt-2 border-t border-[#EEE0BC]/60 flex items-center gap-2">
                <div className="w-5 h-5 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-xs shrink-0">
                  🪙
                </div>
                <div className="text-[11px] font-bold text-primary">
                  Earn +{Math.round(displayPrice * 0.1)} Purity Coins <span className="font-normal text-[#7A6848]">(Redeem next order)</span>
                </div>
              </div>
            </div>

            {/* Select Size & Quantity Selector - Crisp & Intuitive */}
            <div className="bg-[#FAF8F3] border border-[#EEE0BC] rounded-2xl p-3.5 sm:p-4 space-y-3">
              {/* Select Size Header & Chips */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Select Size / Weight
                  </span>
                  <span className="text-[11px] font-bold text-[#7A6848]">
                    Selected: <span className="font-extrabold text-primary">{selectedSize}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.vars.map((v: any) => {
                    const isSelected = selectedSize === v.s;
                    return (
                      <button 
                        key={v.s}
                        type="button"
                        onClick={() => setSelectedSize(v.s)}
                        className={cn(
                          "min-h-[52px] px-3 py-2.5 rounded-md text-xs font-black transition-all flex flex-col items-center justify-center border-2 cursor-pointer active:scale-[0.97]",
                          isSelected 
                            ? "bg-[#1B5E3B] text-white border-[#1B5E3B] shadow-sm ring-2 ring-[#1B5E3B]/20" 
                            : "bg-white text-[#504028] border-[#DDD0B5] hover:border-primary/60 hover:bg-[#FDFBFA]"
                        )}
                      >
                        <span className="tracking-tight text-sm font-extrabold">{v.s}</span>
                        <span className={cn("text-[11px] font-bold mt-0.5", isSelected ? "text-emerald-200" : "text-[#1B5E3B]")}>
                          ₹{v.p.toLocaleString('en-IN')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="pt-2 border-t border-[#EEE0BC]/70 flex items-center justify-between">
                <span className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Quantity
                </span>
                <div className="flex items-center bg-white border border-[#DDD0B5] rounded-full h-10 px-1.5 shadow-2xs">
                  <button 
                    type="button"
                    onClick={() => setQty(q => Math.max(1, q - 1))} 
                    className="w-8 h-8 flex items-center justify-center text-[#1B5E3B] hover:bg-[#F1EAD8] rounded-full transition-colors active:scale-90 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <span className="w-8 text-center font-sans text-xs font-black text-[#1B5E3B]">{qty}</span>
                  <button 
                    type="button"
                    onClick={() => setQty(q => Math.min(99, q + 1))} 
                    className="w-8 h-8 flex items-center justify-center text-[#1B5E3B] hover:bg-[#F1EAD8] rounded-full transition-colors active:scale-90 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Only Inline Buy Buttons (hidden on mobile to prevent double buttons) */}
            <div className="hidden md:flex gap-3 pt-2">
              <Button 
                onClick={() => { addToCart({ ...product, price: displayPrice, vol: selectedSize } as any, qty); setIsCartOpen(true); }}
                className="flex-1 h-12 bg-white border-2 border-primary text-primary hover:bg-primary/5 rounded-xl font-extrabold uppercase tracking-wider text-xs shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
              </Button>
              <Button 
                onClick={handleBuyNow}
                className="flex-1.2 h-12 bg-primary text-white hover:bg-primary/95 rounded-xl font-extrabold uppercase tracking-wider shadow-md text-xs"
              >
                Buy Now ✦
              </Button>
            </div>

            {/* Guarantees Grid */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#EEE0BC]/40">
              {[
                { i: <Truck className="w-4 h-4" />, l: 'Free Shipping' },
                { i: <ShieldCheck className="w-4 h-4" />, l: '100% Pure' },
                { i: <History className="w-4 h-4" />, l: 'Easy Return' },
                { i: <FlaskConical className="w-4 h-4" />, l: 'Lab Tested' },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#EEE0BC]/60 rounded-xl p-2 text-center shadow-2xs">
                  <div className="text-primary mb-0.5 flex justify-center">{item.i}</div>
                  <div className="text-[8.5px] sm:text-[9.5px] font-bold uppercase text-[#7A6848] leading-tight">{item.l}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* PRODUCT DETAILS & STORY SECTION */}
        <div className="py-6 md:py-12 border-t border-[#EEE0BC]/40 space-y-6">
          <div className="bg-white border border-[#EEE0BC]/60 rounded-2xl p-4 md:p-8 space-y-3 shadow-xs">
            <h3 className="font-headline text-xl md:text-3xl font-extrabold text-primary flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Product Story & Tradition
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-[#7A6848] leading-relaxed font-medium">
              {product.description || 'Sourced directly from our family-run farms in Gujarat, this product represents the pinnacle of traditional craftsmanship, zero artificial additives, and uncompromised natural purity.'}
            </p>
          </div>

          {/* AI Usage Tips & Recipes */}
          {(loadingAi || aiData) && (
            <div className="bg-[#FAF7EF] border border-[#EEE0BC] rounded-2xl p-4 md:p-8 space-y-3">
              <h3 className="font-headline text-xl font-extrabold text-primary flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" /> Smart Culinary Ideas & Usage Tips
              </h3>
              {loadingAi ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-[#EEE0BC]/60 rounded w-3/4"></div>
                  <div className="h-4 bg-[#EEE0BC]/60 rounded w-1/2"></div>
                </div>
              ) : aiData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-[#EEE0BC]/60 space-y-2">
                    <div className="text-[11px] font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Recipe Suggestions
                    </div>
                    {aiData.recipeIdeas.map((recipe, i) => (
                      <div key={i} className="text-xs text-[#7A6848] border-b border-[#EEE0BC]/30 last:border-0 pb-1 last:pb-0">
                        <span className="font-bold text-primary">{recipe.title}:</span> {recipe.description}
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#EEE0BC]/60 space-y-2">
                    <div className="text-[11px] font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recommended Usage
                    </div>
                    <ul className="space-y-1">
                      {aiData.usageTips.map((tip, i) => (
                        <li key={i} className="text-xs text-[#7A6848] flex items-start gap-1.5">
                          <span className="text-primary font-bold">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


        {/* REVIEWS & RELATED PRODUCTS */}
        <ProductReviewsSection 
          productId={product.id} 
          productName={product.name} 
          productImage={product.imageUrls?.[0]} 
          fallbackRating={product.rating} 
          fallbackCount={product.reviewCount} 
        />

        <div className="py-4 md:py-8 border-t border-[#EEE0BC]/30">
          {relatedProducts.length > 0 && (
            <ProductCarousel
              title="You May Also Like"
              subtitle="Recommended For You"
              products={relatedProducts.map(p => ({
                ...p,
                quantity: p.vol || '500 ml',
                deliveryTime: 'SAME DAY',
                originalPrice: p.mrpPrice,
                imageUrl: p.imageUrls?.[0],
                description: p.description
              }))}
              cartIds={cart.map(c => c.id)}
              onAddToCart={(cp) => {
                const originalP = relatedProducts.find(p => String(p.id) === String(cp.id));
                if (originalP) addToCart(originalP);
              }}
              onProductClick={(cp) => router.push(`/product/${cp.id}`)}
              onViewAll={() => router.push('/')}
            />
          )}
        </div>
      </main>

      {/* SINGLE STICKY BOTTOM ACTION BAR FOR MOBILE (<md) - DOCKED AT BOTTOM WITH SAFE AREA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EEE0BC] px-4 py-3 shadow-2xl md:hidden flex items-center justify-between gap-3 pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
        <div className="flex flex-col justify-center shrink-0 min-w-[90px]">
          <span className="text-[10px] font-bold text-[#7A6848] uppercase tracking-tight truncate max-w-[100px]">
            {selectedSize || 'Standard'} ({qty})
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-sans text-lg font-black text-primary">
              ₹{(displayPrice * qty).toLocaleString('en-IN')}
            </span>
            {mrp > displayPrice && (
              <span className="font-sans text-[10px] text-gray-400 line-through font-medium">
                ₹{mrp * qty}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          <Button 
            onClick={() => { addToCart({ ...product, price: displayPrice, vol: selectedSize } as any, qty); setIsCartOpen(true); }}
            className="flex-1 h-11 bg-white border-2 border-primary text-primary hover:bg-primary/5 font-extrabold uppercase text-xs rounded-xl px-2 active:scale-95 transition-all cursor-pointer"
          >
            Add
          </Button>
          <Button 
            onClick={handleBuyNow}
            className="flex-1.2 h-11 bg-primary text-white hover:bg-primary/95 font-extrabold uppercase text-xs rounded-xl shadow-md px-2 whitespace-nowrap active:scale-95 transition-all cursor-pointer"
          >
            Buy Now ✦
          </Button>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[1200] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full max-w-2xl h-[70vh] flex items-center justify-center">
            {activeImageSrc && (
              <Image 
                src={activeImageSrc} 
                alt={product.name} 
                fill 
                className="object-contain" 
              />
            )}
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto max-w-full px-4">
            {galleryImages.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedImgIndex(i)}
                className={cn(
                  "w-12 h-12 rounded-lg border-2 overflow-hidden relative transition-all",
                  selectedImgIndex === i ? "border-white scale-110" : "border-transparent opacity-50"
                )}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <Footer />
      
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        onCheckout={() => { setIsCartOpen(false); router.push('/checkout'); }}
      />
    </div>
  );
}
