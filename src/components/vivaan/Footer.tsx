"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Send, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2,
  MessageCircle,
  ChevronRight
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative bg-primary text-white overflow-hidden border-t border-primary-dark/20">
      
      {/* ========================================================================= */}
      {/* 1. MOBILE COMPACT FOOTER (< md) - Clean, Minimalist, Space-Saving         */}
      {/* ========================================================================= */}
      <div className="md:hidden px-4 pt-8 pb-[calc(env(safe-area-inset-bottom,0px)+84px)] space-y-6 relative z-10 text-left">
        
        {/* Brand & Social in a Single Compact Row */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center p-1 shrink-0 shadow-sm">
              <Image 
                src="/mobile-logo.png" 
                alt="Vivaan Farms" 
                width={30} 
                height={30} 
                className="object-contain" 
              />
            </div>
            <div>
              <div className="font-headline text-base font-black tracking-wider uppercase text-white leading-tight">
                Vivaan Farms
              </div>
              <div className="text-[7.5px] font-extrabold text-secondary tracking-widest uppercase">
                A2 Gir Cow Bilona Ghee
              </div>
            </div>
          </div>

          {/* Social Icons Inline */}
          <div className="flex items-center gap-2">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-secondary hover:text-primary transition-all active:scale-95"
              aria-label="Facebook"
            >
              <Facebook className="h-3.5 w-3.5" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-secondary hover:text-primary transition-all active:scale-95"
              aria-label="Instagram"
            >
              <Instagram className="h-3.5 w-3.5" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-secondary hover:text-primary transition-all active:scale-95"
              aria-label="YouTube"
            >
              <Youtube className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Links 2-Column Grid with Comfortable Tap Targets */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-medium text-white/80 border-b border-white/10 pb-5">
          <Link href="/" className="py-2 hover:text-secondary flex items-center gap-1.5 transition-colors">
            <ChevronRight className="w-3 h-3 text-secondary/70 shrink-0" />
            <span>Store Home</span>
          </Link>
          <Link href="/track" className="py-2 hover:text-secondary flex items-center gap-1.5 transition-colors">
            <ChevronRight className="w-3 h-3 text-secondary/70 shrink-0" />
            <span>Track Order</span>
          </Link>
          <Link href="/about" className="py-2 hover:text-secondary flex items-center gap-1.5 transition-colors">
            <ChevronRight className="w-3 h-3 text-secondary/70 shrink-0" />
            <span>Our Farm Legacy</span>
          </Link>
          <Link href="/blog" className="py-2 hover:text-secondary flex items-center gap-1.5 transition-colors">
            <ChevronRight className="w-3 h-3 text-secondary/70 shrink-0" />
            <span>Ayurveda Blog</span>
          </Link>
          <Link href="/contact" className="py-2 hover:text-secondary flex items-center gap-1.5 transition-colors">
            <ChevronRight className="w-3 h-3 text-secondary/70 shrink-0" />
            <span>Contact Desk</span>
          </Link>
          <Link href="/about" className="py-2 hover:text-secondary flex items-center gap-1.5 transition-colors">
            <ChevronRight className="w-3 h-3 text-secondary/70 shrink-0" />
            <span>Pure Vedic Method</span>
          </Link>
        </div>

        {/* 1-Tap Quick Contact Action Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-5">
          <a
            href="tel:+919876543210"
            className="flex-1 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center gap-1.5 text-[11px] font-bold text-white transition-all active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 text-secondary" />
            <span>Call</span>
          </a>
          <a
            href="https://wa.me/919876543210?text=Hi%20Vivaan%20Farms,%20I'd%20like%20to%20inquire%20about%20your%20products."
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-2.5 rounded-xl bg-[#00d757]/20 border border-[#00d757]/40 hover:bg-[#00d757]/30 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-300 transition-all active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </a>
          <a
            href="mailto:care@vivaanfarms.com"
            className="flex-1 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center gap-1.5 text-[11px] font-bold text-white transition-all active:scale-95"
          >
            <Mail className="w-3.5 h-3.5 text-secondary" />
            <span>Email</span>
          </a>
        </div>

        {/* Streamlined Newsletter Row */}
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wider text-white/60">
            Newsletter & Exclusive Offers
          </div>
          <form onSubmit={handleSubscribe} className="relative flex items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for farm updates..."
              required
              className="w-full bg-white/10 text-white placeholder-white/40 text-xs rounded-full py-2.5 pl-4 pr-10 border border-white/20 focus:outline-none focus:border-secondary"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center font-bold active:scale-90 transition-transform cursor-pointer"
              title="Subscribe"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          {subscribed && (
            <p className="text-[11px] text-secondary font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed successfully!
            </p>
          )}
        </div>

        {/* Compact Legal Links, Trust & Copyright */}
        <div className="pt-2 text-center space-y-2.5">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-white/60">
            <Link href="/about" className="hover:text-secondary py-1">Privacy Policy</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-secondary py-1">Terms of Service</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-secondary py-1">Shipping & Refunds</Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[8.5px] font-black text-white/50 tracking-wider">
            <span className="px-1.5 py-0.5 rounded bg-white/10">UPI</span>
            <span className="px-1.5 py-0.5 rounded bg-white/10">VISA</span>
            <span className="px-1.5 py-0.5 rounded bg-white/10">MASTERCARD</span>
            <span className="px-1.5 py-0.5 rounded bg-white/10">COD</span>
          </div>

          <p className="text-[10px] text-white/40">
            © 2025 Vivaan Farms Natural Pvt Ltd · Gujarat, India
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP RICH FOOTER (>= md) - Original Full Layout Intact              */}
      {/* ========================================================================= */}
      <div className="hidden md:block max-w-[1400px] mx-auto px-10 pt-16 pb-8 relative z-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-white/10">
          
          {/* Column 1: Newsletter / Stay Connected */}
          <div className="relative space-y-4 lg:pr-4">
            <h2 className="text-xl md:text-2xl font-headline font-bold tracking-tight text-white">
              Stay Connected
            </h2>
            <p className="text-xs md:text-sm text-white/70 leading-relaxed">
              Join our newsletter for fresh farm updates, authentic recipes, and exclusive discount offers.
            </p>
            
            <form onSubmit={handleSubscribe} className="relative mt-2" suppressHydrationWarning>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                suppressHydrationWarning
                className="w-full bg-white/10 text-white placeholder-white/40 text-xs md:text-sm rounded-full py-3 pl-4 pr-12 border border-white/20 focus:outline-none focus:border-secondary focus:bg-white/15 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-8 w-8 md:h-9 md:w-9 rounded-full bg-secondary text-primary font-bold flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md"
                title="Subscribe"
              >
                <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="sr-only">Subscribe</span>
              </button>
            </form>

            {subscribed && (
              <p className="text-xs text-secondary font-bold animate-fade-in flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Thank you for subscribing to Vivaan Farms!
              </p>
            )}

            <div className="absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/50">
              Quick Links
            </h3>
            <nav className="space-y-2.5 text-xs md:text-sm font-medium text-white/80">
              <Link href="/" className="block transition-colors hover:text-secondary">
                Home
              </Link>
              <Link href="/about" className="block transition-colors hover:text-secondary">
                Our Legacy & Farm
              </Link>
              <Link href="/track" className="block transition-colors hover:text-secondary">
                Track Order
              </Link>
              <Link href="/blog" className="block transition-colors hover:text-secondary">
                Ayurveda & Health Blog
              </Link>
              <Link href="/contact" className="block transition-colors hover:text-secondary">
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/50">
              Contact Us
            </h3>
            <address className="space-y-3 text-xs md:text-sm not-italic text-white/80 font-medium">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <span>Vivaan Farms, Gir Somnath Region, Gujarat 362268, India</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-secondary shrink-0" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-secondary shrink-0" />
                <span>care@vivaanfarms.com</span>
              </p>
            </address>
          </div>

          {/* Column 4: Brand & Social */}
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-md shrink-0">
                <Image 
                  src="/mobile-logo.png" 
                  alt="Vivaan Farms Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain" 
                />
              </div>
              <div>
                <div className="font-headline text-lg font-black tracking-wider leading-none uppercase text-white">
                  Vivaan Farms
                </div>
                <div className="text-[8px] font-extrabold text-secondary tracking-[2px] uppercase mt-0.5">
                  100% Pure Gir Cow Bilona Ghee
                </div>
              </div>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Crafted using traditional Vedic Bilona methods for uncompromised aroma, taste, and health benefits.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary hover:text-primary transition-all flex items-center justify-center text-white/80 border border-white/10"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary hover:text-primary transition-all flex items-center justify-center text-white/80 border border-white/10"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary hover:text-primary transition-all flex items-center justify-center text-white/80 border border-white/10"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-white/70">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> 256-Bit SSL Safe Checkout
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs text-white/50">
            © 2025 Vivaan Farms Natural Private Limited. All rights reserved.
          </p>
          
          <nav className="flex flex-wrap justify-center gap-4 text-xs text-white/70">
            <Link href="/about" className="transition-colors hover:text-secondary">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/about" className="transition-colors hover:text-secondary">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/about" className="transition-colors hover:text-secondary">
              Shipping & Refund
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 text-[9px] font-black text-white/60 tracking-wider">
            <span className="px-2 py-1 rounded bg-white/10 border border-white/15">UPI</span>
            <span className="px-2 py-1 rounded bg-white/10 border border-white/15">VISA</span>
            <span className="px-2 py-1 rounded bg-white/10 border border-white/15">MASTERCARD</span>
            <span className="px-2 py-1 rounded bg-white/10 border border-white/15">NETBANKING</span>
            <span className="px-2 py-1 rounded bg-white/10 border border-white/15">COD</span>
          </div>
        </div>
      </div>

      {/* Watermark Logo */}
      <div className="absolute bottom-[-40px] md:bottom-[-100px] left-1/2 -translate-x-1/2 text-[18vw] md:text-[25vw] font-headline font-black text-white/[0.03] pointer-events-none select-none uppercase tracking-tighter">
        VIVAAN
      </div>
    </footer>
  );
};
