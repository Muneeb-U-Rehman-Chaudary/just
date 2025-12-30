"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Package, ShoppingBag, TrendingUp, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import { VendorNotificationBanner } from "@/components/VendorNotificationBanner";
import { useSession } from "@/hooks/useSession";

export default function VendorDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("createdAt");

  useEffect(() => {
    if (params.id) {
      fetchVendor();
      fetchProducts();
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchProducts();
    }
  }, [sortBy]);

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${params.id}`);
      const data = await response.json();
      setVendor(data.vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await fetch(`/api/products?vendorId=${params.id}&status=approved&sortBy=${sortBy}&order=desc`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Vendor not found</h1>
          <p className="text-muted-foreground mb-4">
            The vendor you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/vendors">Browse Vendors</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isVendorOwner = session?.user?.id === vendor.id && session?.user?.role === 'vendor';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Vendor Header */}
      <section className="border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Notification Banner for Vendor Owner */}
            {isVendorOwner && (
              <VendorNotificationBanner vendorId={vendor.id} className="mb-6" />
            )}

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={vendor.image} alt={vendor.name} />
                <AvatarFallback className="gradient-bg text-white text-4xl">
                  {vendor.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="gradient-bg">Verified Vendor</Badge>
                    <WhatsAppButton variant="outline" size="sm" />
                  </div>
                  <h1 className="text-4xl font-bold mb-2">{vendor.storeName}</h1>
                  <p className="text-xl text-muted-foreground">{vendor.name}</p>
                </div>

                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{products.length}</span>
                    <span className="text-muted-foreground">Products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{vendor.totalSales}</span>
                    <span className="text-muted-foreground">Sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">${vendor.totalEarnings.toLocaleString()}</span>
                    <span className="text-muted-foreground">Earnings</span>
                  </div>
                </div>

                {vendor.storeDescription && (
                  <p className="text-muted-foreground">{vendor.storeDescription}</p>
                )}

                {vendor.bio && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-sm text-muted-foreground">{vendor.bio}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Products by {vendor.storeName}</h2>
              <p className="text-muted-foreground">
                Browse all products from this vendor
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Latest</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="sales">Best Selling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground">
                  This vendor hasn't published any products yet. Check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}