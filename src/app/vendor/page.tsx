"use client";

import { useSession } from "@/hooks/useSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, DollarSign, ShoppingBag, Plus, Wallet, AlertCircle, Star } from "lucide-react";
import Link from "next/link";
import { useVendorStats, useVendorProducts, useVendorOrders } from "@/hooks/useApi";

export default function VendorDashboard() {
  const { data: session } = useSession();
  
  const { data: statsData, isLoading: statsLoading } = useVendorStats();
  const { data: productsData, isLoading: productsLoading } = useVendorProducts();
  const { data: ordersData, isLoading: ordersLoading } = useVendorOrders();

  const stats = statsData?.stats;
  const products = productsData?.products || [];
  const recentOrders = ordersData?.orders || [];
  const loading = statsLoading || productsLoading || ordersLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const availableBalance = (stats?.totalEarnings || 0) - (stats?.withdrawnAmount || 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Here's an overview of your store performance</p>
        </div>
        <Button className="gradient-bg" asChild>
          <Link href="/vendor/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.approvedProducts || 0} approved, {stats?.pendingProducts || 0} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground">Lifetime orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalEarnings || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${availableBalance.toFixed(2)}</div>
            <Link href="/vendor/withdrawals" className="text-xs text-primary hover:underline">
              Request withdrawal →
            </Link>
          </CardContent>
        </Card>
      </div>

      {stats?.pendingProducts > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div className="flex-1">
              <h3 className="font-semibold">Products Pending Review</h3>
              <p className="text-sm text-muted-foreground">
                You have {stats.pendingProducts} product(s) waiting for admin approval
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/vendor/products?status=pending">View Products</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Products</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vendor/products">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.slice(0, 5).map((product: any) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{product.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.status === "approved" ? "default" : product.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                            {product.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{product.totalSales || 0} sales</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No products yet</p>
                <Button className="mt-4" asChild>
                  <Link href="/vendor/products/new">Add Your First Product</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vendor/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.orderId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.orderId}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.totalAmount?.toFixed(2)}</p>
                      <Badge variant={order.paymentStatus === "completed" ? "default" : "secondary"}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/vendor/products/new" className="block p-6">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" /> Add Product
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">Create and list new digital products</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/vendor/withdrawals" className="block p-6">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" /> Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">Request payouts and view history</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/vendor/sponsorship" className="block p-6">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" /> Sponsorship
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">Promote your products on homepage</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
