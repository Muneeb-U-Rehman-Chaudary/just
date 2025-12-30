"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  Lock,
  CheckCircle2,
  Loader2,
  Smartphone,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  PartyPopper,
    Package,
    Download,
    Shield,
  } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";

function CheckoutContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("jazzcash");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [orderCompleted, setOrderCompleted] = useState(false);
  
  // Card states
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      toast.error("Payment was canceled. Please try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/checkout");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user && !isPending) {
      fetchCart();
    }
  }, [session, isPending]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCart(data.cart?.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (paymentMethod !== "stripe" && !phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (paymentMethod === "stripe") {
      if (!cardHolder || !cardNumber || !expiry || !cvc) {
        toast.error("Please fill in all card details");
        return;
      }
    }

    setProcessing(true);
    
    // Simulate API call for local methods or card simulation
    setTimeout(() => {
      setProcessing(false);
      setOrderCompleted(true);
      toast.success("Order placed successfully!");
      // In a real app, we'd clear the cart on the server here
    }, 2500);
  };

  const total = cart.reduce((sum: number, item: any) => sum + (item.product?.price || 0), 0);

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-[400px] w-full border border-gray-100 rounded-[1.5rem]" />
                <Skeleton className="h-[400px] w-full border border-gray-100 rounded-[1.5rem]" />
              </div>
              <Skeleton className="h-[500px] w-full border border-gray-100 rounded-[1.5rem]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <div className="h-20 w-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-gray-900">Order Completed Successfully!</h1>
                <p className="text-lg text-muted-foreground font-medium">Your assets are ready for download and license keys have been generated.</p>
              </div>
            </div>

            <Card className="border border-gray-200 shadow-none rounded-[2rem] overflow-hidden bg-gray-50/30">
              <div className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  <div className="text-center md:text-left">
                    <p>Reference Number</p>
                    <p className="text-gray-900 text-base mt-1 font-bold">#DV-{Math.floor(Math.random() * 1000000)}</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p>Transaction Date</p>
                    <p className="text-gray-900 text-base mt-1 font-bold">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p>Total Investment</p>
                    <p className="text-primary text-base mt-1 font-bold">${total.toFixed(2)}</p>
                  </div>
                </div>

                <Separator className="bg-gray-200" />

                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 text-left flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-400" />
                    Purchased Assets & Licenses
                  </h3>
                  <div className="grid gap-4">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-gray-100 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 text-lg">{item.product?.title}</span>
                          <Button variant="ghost" size="sm" className="font-semibold text-primary hover:text-primary hover:bg-primary/5 rounded-lg h-9">
                            <Download className="h-4 w-4 mr-2" />
                            Download Asset
                          </Button>
                        </div>
                        
                        <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Personal License Key</span>
                            <span className="text-[10px] font-semibold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded">Active</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <code className="text-xs font-mono text-gray-600 truncate bg-white px-2 py-1 rounded border border-gray-100 flex-1">
                              DV-LCN-{Math.random().toString(36).substring(2, 10).toUpperCase()}-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                            </code>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 font-semibold border-gray-200">Copy</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-xl px-10 font-semibold h-14 shadow-none" asChild>
                <Link href="/orders">
                  Go to My Library
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl px-10 font-semibold h-14 border-gray-200 hover:bg-gray-50 transition-colors shadow-none" asChild>
                <Link href="/products">Continue Browsing</Link>
              </Button>
            </div>

            <div className="pt-8 flex flex-col items-center gap-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                <PartyPopper className="h-5 w-5 text-yellow-500" />
                <span>An email confirmation has been sent to your inbox.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'jazzcash', name: 'JazzCash', sub: 'Instant mobile wallet payment', popular: true },
    { id: 'easypaisa', name: 'EasyPaisa', sub: 'Secure mobile account transfer' },
    { id: 'nayapay', name: 'NayaPay', sub: 'Fast digital wallet payment' },
    { id: 'stripe', name: 'Credit / Debit Card', sub: 'Secure payment via Stripe' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 flex items-center gap-3">
              <Lock className="h-7 w-7 text-primary" />
              Secure Checkout
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">
              Finalize your purchase and get instant access to your digital assets
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items */}
              <Card className="border border-gray-200 shadow-none rounded-[1.5rem] bg-white overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 font-semibold text-gray-900">
                    <ShoppingBag className="h-5 w-5" />
                    Cart Summary ({cart.length} items)
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {cart.map((item) => {
                      const product = item.product;
                      if (!product) return null;
                      const displayImage = product.images?.[0] || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400";

                      return (
                        <div key={item.productId} className="p-6 flex items-center gap-6">
                           <Link href={`/products/${item.productId}`}>
                              {" "}
                              <div className="relative h-20 w-20 rounded-2xl overflow-hidden hover:scale-105 transition-all ease-in bg-gray-50 border border-gray-100 flex-shrink-0">
                                <SafeImage
                                  src={displayImage}
                                  alt={product.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </Link>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <Link href={`/products/${item.productId}`}>
                                <h3 className="text-base hover:text-primary transition-all ease-in font-semibold text-gray-900 truncate tracking-tight">
                                  {product.title}
                                </h3>
                              </Link>
                            <p className="text-xs text-gray-400 font-medium truncate">
                              by {product.vendor?.storeName || "Premium Creator"}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">
                              ${product.price?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="border border-gray-200 shadow-none rounded-[1.5rem] bg-white overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 font-semibold text-gray-900">
                    <CreditCard className="h-5 w-5" />
                    Payment Selection
                  </div>
                </div>
                <CardContent className="p-6 space-y-8">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id}>
                        <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                        <Label
                          htmlFor={method.id}
                          className={`flex flex-col gap-1 p-5 rounded-2xl border transition-all cursor-pointer peer-aria-checked:border-primary peer-aria-checked:bg-primary/5 hover:bg-gray-50 ${
                            paymentMethod === method.id ? "border-primary bg-primary/5" : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">{method.name}</span>
                            {method.popular && (
                              <Badge className="bg-primary text-white text-[8px] px-2 py-0 rounded font-semibold uppercase tracking-widest shadow-none">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium">{method.sub}</p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {paymentMethod !== "stripe" && (
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-900">Phone Number *</Label>
                        <Input 
                          placeholder="03XX XXXXXXX" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="h-12 rounded-xl border-gray-200 focus:ring-primary/10 text-base font-semibold shadow-none"
                        />
                        <p className="text-[11px] text-muted-foreground font-medium">
                          Associated with your {paymentMethod} mobile account
                        </p>
                      </div>
                      <div className="flex items-start gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                        <Smartphone className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                          A secure payment prompt will appear on your phone. Please authorize it to complete the transaction.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "stripe" && (
                    <div className="space-y-6 pt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-900">Name on Card</Label>
                          <Input 
                            placeholder="Full name" 
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="h-12 rounded-xl border-gray-200 focus:ring-primary/10 font-semibold shadow-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-900">Card Number</Label>
                          <div className="relative">
                            <Input 
                              placeholder="0000 0000 0000 0000" 
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="h-12 rounded-xl border-gray-200 focus:ring-primary/10 font-semibold pr-12 shadow-none"
                            />
                            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">Expiry</Label>
                            <Input 
                              placeholder="MM / YY" 
                              value={expiry}
                              onChange={(e) => setExpiry(e.target.value)}
                              className="h-12 rounded-xl border-gray-200 focus:ring-primary/10 font-semibold shadow-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">CVC</Label>
                            <Input 
                              placeholder="123" 
                              type="password"
                              maxLength={3}
                              value={cvc}
                              onChange={(e) => setCvc(e.target.value)}
                              className="h-12 rounded-xl border-gray-200 focus:ring-primary/10 font-semibold shadow-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <Shield className="h-4 w-4 text-primary" />
                        <p className="text-[11px] text-primary font-medium leading-relaxed">
                          Your payment is encrypted and secured by industrial-grade protection.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="border border-gray-200 shadow-none rounded-[1.5rem] bg-white sticky top-24">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900 uppercase tracking-widest">Order Review</h2>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[13px] font-medium">
                      <span className="text-gray-400">Products Subtotal</span>
                      <span className="text-gray-900">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[13px] font-medium">
                      <span className="text-gray-400">Digital Processing</span>
                      <span className="text-green-600 font-semibold">Gratis</span>
                    </div>
                    <Separator className="bg-gray-100 my-4" />
                    <div className="flex justify-between items-end">
                      <span className="font-semibold text-gray-900">Grand Total</span>
                      <span className="text-2xl font-bold text-primary tracking-tighter">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-14 rounded-xl font-semibold text-base shadow-none"
                    onClick={handleCheckout}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Authorize Payment
                      </>
                    )}
                  </Button>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    {[
                      "End-to-end encryption",
                      "Instant delivery via email",
                      "Lifetime update access",
                      "Standard commercial license"
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-[400px] w-full border border-gray-100 rounded-[1.5rem]" />
                <Skeleton className="h-[400px] w-full border border-gray-100 rounded-[1.5rem]" />
              </div>
              <Skeleton className="h-[500px] w-full border border-gray-100 rounded-[1.5rem]" />
            </div>
          </div>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
