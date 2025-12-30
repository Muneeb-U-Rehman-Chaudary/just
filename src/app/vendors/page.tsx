"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Package, ShoppingBag, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useVendors } from "@/hooks/useApi";

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading: loading } = useVendors();

  const vendors = data?.vendors || [];
  const filteredVendors = vendors.filter((vendor: any) =>
    vendor.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="gradient-bg text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Top Performing Vendors
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">
              Our <span className="gradient-text">Vendors</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover talented creators and browse their premium digital products
            </p>
            
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search vendors by name or store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVendors.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVendors.map((vendor: any) => (
                <Card key={vendor.id || vendor._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                          <AvatarImage src={vendor.image} alt={vendor.name} />
                          <AvatarFallback className="gradient-bg text-white">
                            {vendor.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{vendor.storeName}</h3>
                          <p className="text-sm text-muted-foreground truncate">{vendor.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{vendor.rating?.toFixed(1) || "0.0"}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {vendor.storeDescription || "Quality digital products"}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span>{vendor.productCount || 0} products</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <ShoppingBag className="h-4 w-4" />
                          <span>{vendor.totalSales || 0} sales</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/vendors/${vendor.id || vendor._id}`}>
                          View Store
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No vendors found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'Check back later for featured vendors'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
