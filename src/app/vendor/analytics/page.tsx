"use client";

import { useSession } from "@/hooks/useSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingBag, Star } from "lucide-react";
import { useVendorStats, useProducts } from "@/hooks/useApi";

export default function VendorAnalyticsPage() {
  const { data: session } = useSession();
  const { data: statsData, isLoading: statsLoading } = useVendorStats();
  const { data: productsData, isLoading: productsLoading } = useProducts({
    vendorId: "me",
    sortBy: "totalSales",
    limit: 10,
  });

  const loading = statsLoading || productsLoading;
  const stats = statsData?.stats;
  const products = productsData?.products || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const conversionRate = stats?.totalSales && stats?.totalProducts ? ((stats.totalSales / (stats.totalProducts * 100)) * 100).toFixed(1) : "0.0";
  const avgProductPrice = stats?.totalProducts && stats?.totalEarnings ? (stats.totalEarnings / stats.totalSales || 0).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your store performance and sales metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalEarnings || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approvedProducts || 0}</div>
            <p className="text-xs text-muted-foreground">of {stats?.totalProducts || 0} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgProductPrice}</div>
            <p className="text-xs text-muted-foreground">Per sale</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.slice(0, 5).map((product: any, index: number) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{product.title}</p>
                        <p className="text-xs text-muted-foreground">${product.price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{product.totalSales || 0} sales</p>
                      <p className="text-xs text-muted-foreground">${((product.totalSales || 0) * product.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No products yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" /> Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Product Approval Rate</span>
                  <span className="font-medium">
                    {stats?.totalProducts ? Math.round((stats.approvedProducts / stats.totalProducts) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stats?.totalProducts ? (stats.approvedProducts / stats.totalProducts) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average Rating</span>
                  <span className="font-medium">{(session?.user?.rating || 0).toFixed(1)} / 5.0</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${((session?.user?.rating || 0) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Target</span>
                  <span className="font-medium">${stats?.monthlyEarnings?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(((stats?.monthlyEarnings || 0) / 1000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Goal: $1,000/month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg text-center">
              <p className="text-3xl font-bold">{stats?.pendingProducts || 0}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-3xl font-bold">{stats?.totalReviews || 0}</p>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-3xl font-bold">${((stats?.totalEarnings || 0) - (stats?.withdrawnAmount || 0)).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Available Balance</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-3xl font-bold">{conversionRate}%</p>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
