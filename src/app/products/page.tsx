"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, Filter, X, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useProducts } from "@/hooks/useApi";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string>(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [order, setOrder] = useState<string>("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("all");

  const { data, isLoading: loading } = useProducts({
    category: category !== "all" ? category : undefined,
    search: searchQuery || undefined,
    sortBy,
    limit: 50,
  });

  let products = data?.products || [];
  
  if (priceRange !== "all") {
    products = products.filter((p: any) => {
      switch (priceRange) {
        case "under25": return p.price < 25;
        case "25to50": return p.price >= 25 && p.price <= 50;
        case "50to100": return p.price >= 50 && p.price <= 100;
        case "over100": return p.price > 100;
        default: return true;
      }
    });
  }
  
  const sponsored = products.filter((p: any) => p.sponsored);
  const regular = products.filter((p: any) => !p.sponsored);
  products = [...sponsored, ...regular];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const clearFilters = () => {
    setCategory("all");
    setSortBy("createdAt");
    setOrder("desc");
    setSearchQuery("");
    setSearchInput("");
    setPriceRange("all");
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "wordpress-theme", label: "WordPress Themes" },
    { value: "plugin", label: "Plugins" },
    { value: "template", label: "Templates" },
    { value: "ui-kit", label: "UI Kits" },
    { value: "design", label: "Designs" }
  ];

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "under25", label: "Under $25" },
    { value: "25to50", label: "$25 - $50" },
    { value: "50to100", label: "$50 - $100" },
    { value: "over100", label: "Over $100" }
  ];

  const hasActiveFilters = category !== "all" || searchQuery || priceRange !== "all";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge className="gradient-bg text-white">Browse Our Collection</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Discover Premium <span className="gradient-text">Digital Products</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore thousands of high-quality themes, plugins, templates, and more from talented creators worldwide.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/30 sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>

            <div className="flex flex-wrap gap-3 items-center">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Latest</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="sales">Best Selling</SelectItem>
                </SelectContent>
              </Select>

              <Select value={order} onValueChange={setOrder}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {category !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.value === category)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setCategory("all")} />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => { setSearchQuery(""); setSearchInput(""); }} />
                </Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {priceRanges.find(p => p.value === priceRange)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceRange("all")} />
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{products.length}</span> products
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.productId || product._id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Package className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <h3 className="text-2xl font-semibold mb-3">No products found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn&apos;t find any products matching your criteria. Try adjusting your filters or search terms.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        )}
      </section>

      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-bg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">DigiVerse</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted marketplace for premium digital products.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products?category=wordpress-theme" className="hover:text-primary transition-colors">WordPress Themes</Link></li>
                <li><Link href="/products?category=plugin" className="hover:text-primary transition-colors">Plugins</Link></li>
                <li><Link href="/products?category=template" className="hover:text-primary transition-colors">Templates</Link></li>
                <li><Link href="/products?category=ui-kit" className="hover:text-primary transition-colors">UI Kits</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products" className="hover:text-primary transition-colors">Browse Products</Link></li>
                <li><Link href="/vendor-signup" className="hover:text-primary transition-colors">Become a Vendor</Link></li>
                <li><Link href="/vendors" className="hover:text-primary transition-colors">Our Vendors</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link href="/signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">My Dashboard</Link></li>
                <li><Link href="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 DigiVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
