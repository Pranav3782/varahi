"use client";

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase, useAuth, useFirebaseApp } from '@/firebase';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Search, ExternalLink, Pen, Trash2, Camera, X, Zap, Star, Ticket, Coins, Plus, Check, Layers, Scale, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductVariant } from '@/types';

interface ProductCategoryManagerProps {
  category: string;
  title: string;
  description: string;
  icon: string;
}

type VolumeUnit = 'ml' | 'L' | 'g' | 'kg' | 'pack' | 'custom';

export const ProductCategoryManager: React.FC<ProductCategoryManagerProps> = ({ 
  category, 
  title, 
  description,
  icon
}) => {
  const db = useFirestore();
  const auth = useAuth();
  const app = useFirebaseApp();
  const { toast } = useToast();
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const productsRef = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: allProducts, isLoading } = useCollection(productsRef);
  
  const [searchTerm, setSearchValue] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Default Unit depending on category
  const getDefaultUnit = (): VolumeUnit => {
    const cat = category.toLowerCase();
    if (cat === 'ghee') return 'ml';
    if (cat === 'honey') return 'g';
    if (cat === 'sweets') return 'g';
    return 'pack';
  };

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [mrpPrice, setMrpPrice] = useState('');
  const [stock, setStock] = useState('');
  const [desc, setDesc] = useState('');
  const [rating, setRating] = useState('4.9');
  const [reviews, setReviews] = useState('120');
  const [soldLabel, setSoldLabel] = useState('1.5k+');
  const [statusBadge, setStatusBadge] = useState('Selling Fast');
  const [topBadge, setTopBadge] = useState('New Launch');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Volume & Variants State
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>(getDefaultUnit());
  const [customUnitName, setCustomUnitName] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([
    { s: '500 ml', p: 850, mrp: 999, on: true }
  ]);

  // Temporary inputs to add a variant
  const [newVarSize, setNewVarSize] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');
  const [newVarMrp, setNewVarMrp] = useState('');

  // Enhancement Fields
  const [productCoupon, setProductCoupon] = useState('');
  const [rewardCoins, setRewardCoins] = useState('');

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    const targetCat = category.toLowerCase();
    return allProducts.filter(p => {
      const matchesCat = (p.categoryId || '').toLowerCase() === targetCat;
      const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [allProducts, category, searchTerm]);

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error();
      }
      if (url.startsWith('data:')) {
        toast({ variant: "destructive", title: "Invalid URL", description: "Base64 data URLs are not allowed." });
        return;
      }
    } catch {
      toast({ variant: "destructive", title: "Invalid URL", description: "Please enter a valid HTTP/HTTPS image URL." });
      return;
    }
    
    setUploadedImages(prev => [...prev, url]);
    setNewImageUrl('');
  };

  const resetForm = () => {
    setName(''); setPrice(''); setMrpPrice(''); setStock(''); setDesc(''); setUploadedImages([]);
    setNewImageUrl(''); setProductCoupon(''); setRewardCoins(''); setEditingId(null); setRating('4.9'); setReviews('120');
    setSoldLabel('1.5k+'); setStatusBadge('Selling Fast'); setTopBadge('New Launch');
    const defaultUnit = getDefaultUnit();
    setVolumeUnit(defaultUnit);
    setCustomUnitName('');
    const initSize = defaultUnit === 'ml' ? '500 ml' : defaultUnit === 'g' ? '500 g' : '1 Unit';
    setVariants([{ s: initSize, p: 0, mrp: 0, on: true }]);
    setNewVarSize(''); setNewVarPrice(''); setNewVarMrp('');
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Quick Preset Add
  const handleAddPreset = (sizeLabel: string) => {
    if (variants.some(v => v.s.toLowerCase() === sizeLabel.toLowerCase())) {
      toast({ title: "Variant exists", description: `Variant for ${sizeLabel} is already added.` });
      return;
    }
    const defaultP = Number(price) || (variants[0]?.p || 0);
    const defaultM = Number(mrpPrice) || (variants[0]?.mrp || 0);
    setVariants(prev => [...prev, { s: sizeLabel, p: defaultP, mrp: defaultM, on: prev.length === 0 }]);
  };

  // Add custom variant
  const handleAddCustomVariant = () => {
    if (!newVarSize.trim()) {
      toast({ variant: "destructive", title: "Missing Size", description: "Please enter a size or weight (e.g. 250ml or 1kg)." });
      return;
    }
    const sizeName = newVarSize.trim();
    if (variants.some(v => v.s.toLowerCase() === sizeName.toLowerCase())) {
      toast({ variant: "destructive", title: "Duplicate Size", description: "A variant with this size already exists." });
      return;
    }
    const vPrice = Number(newVarPrice) || Number(price) || 0;
    const vMrp = Number(newVarMrp) || Number(mrpPrice) || vPrice;
    
    setVariants(prev => [
      ...prev,
      { s: sizeName, p: vPrice, mrp: vMrp, on: prev.length === 0 }
    ]);

    setNewVarSize('');
    setNewVarPrice('');
    setNewVarMrp('');
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      toast({ variant: "destructive", title: "At least 1 variant required", description: "A product must have at least one size/variant." });
      return;
    }
    const wasDefault = variants[index].on;
    const updated = variants.filter((_, i) => i !== index);
    if (wasDefault && updated.length > 0) {
      updated[0].on = true;
      setPrice(String(updated[0].p));
      setMrpPrice(String(updated[0].mrp || updated[0].p));
    }
    setVariants(updated);
  };

  const handleSetDefaultVariant = (index: number) => {
    const updated = variants.map((v, i) => ({
      ...v,
      on: i === index
    }));
    setVariants(updated);
    setPrice(String(updated[index].p));
    setMrpPrice(String(updated[index].mrp || updated[index].p));
  };

  const handleVariantChange = (index: number, field: 'p' | 'mrp' | 's', val: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: val };
    setVariants(updated);
    if (updated[index].on) {
      if (field === 'p') setPrice(String(val));
      if (field === 'mrp') setMrpPrice(String(val));
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(String(p.basePrice));
    setMrpPrice(String(p.mrpPrice || p.basePrice));
    setStock(String(p.stockQuantity));
    setDesc(p.description);
    setRating(String(p.rating));
    setReviews(String(p.reviewCount));
    setSoldLabel(p.soldCountLabel);
    setStatusBadge(p.statusBadge || '');
    setTopBadge(p.badges?.[0] || '');
    setUploadedImages(p.imageUrls || []);
    setProductCoupon(p.productCoupon || '');
    setRewardCoins(String(p.rewardCoins || ''));

    // Volume & Variants
    if (p.volumeUnit) {
      setVolumeUnit(p.volumeUnit as VolumeUnit);
    }
    if (Array.isArray(p.vars) && p.vars.length > 0) {
      setVariants(p.vars);
    } else {
      const defaultSize = p.vol || (p.volumeValue ? `${p.volumeValue}${p.volumeUnit || ''}` : 'Standard');
      setVariants([{ s: defaultSize, p: Number(p.basePrice) || 0, mrp: Number(p.mrpPrice) || Number(p.basePrice) || 0, on: true }]);
    }

    setIsAddOpen(true);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Missing Info", description: "Product name is required." });
      return;
    }

    let finalImageUrls = [...uploadedImages];
    if (newImageUrl.trim()) {
      try {
        const parsed = new URL(newImageUrl.trim());
        if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && !newImageUrl.trim().startsWith('data:')) {
          finalImageUrls.push(newImageUrl.trim());
        }
      } catch (e) {
        // Ignore parsing errors here, handled by the length check below
      }
    }

    if (finalImageUrls.length === 0) {
      toast({ variant: "destructive", title: "Missing Image", description: "Please provide a product image URL." });
      return;
    }

    // Ensure variants exist
    let finalVars = variants;
    if (!finalVars || finalVars.length === 0) {
      finalVars = [{ s: 'Standard', p: Number(price) || 0, mrp: Number(mrpPrice) || Number(price) || 0, on: true }];
    }

    // Ensure one variant is marked as default
    if (!finalVars.some(v => v.on)) {
      finalVars[0].on = true;
    }

    const defaultVar = finalVars.find(v => v.on) || finalVars[0];
    const finalBasePrice = Number(defaultVar.p) || Number(price) || 0;
    const finalMrpPrice = Number(defaultVar.mrp) || Number(mrpPrice) || finalBasePrice;

    const catId = category.toLowerCase();
    
    const productData = {
      name: name.trim(),
      basePrice: finalBasePrice,
      mrpPrice: finalMrpPrice,
      stockQuantity: Number(stock) || 100,
      description: desc.trim() || name.trim(),
      rating: Number(rating) || 4.9,
      reviewCount: Number(reviews) || 0,
      soldCountLabel: soldLabel.trim() || "New",
      statusBadge: statusBadge.trim() || "",
      badges: topBadge ? [topBadge.trim()] : [],
      categoryId: catId,
      imageUrls: finalImageUrls,
      isLive: true, 
      updatedAt: new Date().toISOString(),
      volumeUnit: volumeUnit === 'custom' ? (customUnitName || 'custom') : volumeUnit,
      volumeValue: defaultVar.s,
      vol: defaultVar.s,
      vars: finalVars,
      productCoupon: productCoupon.toUpperCase().trim(),
      rewardCoins: Number(rewardCoins) || 0
    };

    setIsSaving(true);
    
    console.log("=== FIREBASE AUTH DEBUG ===");
    console.log("Current user exists:", !!auth.currentUser);
    console.log("Current user email:", auth.currentUser?.email);
    console.log("Current user email verified:", auth.currentUser?.emailVerified);
    console.log("Current user UID:", auth.currentUser?.uid);
    console.log("===========================");

    if (!auth.currentUser) {
      console.error("No Firebase authenticated user.");
    } else {
      await auth.currentUser.getIdToken(true);
      const tokenResult = await auth.currentUser.getIdTokenResult();
      console.log("Firebase token email:", tokenResult.claims.email);
    }

    console.log("Firebase runtime project:", app.options.projectId);
    console.log("Writing product to:", "products");
    console.log("FINAL IMAGE URLS BEING SAVED:", productData.imageUrls);

    try {
      if (editingId) {
        await setDoc(doc(db, 'products', editingId), productData, { merge: true });
        console.log("Product updated:", editingId);
        toast({ title: "Updated", description: `${name} has been updated with ${finalVars.length} size options.` });
      } else {
        const docRef = await addDoc(collection(db, 'products'), { ...productData, createdAt: new Date().toISOString() });
        console.log("Product created:", docRef.id);
        toast({ title: "Product Published", description: `${name} is live with ${finalVars.length} size options.` });
      }
      
      setIsAddOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("PRODUCT CREATION FAILED:", error);
      toast({ 
        variant: "destructive", 
        title: "Database Error", 
        description: error.message || "Failed to persist product to database. Are you a verified admin?"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast({ title: "Removed", description: "Item has been deleted from inventory." });
      } catch (error: any) {
        console.error("PRODUCT DELETION FAILED:", error);
        toast({ 
          variant: "destructive", 
          title: "Delete Failed", 
          description: error.message || "Failed to delete product."
        });
      }
    }
  };

  // Quick preset pills according to selected unit
  const presetOptions: Record<VolumeUnit, string[]> = {
    ml: ['250 ml', '500 ml', '1000 ml (1 L)', '2000 ml (2 L)', '5000 ml (5 L)'],
    L: ['0.5 L', '1 L', '2 L', '5 L'],
    g: ['250 g', '500 g', '1 kg (1000g)', '2 kg', '5 kg'],
    kg: ['0.5 kg', '1 kg', '2 kg', '5 kg'],
    pack: ['1 Unit', 'Pack of 2', 'Pack of 3', 'Pack of 4', 'Gift Pack'],
    custom: ['Small', 'Medium', 'Large', 'Family Pack', 'Tasting Box']
  };

  if (isLoading) {
    return <div className="min-h-[400px] flex items-center justify-center font-headline text-2xl font-extrabold text-primary animate-pulse">Syncing {title} Inventory...</div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <i className={cn("fa-solid", icon)}></i>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-[#100C06]">{title}</h1>
          </div>
          <p className="text-[#7A6848] text-sm font-medium">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank">
            <Button variant="outline" className="h-12 px-6 rounded-2xl border-[#DDD0B5] text-[#7A6848] font-bold text-xs uppercase tracking-widest hidden lg:flex items-center gap-2">
              Storefront <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
          <Dialog open={isAddOpen} onOpenChange={(val) => { if(!val) resetForm(); setIsAddOpen(val); }}>
            <DialogTrigger asChild>
              <button className="h-12 px-8 bg-[#1B5E3B] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-secondary transition-all flex items-center gap-2">
                <i className="fa-solid fa-plus"></i> Add {category}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl rounded-[32px] p-6 sm:p-10 border-none shadow-2xl font-body overflow-y-auto max-h-[92vh]">
              <DialogHeader className="mb-6">
                <DialogTitle className="font-headline text-2xl sm:text-3xl font-extrabold text-primary">
                  {editingId ? 'Edit' : 'New'} {category} Listing
                </DialogTitle>
                <p className="text-xs text-[#7A6848] font-medium">Configure product details, customizable size variants (ml, L, g, kg), pricing, and rewards.</p>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basic Details & Pricing */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Product Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl bg-[#F9F6EF] border-transparent px-5 font-bold" placeholder="e.g. A2 Gir Cow Bilona Ghee" />
                  </div>

                  {/* Volume Unit & Variants Manager Card */}
                  <div className="bg-gradient-to-br from-[#FAF8F3] to-[#F5EFE1] p-5 rounded-2xl border border-[#E2D5BE] space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary">
                        <Scale className="w-4 h-4" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest">Custom Size & Volume Unit</h4>
                      </div>
                      <span className="text-[10px] font-extrabold text-[#7A6848] bg-white px-2.5 py-0.5 rounded-full border border-[#DDD0B5]">
                        {variants.length} {variants.length === 1 ? 'Size' : 'Sizes'} Configured
                      </span>
                    </div>

                    {/* Unit Selector Tabs */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-wider text-[#7A6848]">Select Unit Type</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'ml', label: 'Millilitres (ml)' },
                          { id: 'L', label: 'Litres (L)' },
                          { id: 'g', label: 'Grams (g)' },
                          { id: 'kg', label: 'Kilograms (kg)' },
                          { id: 'pack', label: 'Packs / Units' },
                          { id: 'custom', label: 'Custom' }
                        ].map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => setVolumeUnit(u.id as VolumeUnit)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer",
                              volumeUnit === u.id
                                ? "bg-primary text-white shadow-xs"
                                : "bg-white text-[#504028] border border-[#DDD0B5] hover:bg-[#FDFBFA]"
                            )}
                          >
                            {u.label}
                          </button>
                        ))}
                      </div>

                      {volumeUnit === 'custom' && (
                        <div className="pt-2">
                          <Input 
                            value={customUnitName} 
                            onChange={(e) => setCustomUnitName(e.target.value)} 
                            placeholder="e.g. Jar, Bottle, Pouch..."
                            className="h-10 text-xs bg-white rounded-xl border-[#DDD0B5] font-bold"
                          />
                        </div>
                      )}
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-[#7A6848] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" /> Quick Add Preset Sizes
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {presetOptions[volumeUnit].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAddPreset(preset)}
                            className="text-[10px] font-bold bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white px-2.5 py-1 rounded-lg transition-all active:scale-95"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Add Custom Variant Row */}
                    <div className="pt-2 border-t border-[#E0D4BC]">
                      <label className="text-[9px] font-black uppercase tracking-wider text-[#7A6848] mb-1.5 block">
                        Add Specific Size & Price
                      </label>
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <Input 
                            placeholder="Size e.g. 750ml, 1kg"
                            value={newVarSize}
                            onChange={(e) => setNewVarSize(e.target.value)}
                            className="h-9 text-xs bg-white rounded-lg border-[#DDD0B5] font-bold"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input 
                            type="number"
                            placeholder="Price ₹"
                            value={newVarPrice}
                            onChange={(e) => setNewVarPrice(e.target.value)}
                            className="h-9 text-xs bg-white rounded-lg border-[#DDD0B5] font-bold"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input 
                            type="number"
                            placeholder="MRP ₹"
                            value={newVarMrp}
                            onChange={(e) => setNewVarMrp(e.target.value)}
                            className="h-9 text-xs bg-white rounded-lg border-[#DDD0B5] font-bold"
                          />
                        </div>
                        <div className="col-span-2">
                          <button
                            type="button"
                            onClick={handleAddCustomVariant}
                            className="w-full h-9 bg-primary text-white rounded-lg text-xs font-black flex items-center justify-center hover:bg-secondary transition-all active:scale-90"
                            title="Add Variant"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Active Variants Table */}
                    <div className="space-y-1.5 pt-2 border-t border-[#E0D4BC]">
                      <div className="text-[9px] font-black uppercase tracking-wider text-[#7A6848] flex justify-between">
                        <span>Configured Variants (Customers will choose from these)</span>
                        <span>Click ★ to set default</span>
                      </div>
                      
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {variants.map((v, idx) => (
                          <div 
                            key={idx} 
                            className={cn(
                              "p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all",
                              v.on ? "bg-white border-primary shadow-xs ring-1 ring-primary/20" : "bg-white/80 border-[#DDD0B5]"
                            )}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleSetDefaultVariant(idx)}
                                title={v.on ? "Default Active Variant" : "Click to make default"}
                                className={cn(
                                  "w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs transition-all",
                                  v.on ? "bg-amber-400 text-[#100C06]" : "bg-gray-100 text-gray-400 hover:text-amber-500"
                                )}
                              >
                                ★
                              </button>
                              <span className="font-black text-[#100C06] truncate">{v.s}</span>
                              {v.on && (
                                <span className="text-[8px] bg-primary/10 text-primary font-black px-1.5 py-0.5 rounded uppercase">
                                  Default
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-[#7A6848] font-bold">₹</span>
                                <input
                                  type="number"
                                  value={v.p}
                                  onChange={(e) => handleVariantChange(idx, 'p', Number(e.target.value) || 0)}
                                  className="w-16 h-7 text-xs font-black bg-[#F9F6EF] px-1.5 rounded border border-[#DDD0B5]"
                                  placeholder="Price"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-gray-400 line-through">₹</span>
                                <input
                                  type="number"
                                  value={v.mrp || ''}
                                  onChange={(e) => handleVariantChange(idx, 'mrp', Number(e.target.value) || 0)}
                                  className="w-16 h-7 text-xs font-bold text-gray-500 bg-[#F9F6EF] px-1.5 rounded border border-[#DDD0B5]"
                                  placeholder="MRP"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="w-6 h-6 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded flex items-center justify-center transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Initial Stock</label>
                      <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="h-12 rounded-xl bg-[#F9F6EF] border-transparent px-5 font-bold" placeholder="100" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Rating (1-5)</label>
                      <Input value={rating} onChange={(e) => setRating(e.target.value)} className="h-12 rounded-xl bg-[#F9F6EF] border-transparent px-5 font-bold" placeholder="4.9" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Product Story</label>
                    <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="rounded-xl bg-[#F9F6EF] border-transparent px-5 py-4 font-bold min-h-[90px]" placeholder="Explain why this product is pure..." />
                  </div>
                </div>

                {/* Right Column: Images, Badges & Incentives */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Product Images</label>
                    <div className="flex flex-wrap gap-3">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/10 shadow-2xs">
                          <Image src={img} alt="Preview" fill className="object-cover" />
                          <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        placeholder="Paste image URL (https://...)" 
                        value={newImageUrl} 
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="h-10 text-xs bg-[#F9F6EF] border-transparent font-medium"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddImageUrl} 
                        variant="outline" 
                        className="h-10 text-xs border-[#DDD0B5] text-[#7A6848] font-bold"
                      >
                        Add URL
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Highlight Badge</label>
                      <Input value={statusBadge} onChange={(e) => setStatusBadge(e.target.value)} className="h-12 rounded-xl bg-[#F9F6EF] border-transparent px-5 font-bold" placeholder="Selling Fast" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Special Badge</label>
                      <Input value={topBadge} onChange={(e) => setTopBadge(e.target.value)} className="h-12 rounded-xl bg-[#F9F6EF] border-transparent px-5 font-bold" placeholder="Pure Harvest" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Units Sold Label</label>
                      <Input value={soldLabel} onChange={(e) => setSoldLabel(e.target.value)} className="h-12 rounded-xl bg-[#F9F6EF] border-transparent px-5 font-bold" placeholder="1.5k+" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Review Count</label>
                      <Input type="number" value={reviews} onChange={(e) => setReviews(e.target.value)} className="h-12 rounded-xl bg-[#F9F6EF] border-transparent px-5 font-bold" placeholder="278" />
                    </div>
                  </div>

                  {/* Incentives Card */}
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-5">
                    <div className="flex items-center gap-2 text-primary">
                      <Zap className="w-4 h-4" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest">Incentives & Coupons</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-[#7A6848] flex items-center gap-1.5">
                          <Ticket className="w-3 h-3" /> Exclusive Coupon
                        </label>
                        <Input value={productCoupon} onChange={(e) => setProductCoupon(e.target.value)} className="h-11 rounded-xl bg-white border-[#DDD0B5] font-bold text-xs" placeholder="e.g. GHEE100" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-[#7A6848] flex items-center gap-1.5">
                          <Coins className="w-3 h-3" /> Reward Purity Coins
                        </label>
                        <Input type="number" value={rewardCoins} onChange={(e) => setRewardCoins(e.target.value)} className="h-11 rounded-xl bg-white border-[#DDD0B5] font-bold text-xs" placeholder="50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }} disabled={isSaving} className="flex-1 h-14 rounded-full border-[#DDD0B5] font-black uppercase tracking-widest text-[#7A6848]">Discard</Button>
                <Button onClick={handleAdd} disabled={isSaving} className="flex-1 h-14 bg-[#1B5E3B] hover:bg-secondary rounded-full font-black uppercase tracking-widest shadow-xl text-white">
                  {isSaving ? 'Saving...' : (editingId ? 'Update Listing' : 'Publish Listing')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[40px] overflow-hidden bg-white">
        <div className="p-8 border-b border-[#F9F6EF] flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6848] w-4 h-4" />
            <Input 
              placeholder="Search managed inventory..." 
              value={searchTerm}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-12 pl-11 rounded-full bg-[#F9F6EF] border-transparent focus-visible:bg-white focus-visible:border-primary/20 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-4 text-[#7A6848] font-bold text-xs">
            <span className="uppercase tracking-widest">{filteredProducts.length} Items Live</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#FDFBFA]">
            <TableRow className="border-b-[#F9F6EF]">
              <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Product</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Size / Variants</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Price (₹)</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Coins & Coupons</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Stats</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848]">Stock</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-[#7A6848] text-right px-8">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? filteredProducts.map((p) => (
              <TableRow key={p.id} className="border-b-[#F9F6EF] hover:bg-[#FDFBFA] transition-colors group">
                <TableCell className="py-4 px-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F9F6EF] overflow-hidden relative border border-[#DDD0B5]/30">
                      <Image src={p.imageUrls?.[0] || 'https://picsum.photos/seed/vivaan/100/100'} alt={p.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#100C06]">{p.name}</div>
                      <div className="flex gap-1 mt-1">
                        {p.badges?.map((b: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-primary/5 text-primary text-[8px] font-black uppercase">{b}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {Array.isArray(p.vars) && p.vars.length > 0 ? (
                      p.vars.map((v: any, idx: number) => (
                        <span 
                          key={idx} 
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[9px] font-extrabold",
                            v.on ? "bg-primary/10 text-primary border border-primary/20" : "bg-[#F9F6EF] text-[#7A6848]"
                          )}
                        >
                          {v.s}: ₹{v.p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#7A6848] font-bold">{p.volumeValue ? `${p.volumeValue}${p.volumeUnit || ''}` : 'Standard'}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#7A6848] line-through opacity-50">₹{p.mrpPrice}</span>
                    <span className="text-sm font-black text-foreground">₹{p.basePrice?.toLocaleString('en-IN')}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <div className="space-y-1.5">
                     {p.rewardCoins ? (
                       <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-[#8B6E0F] border border-yellow-100 rounded-lg text-[9px] font-black">
                         <Coins className="w-2.5 h-2.5" /> +{p.rewardCoins} COINS
                       </div>
                     ) : <span className="text-[9px] text-muted-foreground italic">No Rewards</span>}
                     {p.productCoupon && (
                       <div className="block text-[9px] font-bold text-primary uppercase tracking-tight">
                         🏷️ {p.productCoupon}
                       </div>
                     )}
                   </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-xs font-bold"><Star className="w-3 h-3 text-primary fill-current" /> {p.rating}</div>
                    <div className="text-[10px] text-[#7A6848] font-medium">{p.soldCountLabel} sold</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "text-sm font-bold",
                    (p.stockQuantity || 0) <= 5 ? "text-destructive" : "text-[#7A6848]"
                  )}>{p.stockQuantity || 0}</span>
                </TableCell>
                <TableCell className="text-right px-8 space-x-2">
                  <button onClick={() => handleEdit(p)} className="w-9 h-9 rounded-xl text-[#7A6848] hover:bg-primary/5 transition-all"><Pen className="w-4 h-4 mx-auto" /></button>
                  <button onClick={() => handleDelete(p.id)} className="w-9 h-9 rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all"><Trash2 className="w-4 h-4 mx-auto" /></button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center text-[#7A6848] font-medium italic">
                  No {category} listings found. Click &quot;Add {category}&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
    </div>
  );
};
