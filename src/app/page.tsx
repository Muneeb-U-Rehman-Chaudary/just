"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Award, Users, Package, ArrowRight, Star, ShoppingBag, Sparkles, Zap, Globe, Shield } from "lucide-react";
import Link from "next/link";
import { useProducts, useVendors } from "@/hooks/useApi";

export default function Home() {
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");

  const { data: productsData, isLoading: loading } = useProducts({
    category: category !== "all" ? category : undefined,
    sortBy,
    limit: 12,
  });

  const { data: vendorsData, isLoading: vendorsLoading } = useVendors();

  const allProducts = productsData?.products || [];
  const sponsoredProducts = allProducts.filter((p: any) => p.sponsored);
  const regularProducts = allProducts.filter((p: any) => !p.sponsored);
  const products = [...sponsoredProducts, ...regularProducts];

  const allVendors = vendorsData?.vendors || [];
  const sponsoredVendors = allVendors.filter((v: any) => v.sponsored);
  const regularVendors = allVendors.filter((v: any) => !v.sponsored);
  const vendors = [...sponsoredVendors, ...regularVendors].slice(0, 8);

  const categories = [
    { value: "all", label: "All Products" },
    { value: "wordpress-theme", label: "WordPress Themes" },
    { value: "plugin", label: "Plugins" },
    { value: "template", label: "Templates" },
    { value: "ui-kit", label: "UI Kits" },
    { value: "design", label: "Designs" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center bg-muted/30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold uppercase tracking-wider text-primary/80">Premium Digital Marketplace</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1]">
                Premium Digital
                <span className="block text-primary">Products for</span>
                <span className="block">Creators</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Discover high-quality WordPress themes, plugins, templates, 
                and digital designs from top vendors worldwide.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button size="lg" className="rounded-xl text-lg h-14 px-8 font-semibold bg-primary text-primary-foreground shadow-none hover:scale-[1.02] transition-all" asChild>
                  <Link href="/products">
                    Explore Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl text-lg h-14 px-8 font-semibold border-border/50 backdrop-blur-sm hover:bg-white/5 transition-all shadow-none" asChild>
                  <Link href="/vendor-signup">Become a Vendor</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start pt-8">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Instant Download</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>Global Support</span>
                </div>
              </div>
            </div>

            <div className="relative h-[400px] lg:h-[500px] order-1 lg:order-2">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[320px] lg:w-[350px]">
                <Card className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] border border-gray-100 rounded-[2rem] bg-background/40 backdrop-blur-3xl p-2 transition-transform hover:scale-[1.02] duration-500">
                  <CardContent className="p-6">
                    <div className="aspect-[4/3] bg-muted rounded-[1.5rem] mb-6 flex items-center justify-center overflow-hidden border border-border/50">
                      <Package className="h-20 w-20 text-muted-foreground/20" />
                    </div>
                    <div className="space-y-4">
                      <div className="h-6 bg-muted rounded-full w-3/4" />
                      <div className="h-4 bg-muted rounded-full w-1/2" />
                      <div className="flex items-center gap-1.5 pt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats Cards */}
              <div className="absolute top-12 -left-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <Card className="shadow-none border border-gray-100 rounded-xl p-4 bg-background/60 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center border border-primary/20">
                      <TrendingUp className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">8K+ Sales</p>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">This month</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="absolute bottom-12 -right-4 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <Card className="shadow-none border border-gray-100 rounded-xl p-4 bg-background/60 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center border border-green-500/20">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">4.9 Rating</p>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Trustpilot</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/50 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Products", value: "50K+", icon: Package },
              { label: "Customers", value: "120K+", icon: Users },
              { label: "Vendors", value: "8K+", icon: TrendingUp },
              { label: "Rating", value: "4.9/5", icon: Award }
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-3 group">
                <stat.icon className="h-8 w-8 mx-auto text-primary group-hover:text-primary transition-colors" />
                <div className="text-3xl font-semibold tracking-tight">{stat.value}</div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vendors Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-6 rounded-full px-4 py-1 text-[12px] font-semibold uppercase tracking-[0.125em] border-primary/20 text-primary">Elite Contributors</Badge>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
              Featured Vendors
            </h2>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              Meet our top-rated creators producing premium digital assets trusted by thousands of customers
            </p>
          </div>

          {vendorsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-8 border border-border/50 rounded-[2rem] space-y-6">
                  <div className="flex items-center gap-5">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : vendors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vendors.map((vendor: any) => (
                <Card key={vendor.id} className="group border border-border/50 shadow-none hover:border-primary/40 transition-all duration-500 rounded-[2rem] bg-muted/30 hover:bg-background">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-5">
                        <Avatar className="h-14 w-14 border-2 border-background">
                          <AvatarImage src={vendor.image} alt={vendor.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                            {vendor.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg truncate tracking-tight">{vendor.storeName}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">{vendor.rating?.toFixed(1) || "0.0"}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 font-medium leading-relaxed h-10">
                        {vendor.storeDescription || "Providing quality digital assets to the creative community worldwide."}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Products</span>
                          <span className="text-lg font-semibold">{vendor.productCount || 0}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Sales</span>
                          <span className="text-lg font-semibold">{vendor.totalSales || 0}</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full h-11 rounded-xl font-semibold border-border/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 shadow-none" asChild>
                        <Link href={`/vendors/${vendor.id}`}>
                          Explore Store
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-muted/20">
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">Featured Products</h2>
              <p className="text-muted-foreground font-medium">
                Discover our handpicked collection of premium digital products.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px] h-11 rounded-xl bg-background border border-gray-100 shadow-none">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-100 shadow-none">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl bg-background border border-gray-100 shadow-none">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-100 shadow-none">
                  <SelectItem value="createdAt">Latest</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="rating">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[16/10] rounded-[2rem]" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center pt-8">
            <Button variant="outline" size="lg" className="rounded-xl px-10 h-12 font-semibold border-border/50 shadow-none" asChild>
              <Link href="/products">
                Browse All Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#60a5fa] px-8 py-20 text-center text-white border border-blue-400">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
              Start Selling Your Digital Products Today
            </h2>
            <p className="text-lg sm:text-xl text-white/80 font-medium">
              Join thousands of vendors earning passive income by selling their digital products on DigiVerse. Get started in minutes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="rounded-xl h-14 px-8 font-semibold bg-white text-primary hover:bg-white/90 shadow-none" asChild>
                <Link href="/vendor-signup">
                  Become a Vendor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl h-14 px-8 font-semibold border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 shadow-none" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-semibold tracking-tighter text-primary">DigiVerse</span>
              </div>
              <p className="text-muted-foreground font-medium leading-relaxed max-w-[200px]">
                Your trusted marketplace for premium digital products.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-foreground">Products</h4>
              <ul className="space-y-4">
                <li><Link href="/products?category=wordpress-theme" className="text-muted-foreground hover:text-primary font-medium transition-colors">WordPress Themes</Link></li>
                <li><Link href="/products?category=plugin" className="text-muted-foreground hover:text-primary font-medium transition-colors">Plugins</Link></li>
                <li><Link href="/products?category=template" className="text-muted-foreground hover:text-primary font-medium transition-colors">Templates</Link></li>
                <li><Link href="/products?category=ui-kit" className="text-muted-foreground hover:text-primary font-medium transition-colors">UI Kits</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold text-foreground">Company</h4>
              <ul className="space-y-4">
                <li><Link href="/products" className="text-muted-foreground hover:text-primary font-medium transition-colors">Browse Products</Link></li>
                <li><Link href="/vendors" className="text-muted-foreground hover:text-primary font-medium transition-colors">Our Vendors</Link></li>
                <li><Link href="/vendor-signup" className="text-muted-foreground hover:text-primary font-medium transition-colors">Become a Vendor</Link></li>
                <li><Link href="/vendor/analytics" className="text-muted-foreground hover:text-primary font-medium transition-colors">Vendor Analytics</Link></li>
                <li><Link href="/vendor/sponsorship" className="text-muted-foreground hover:text-primary font-medium transition-colors">Sponsorships</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold text-foreground">Account</h4>
              <ul className="space-y-4">
                <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary font-medium transition-colors">User Dashboard</Link></li>
                <li><Link href="/orders" className="text-muted-foreground hover:text-primary font-medium transition-colors">My Orders</Link></li>
                <li><Link href="/cart" className="text-muted-foreground hover:text-primary font-medium transition-colors">Shopping Cart</Link></li>
                <li><Link href="/checkout" className="text-muted-foreground hover:text-primary font-medium transition-colors">Checkout</Link></li>
                <li><Link href="/notifications" className="text-muted-foreground hover:text-primary font-medium transition-colors">Notifications</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-16 pt-8 text-center">
            <p className="text-sm font-medium text-muted-foreground/60">© 2024 DigiVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
