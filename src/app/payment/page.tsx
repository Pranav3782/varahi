"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Header } from '@/components/vivaan/Header';
import { Footer } from '@/components/vivaan/Footer';
import { Ticker } from '@/components/vivaan/Ticker';
import { BottomNav } from '@/components/vivaan/BottomNav';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, ChevronLeft } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/actions/payment-actions';
import { createShipment } from '@/actions/shipping-actions';
import { doc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types';

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const { cart, totalQty, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [checkoutState, setCheckoutState] = useState<any>(null);

  useEffect(() => {
    const savedAddress = localStorage.getItem('vivaan_shipping');
    const savedState = localStorage.getItem('vivaan_checkout_state');
    
    if (savedAddress && savedState) {
      setShippingAddress(JSON.parse(savedAddress));
      setCheckoutState(JSON.parse(savedState));
    } else {
      router.push('/checkout');
    }
  }, [router]);

  const total = checkoutState?.finalTotal || subtotal;

  const handleRazorpayPayment = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please sign in to complete your purchase." });
      router.push('/login?returnTo=/payment');
      return;
    }

    setLoading(true);

    try {
      const res = await createRazorpayOrder(total);
      if (!res.success || !res.order) throw new Error(res.error || 'Order creation failed');
      const order = res.order;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Vivaan Farms",
        description: "Farm-Direct Purity Purchase",
        image: "/mobile-logo.png",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verificationRes = await verifyRazorpayPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verificationRes.success) {
              // 1. Create Shipping
              const shippingRes = await createShipment({
                orderId: response.razorpay_order_id,
                userEmail: user.email,
                items: cart,
                shippingAddress
              });

              // 2. Save Order to Firestore
              const orderData = {
                userId: user.uid,
                userEmail: user.email,
                items: cart,
                totalAmount: total,
                shippingAddress,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                status: 'Processing',
                paymentStatus: 'Paid',
                paymentMethod: 'Razorpay',
                orderDate: new Date().toISOString(),
                createdAt: serverTimestamp(),
                shipmentId: shippingRes.success ? shippingRes.shipmentId : null,
                trackingId: shippingRes.success ? shippingRes.trackingId : null,
                courierName: shippingRes.success ? shippingRes.courierName : null,
                coinsEarned: checkoutState.earnedCoins || 0,
                coinsRedeemed: checkoutState.coinsRedeemed || 0,
                couponApplied: checkoutState.appliedCoupon || null
              };

              await setDoc(doc(db, 'orders', response.razorpay_order_id), orderData);
              
              // 3. Update User Coins Ledger
              const userProfileRef = doc(db, 'userProfiles', user.uid);
              await setDoc(userProfileRef, {
                purityCoins: increment((checkoutState.earnedCoins || 0) - (checkoutState.coinsRedeemed || 0)),
                updatedAt: new Date().toISOString()
              }, { merge: true });

              toast({ title: "Payment Successful", description: "Coins credited and order processed!" });
              
              clearCart();
              localStorage.removeItem('vivaan_shipping');
              localStorage.removeItem('vivaan_checkout_state');
              
              if (shippingRes.success) {
                localStorage.setItem('vivaan_last_tracking', shippingRes.trackingId);
              }

              // Pass earned coins to the success page so it shows the real number
              localStorage.setItem('vivaan_last_earned_coins', String(checkoutState.earnedCoins || 0));
              
              router.push('/order-success');
            } else {
              // Don't silently discard the verification error — log it and tell the user
              console.error('Payment verification failed:', verificationRes.error);
              toast({ variant: "destructive", title: "Verification Failed", description: "Payment signature could not be verified. If money was deducted, it will be refunded automatically." });
              router.push('/order-failed');
            }
          } catch (err: any) {
            // CRITICAL SAFETY NET: At this point Razorpay has already captured the money.
            // If Firestore write or shipping call fails here, the payment is taken but the
            // order is not recorded. We log everything needed for manual recovery.
            console.error('Post-payment processing error:', err);
            console.error('Recovery info — Razorpay Order ID:', response.razorpay_order_id);
            console.error('Recovery info — Razorpay Payment ID:', response.razorpay_payment_id);
            toast({ 
              variant: "destructive", 
              title: "Order Processing Error", 
              description: "Your payment was received but order processing failed. Please contact support with Payment ID: " + response.razorpay_payment_id
            });
            setLoading(false);
          }
        },
        prefill: {
          name: user.displayName || shippingAddress.name,
          email: user.email || "",
          contact: shippingAddress.phone || "",
        },
        theme: { color: "#1B5E3B" },
        modal: { ondismiss: () => setLoading(false) }
      };

      // Guard: Make sure checkout.js has finished loading before we try to use it
      if (typeof (window as any).Razorpay === 'undefined') {
        toast({ variant: "destructive", title: "Payment Gateway Loading", description: "The secure checkout is still loading. Please wait a moment and try again." });
        setLoading(false);
        return;
      }

      const rzp = new (window as any).Razorpay(options);

      // Listen for payment failures (bank decline, wrong OTP, insufficient funds, timeout, etc.)
      // Razorpay fires this event INSTEAD of calling handler() — without this listener,
      // a failed payment leaves the user stuck with a spinning button and no feedback.
      rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay payment.failed:', response.error);
        toast({ 
          variant: "destructive", 
          title: "Payment Failed", 
          description: response.error?.description || "Your payment was declined. Please try again or use a different method."
        });
        setLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error('Payment Error:', error);
      toast({ variant: "destructive", title: "Payment Error", description: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6EF] text-[#100C06] pb-[68px] md:pb-0">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Ticker />
      <Header onOpenCart={() => {}} cartCount={totalQty} onFilter={() => {}} onSearch={() => {}} />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-16 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 text-primary font-bold text-xs sm:text-sm mb-6 sm:mb-8 hover:gap-2.5 transition-all cursor-pointer py-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Checkout
          </button>

          <div className="bg-white rounded-3xl md:rounded-[40px] shadow-xl overflow-hidden border border-primary/10">
            <div className="bg-primary p-6 sm:p-8 md:p-10 text-white text-center relative overflow-hidden">
              <div className="absolute top-[-40px] right-[-40px] w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
              <div className="text-[10px] font-black uppercase tracking-[3px] opacity-60 mb-2">Total Payable Amount</div>
              <div className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold leading-none break-all">
                ₹{total.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-5 sm:p-8 md:p-10">
              <h2 className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-[2px] mb-4 sm:mb-6">
                Order Summary & Breakdown
              </h2>
              
              <div className="bg-[#FAF7EF] border border-[#EEE0BC] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#7A6848] font-medium">Items Total ({totalQty} items)</span>
                    <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {checkoutState?.coinsRedeemed > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm text-secondary font-bold">
                      <span>Purity Coins Redeemed</span>
                      <span>−₹{checkoutState.coinsRedeemed}</span>
                    </div>
                  )}
                  {checkoutState?.appliedCoupon && (
                    <div className="flex justify-between text-xs sm:text-sm text-emerald-700 font-bold">
                      <span>Coupon Discount ({checkoutState.appliedCoupon})</span>
                      <span>Applied</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs sm:text-sm text-[#7A6848] font-medium">
                    <span>Shipping Fee</span>
                    <span className="font-bold text-emerald-700">FREE</span>
                  </div>
                  <div className="pt-3 border-t border-[#DDD0B5]/60 flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-gray-900">Final Total</span>
                    <span className="font-headline text-2xl sm:text-3xl font-extrabold text-primary">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8 text-primary font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-primary/5 py-3 px-4 rounded-xl border border-primary/10">
                <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                <span>256-Bit Encrypted · Razorpay & NimbusPost</span>
              </div>

              <Button 
                onClick={handleRazorpayPayment}
                disabled={loading}
                className="w-full h-14 sm:h-16 bg-gradient-to-br from-[#1B5E3B] to-[#0D3520] hover:from-[#14482D] hover:to-[#092617] text-white rounded-full font-black uppercase tracking-wider shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                {loading ? '⏳ Preparing Payment...' : `Pay ₹${total.toLocaleString('en-IN')} via Razorpay →`}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
