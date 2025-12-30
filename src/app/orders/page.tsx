"use client";

import { useSession } from "@/hooks/useSession";
import { useOrders } from "@/hooks/useApi";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  Search, 
  ExternalLink, 
  Calendar, 
  CreditCard, 
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: ordersData, isLoading: ordersLoading } = useOrders();

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?redirect=/orders");
    }
  }, [session, sessionLoading, router]);

  if (sessionLoading || !session?.user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const orders = ordersData?.orders || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">My Orders</h1>
            <p className="text-muted-foreground mt-2 font-medium">
              Manage your purchases and download your digital assets.
            </p>
          </div>
          
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-md border-border/50 font-semibold" asChild>
                <Link href="/products">
                  Continue Shopping
                </Link>
              </Button>
            </div>
        </div>

        {ordersLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-border/50 shadow-none rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <Skeleton className="h-24 w-24 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-4">
                      <Skeleton className="h-6 w-1/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-border/50 shadow-none rounded-[3rem] bg-muted/30 border-dashed py-20 text-center">
            <CardContent className="space-y-6">
              <div className="h-24 w-24 bg-background rounded-full flex items-center justify-center mx-auto border border-border/50">
                <Package className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight">No orders found</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                  You haven't made any purchases yet. Explore our marketplace to find premium digital products.
                </p>
              </div>
                <Button size="lg" className="rounded-md px-8 font-semibold shadow-none" asChild>
                  <Link href="/products">
                    Explore Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
              const status = order.paymentStatus || 'pending';
              
              return (
                <Card key={order.orderId} className="group border-border/50 shadow-none hover:border-primary/40 transition-all duration-300 rounded-[2rem] overflow-hidden bg-background">
                  <CardContent className="p-0">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="h-20 w-20 bg-muted rounded-2xl flex items-center justify-center border border-border/50 group-hover:bg-primary/5 transition-colors">
                          <Package className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold tracking-tight">Order #{order.orderId}</h3>
                            <Badge 
                              variant={status === 'completed' ? 'default' : 'secondary'}
                              className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                status === 'completed' ? 'bg-green-500 hover:bg-green-600' : 
                                status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-destructive'
                              }`}
                            >
                              {status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.orderDate).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              {order.paymentMethod?.toUpperCase() || 'STRIPE'}
                            </div>
                            <div className="text-foreground font-semibold">
                              {items.length} {items.length === 1 ? 'Item' : 'Items'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:flex-col md:items-end gap-4 border-t md:border-t-0 pt-6 md:pt-0">
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Total Amount</p>
                          <p className="text-2xl font-bold tracking-tight text-primary">
                            ${(order.totalAmount || 0).toFixed(2)}
                          </p>
                        </div>
                        
                          <Button variant="outline" className="rounded-md font-semibold border-border/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-none" asChild>
                            <Link href={`/orders/${order.orderId}`}>
                              View Details
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Instant Delivery",
              desc: "Download your digital assets immediately after successful payment.",
              icon: CheckCircle,
              color: "text-green-500"
            },
            {
              title: "Lifetime Access",
              desc: "Get lifetime access to your purchases and future updates.",
              icon: Clock,
              color: "text-blue-500"
            },
            {
              title: "Dedicated Support",
              desc: "Need help with your purchase? Our support team is here for you.",
              icon: AlertCircle,
              color: "text-purple-500"
            }
          ].map((feature, i) => (
            <div key={i} className="space-y-4">
              <div className={`h-12 w-12 rounded-2xl bg-muted flex items-center justify-center border border-border/50`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h4 className="text-lg font-semibold tracking-tight">{feature.title}</h4>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer (Simplified) */}
      <footer className="border-t border-border/40 bg-background py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground/60">
            © 2024 DigiVerse Marketplace. Your security is our priority.
          </p>
        </div>
      </footer>
    </div>
  );
}
