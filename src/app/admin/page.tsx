"use client";

import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminStats, useAdminProducts, useApproveProduct, useRejectProduct } from "@/hooks/useApi";

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const { data: statsData, isLoading: statsLoading } = useAdminStats();
  const { data: productsData, isLoading: productsLoading } = useAdminProducts();
  
  const approveProduct = useApproveProduct();
  const rejectProduct = useRejectProduct();

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push("/login?redirect=/admin");
        return;
      }
      
      if (session.user.role !== "admin") {
        router.push("/");
        return;
      }
    }
  }, [session, isPending, router]);

  const stats = statsData?.stats;
  const pendingProducts = productsData?.products?.filter((p: any) => p.status === "pending") || [];

  if (isPending || statsLoading || productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage products, users, and platform settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalVendors || 0} vendors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingProducts || 0} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalRevenue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Platform revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Products */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Product Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProducts.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{product.vendor?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          onClick={() => approveProduct.mutate(product.id)}
                          disabled={approveProduct.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => rejectProduct.mutate({ id: product.id, reason: "Does not meet quality standards" })}
                          disabled={rejectProduct.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No pending products</h3>
              <p className="text-muted-foreground">
                All products have been reviewed
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/products" className="block p-6">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Manage Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">
                View, approve, or reject product submissions
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/users" className="block p-6">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">
                View and manage customer and vendor accounts
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/analytics" className="block p-6">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">
                View detailed platform analytics and reports
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
