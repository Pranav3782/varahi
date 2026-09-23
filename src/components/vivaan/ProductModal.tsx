"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Star, Truck, RefreshCw, FlaskConical, Home, Plus, Minus } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ComboIcon, JarIcon } from './JarIcon';
import { aiProductUsageAndRecipeIdeas, RecipeIdeasOutput } from '@/ai/flows/ai-product-usage-and-recipe-ideas';
import HoneyLoader from './HoneyLoader';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: Product, qty: number) => void;
  onBuyNow?: (p: Product, qty: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart, onBuyNow }) => {
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [aiData, setAiData] = useState<RecipeIdeasOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showHoneyLoader, setShowHoneyLoader] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setQty(1);
      const defaultVar = product.vars.find(v => v.on) || product.vars[0];
      setSelectedSize(defaultVar.s);
      
      if (product.cat === 'honey') {
        setShowHoneyLoader(true);
        setTimeout(() => setShowHoneyLoader(false), 2500);
      }

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
  }, [product, isOpen]);

  if (!product || !isOpen) return null;

  const currentVar = product.vars.find(v => v.s === selectedSize) || product.vars[0];
  const price = currentVar.p;

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow({ ...product, price, vol: selectedSize }, qty);
    }
  };

  if (showHoneyLoader) {
    return (
      <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <HoneyLoader />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 md:p-8" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[24px] sm:rounded-[32px] max-w-[980px] w-full max-h-[calc(100vh-32px)] md:max-h-[calc(100vh-64px)] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300 relative">
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-5 sm:right-5 z-[20] w-9 h-9 sm:w-10 sm:h-10 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-all cursor-pointer">
          <X className="w-5 h-5 text-foreground" />
        </button>

        <div className="md:w-1/2 bg-gradient-to-br from-[#FAF4E6] to-[#EEE0BC] p-4 sm:p-8 md:p-10 flex flex-col items-center justify-center relative min-h-[180px] sm:min-h-[260px] md:min-h-[360px] shrink-0">
          <div className="absolute top-[-30px] right-[-30px] w-[180px] h-[180px] rounded-full bg-[radial-gradient(circle,rgba(27,94,59,0.1),transparent_70%)] pointer-events-none"></div>
          
          <div className="bg-white rounded-[20px] sm:rounded-[32px] p-3 sm:p-6 md:p-12 shadow-2xl relative group overflow-hidden max-w-[180px] sm:max-w-[260px] md:max-w-[320px] w-full aspect-square flex items-center justify-center">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(255,255,255,0.5),transparent_60%)] pointer-events-none z-1"></div>
             
             <div className="relative w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:rotate-[-2deg]">
              {product.imageUrls && product.imageUrls.length > 0 ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={product.imageUrls[0]} 
                    alt={product.name} 
                    fill 
                    className="object-contain drop-shadow-2xl"
                    sizes="(max-width: 768px) 240px, 320px"
                  />
                </div>
              ) : (
                <>
                  {product.cat === 'combo' ? (
                    <ComboIcon className="scale-125" />
                  ) : (
                    <JarIcon c1="#D4EDE0" c2="#1B5E3B" sub="" idSuffix="modal" className="scale-150" />
                  )}
                </>
              )}
             </div>
          </div>
        </div>

        <div className="md:w-1/2 p-4 sm:p-8 md:p-10 overflow-y-auto">
          <div className="inline-flex items-center gap-2 bg-destructive/5 border border-destructive/20 rounded-full px-4 py-1.5 mb-4">
            <div className="w-2 h-2 rounded-full bg-destructive blink"></div>
            <span className="text-[11px] font-bold text-destructive">14 people viewing now</span>
          </div>

          <h2 className="font-headline text-4xl font-extrabold text-primary leading-[1.1] mb-2">{product.name}</h2>
          <p className="text-xs text-muted-foreground font-black tracking-widest uppercase mb-6">{selectedSize} · FARM DIRECT</p>

          <div className="flex items-center gap-3 bg-background border border-border rounded-2xl p-4 mb-6">
            <span className="font-headline text-3xl font-extrabold">{product.rating ?? product.rat ?? 4.9}</span>
            <div className="h-10 w-px bg-border mx-1"></div>
            <div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating ?? product.rat ?? 5) ? 'text-primary fill-current' : 'text-border'}`} />
                ))}
              </div>
              <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">{product.reviewCount ?? product.revs ?? 120} verified reviews</div>
            </div>
          </div>

          <div className="bg-secondary/5 border border-secondary/15 rounded-2xl p-4 flex items-center gap-3 mb-6">
            <div className="text-xl">🔥</div>
            <div>
              <div className="text-xs font-black text-secondary">{product.soldCountLabel ?? product.sold ?? '1.2k+'} units sold this month!</div>
              <div className="text-[10px] text-muted-foreground font-medium">Last ordered 4 mins ago from Bengaluru</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary via-secondary to-primary/90 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-[100px] h-[100px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent_68%)] pointer-events-none"></div>
            <div className="font-headline text-5xl font-extrabold mb-2 relative z-1">₹{price.toLocaleString('en-IN')}</div>
            <div className="flex items-center gap-3 relative z-1 mb-4">
              {(product.mrpPrice || product.mrp) && (
                <span className="text-sm text-white/30 line-through">₹{(product.mrpPrice || product.mrp || 0).toLocaleString('en-IN')}</span>
              )}
              <span className="bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{product.off || 'BEST PRICE'}</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center gap-3">
              <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-lg text-[10px] font-black text-white">PURE15</span>
              <span className="text-[11px] text-white/50">Extra 15% off applied at checkout</span>
            </div>
          </div>

          <div className="mb-8">
             <div className="text-[10px] font-black text-muted-foreground tracking-[2px] uppercase mb-4">Select Size</div>
             <div className="flex flex-wrap gap-2.5">
                {product.vars.map((v) => (
                  <button 
                    key={v.s}
                    onClick={() => setSelectedSize(v.s)}
                    className={`flex-1 min-w-[80px] py-3 px-4 rounded-md border-2 transition-all text-center ${selectedSize === v.s ? 'border-primary bg-primary/5 ring-2 ring-primary/5' : 'border-border bg-background hover:border-muted-foreground/30'}`}
                  >
                    <div className="text-sm font-black text-foreground">{v.s}</div>
                    <div className="text-[10px] text-muted-foreground font-bold mt-0.5">₹{v.p.toLocaleString('en-IN')}</div>
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-8">
            {[
              { i: <Truck className="w-5 h-5 mx-auto mb-1" />, l: 'Free Delivery' },
              { i: <RefreshCw className="w-5 h-5 mx-auto mb-1" />, l: '30-Day Return' },
              { i: <FlaskConical className="w-5 h-5 mx-auto mb-1" />, l: 'Lab Tested' },
              { i: <Home className="w-5 h-5 mx-auto mb-1" />, l: 'Farm Direct' },
            ].map((item, i) => (
              <div key={i} className="bg-background border border-border rounded-2xl p-3 text-center">
                <div className="text-secondary">{item.i}</div>
                <div className="text-[9px] font-bold text-muted-foreground leading-tight">{item.l}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mb-8">
            <div className="flex items-center bg-background border-2 border-border rounded-full h-14 overflow-hidden">
               <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-12 h-full hover:bg-muted/50 flex items-center justify-center transition-all"><Minus className="w-5 h-5" /></button>
               <span className="w-10 text-center text-lg font-black">{qty}</span>
               <button onClick={() => setQty(q => Math.min(99, q+1))} className="w-12 h-full hover:bg-muted/50 flex items-center justify-center transition-all"><Plus className="w-5 h-5" /></button>
            </div>
            <Button 
              onClick={() => { onAddToCart({ ...product, price, vol: selectedSize }, qty); onClose(); }}
              className="flex-1 h-14 bg-foreground hover:bg-primary text-white font-black uppercase tracking-widest rounded-full transition-all"
            >
              Add to Cart
            </Button>
            <Button 
              onClick={handleBuyNow}
              className="flex-[1.4] h-14 bg-primary text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:translate-y-[-2px] transition-all"
            >
              Buy Now ✦
            </Button>
          </div>

          <div className="bg-background border border-border rounded-[24px] p-6 space-y-6">
            <section>
              <h4 className="text-[11px] font-black text-foreground tracking-[2px] uppercase mb-4">About This Product</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </section>

            {loadingAi ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ) : aiData && (
              <>
                <section>
                  <h4 className="text-[11px] font-black text-foreground tracking-[2px] uppercase mb-4 flex items-center gap-2">
                    <span className="text-lg">👩‍🍳</span> AI Recipe Ideas
                  </h4>
                  <div className="space-y-4">
                    {aiData.recipeIdeas.map((recipe, i) => (
                      <div key={i} className="bg-white/50 p-3 rounded-xl border border-border/50">
                        <div className="text-xs font-bold text-secondary mb-1">{recipe.title}</div>
                        <div className="text-[11px] text-muted-foreground italic leading-relaxed">{recipe.description}</div>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                   <h4 className="text-[11px] font-black text-foreground tracking-[2px] uppercase mb-4 flex items-center gap-2">
                    <span className="text-lg">💡</span> Pro Usage Tips
                  </h4>
                  <ul className="space-y-2">
                    {aiData.usageTips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-[11px] text-muted-foreground">
                        <span className="text-secondary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};