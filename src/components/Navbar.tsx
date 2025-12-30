"use client";

import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Search,
  Bell,
  Package,
  Shield,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "@/hooks/use-redux";
import { toggleCart } from "@/lib/features/cart/cartSlice";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from "@/hooks/useCart";
import { useNotifications } from "@/hooks/useNotifications";
import { useLogout, useProducts } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function Navbar() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { itemCount: cartItemCount } = useCart();
  const { unreadCount } = useNotifications();
  const logoutMutation = useLogout();

  const { data: searchResults, isLoading: isSearching } = useProducts({
    search: debouncedQuery || undefined,
    limit: 5,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 group"
          >
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl gradient-bg border border-white/20 group-hover:scale-105 transition-transform duration-300">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-semibold tracking-tighter gradient-text hidden sm:block">
              DigiVerse
            </span>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-sm xl:max-w-lg mx-2 xl:mx-4 relative"
            ref={searchRef}
          >
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search premium digital assets..."
                className="w-full pl-12 h-12 bg-muted/50 border border-gray-100 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/10 transition-all shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />

              {isSearchFocused && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-gray-100 rounded-xl shadow-none overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 max-h-[400px] overflow-y-auto scrollbar-none">
                    {isSearching ? (
                      <div className="space-y-2 p-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="flex-1 space-y-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchResults?.products?.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.products.map((product: any) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors group"
                            onClick={() => setIsSearchFocused(false)}
                          >
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-gray-100">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors text-gray-900">
                                {product.title}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground capitalize">
                                  {product.category?.replace("-", " ")}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  •
                                </span>
                                <p className="text-xs font-semibold text-primary">
                                  ${product.price}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                        <div className="pt-2 mt-2 border-t px-2 pb-1">
                          <Button
                            variant="ghost"
                            className="w-full text-xs h-8 justify-center hover:bg-primary/5 hover:text-primary font-semibold"
                            asChild
                          >
                            <Link
                              href={`/products?search=${encodeURIComponent(searchQuery)}`}
                            >
                              View all results
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          No products found for "{searchQuery}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative h-11 w-11 rounded-lg hover:bg-primary/5 hover:text-primary transition-all"
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-semibold gradient-bg border-2 border-background shadow-none animate-in zoom-in duration-300">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {session?.user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="relative h-11 w-11 rounded-lg hover:bg-primary/5 hover:text-primary transition-all"
                >
                  <Link href="/notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-semibold bg-destructive text-destructive-foreground border-2 border-background shadow-none animate-in zoom-in duration-300">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-12 w-20 rounded-xl p-1 px-4 border-2 border-transparent hover:border-primary/20 transition-all"
                    >
                      <Avatar className="h-9 w-9 rounded-lg">
                        <AvatarImage
                          src={session.user.image || ""}
                          alt={session.user.name}
                        />
                        <AvatarFallback className="gradient-bg text-white font-semibold">
                          {session.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                     <div> <ChevronDown className="" /></div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 p-2 rounded-xl shadow-none border border-gray-200"
                  >
                    <div className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-muted/50">
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage
                          src={session.user.image || ""}
                          alt={session.user.name}
                        />
                        <AvatarFallback className="gradient-bg text-white text-xs">
                          {session.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-semibold truncate text-gray-900">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    <DropdownMenuSeparator className="my-2" />

                    {session.user.role === "admin" && (
                      <DropdownMenuItem
                        asChild
                        className="rounded-md p-2.5 focus:bg-primary/5 focus:text-primary"
                      >
                        <Link
                          href="/admin"
                          className="flex items-center w-full font-semibold"
                        >
                          <Shield className="h-4 w-4 mr-3 text-gray-400" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {session.user.role === "vendor" && (
                      <DropdownMenuItem
                        asChild
                        className="rounded-md p-2.5 focus:bg-primary/5 focus:text-primary"
                      >
                        <Link
                          href="/vendor"
                          className="flex items-center w-full font-semibold"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-3 text-gray-400" />
                          Vendor Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      asChild
                      className="rounded-md p-2.5 focus:bg-primary/5 focus:text-primary"
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center w-full font-semibold"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-3 text-gray-400" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      asChild
                      className="rounded-md p-2.5 focus:bg-primary/5 focus:text-primary"
                    >
                      <Link
                        href="/orders"
                        className="flex items-center w-full font-semibold"
                      >
                        <ShoppingBag className="h-4 w-4 mr-3 text-gray-400" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      asChild
                      className="rounded-md p-2.5 focus:bg-primary/5 focus:text-primary"
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center w-full font-semibold"
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-2" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-md p-2.5 text-destructive focus:bg-destructive/5 focus:text-destructive font-semibold"
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {logoutMutation.isPending ? "Logging out..." : "Log out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className="font-semibold rounded-[8px] hidden sm:flex px-4 hover:bg-primary/5"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-[10px] px-5 sm:px-7 h-10 sm:h-11 shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-primary/20"
                  asChild
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
