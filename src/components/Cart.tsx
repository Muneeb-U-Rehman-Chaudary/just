"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { toggleCart } from "@/lib/features/cart/cartSlice";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  Trash2,
  ShoppingBag,
  ArrowRight,
  X,
  Shield,
  Minus,
  Plus,
  Zap,
} from "lucide-react";
import SafeImage from "./SafeImage";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useSession } from "@/hooks/useSession";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

export function Cart() {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector((state) => state.cart);
  const { cart, itemCount, removeFromCart, isLoading } = useCart();
  const { data: session } = useSession();

  const cartItems = cart?.items || [];
  const total = cartItems.reduce(
    (sum: number, item: any) => sum + (item.product?.price || 0),
    0
  );

  if (!session?.user) return null;

  return (
    <div className="contents">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[100] sm:bottom-8 sm:right-8"
          >
            <Button
              size="icon"
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-[2rem] bg-background text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-all duration-500 hover:bg-background relative border border-border/50 backdrop-blur-xl"
              onClick={() => dispatch(toggleCart())}
            >
              <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground border-2 border-background">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={isOpen} onOpenChange={() => dispatch(toggleCart())}>
        <SheetContent className="flex flex-col w-full sm:max-w-md border-l shadow-2xl p-0 h-full bg-background overflow-hidden">
          <SheetHeader className="p-8 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <SheetTitle className="text-2xl font-bold tracking-tight">
                  Your Shopping Cart
                </SheetTitle>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-muted"
                onClick={() => dispatch(toggleCart())}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Updating Cart...
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
              <div className="h-32 w-32 rounded-[2.5rem] bg-muted/30 flex items-center justify-center border border-border/50 shadow-inner">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold tracking-tight">
                  Cart is Empty
                </h3>
                <p className="text-sm text-muted-foreground max-w-[260px] mx-auto font-medium leading-relaxed">
                  Discover premium digital assets and start building something
                  amazing today.
                </p>
              </div>
              <Button
                className="rounded-2xl h-14 px-10 bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/10 hover:scale-105 transition-all"
                onClick={() => dispatch(toggleCart())}
              >
                Explore Marketplace
              </Button>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              <ScrollArea className="flex-1 px-8">
                <div className="py-8 space-y-8">
                  {cartItems.map((item: any) => {
                    const product = item.product;
                    if (!product) return null;

                    const images = product.images;
                    const mainImage = Array.isArray(images)
                      ? images[0]
                      : typeof images === "string"
                        ? images
                        : null;
                    const displayImage =
                      mainImage ||
                      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400";

                    return (
                      <div
                        key={item.productId}
                        className="flex gap-6 group items-center bg-muted/10 p-5 rounded-[2.5rem] border border-border/50 hover:border-primary/20 hover:bg-background transition-all duration-500"
                      >
                        <div className="h-24 w-24 rounded-[1.5rem] bg-muted relative overflow-hidden flex-shrink-0 border border-border/50 shadow-sm">
                          <SafeImage
                            src={displayImage}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1 h-24">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <Link
                                href={`/products/${item.productId}`}
                                className="font-medium text-lg hover:text-primary transition-colors truncate tracking-tight block"
                                onClick={() => dispatch(toggleCart())}
                              >
                                {product.title}
                              </Link>

                              <button
                                className="text-muted-foreground hover:text-destructive transition-colors p-2 bg-background rounded-full shadow-sm border border-border/10 flex-shrink-0"
                                onClick={() =>
                                  removeFromCart.mutate(item.productId)
                                }
                                disabled={removeFromCart.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-widest border-none px-2 py-0"
                              >
                                {product.category?.replace("-", " ") ||
                                  "Digital"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="font-bold text-2xl text-primary tracking-tighter">
                              ${product.price?.toFixed(2)}
                            </span>
                            {removeFromCart.isPending && (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="p-8 border-t bg-background space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-foreground">${total.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold tracking-tight">
                      Total Amount
                    </span>
                    <span className="text-3xl font-bold tracking-tighter">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 space-y-3">
                  <Button
                    variant="ghost"
                    className=" h-11 text-stone-500 rounded-2xl font-medium text-sm border-border/50"
                    asChild
                    onClick={() => dispatch(toggleCart())}
                  >
                    <Link href="/cart">Manage Full Cart</Link>
                  </Button>
                  <Button
                    className="h-11 rounded-md bg-primary text-primary-foreground font-bold text-base shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    asChild
                    onClick={() => dispatch(toggleCart())}
                  >
                    <Link href="/checkout">
                      Complete Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/5 text-green-600 text-[9px] font-bold uppercase tracking-[0.2em] border border-green-500/10">
                    <Shield className="h-3 w-3" />
                    <span>Secure Stripe Payments</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
