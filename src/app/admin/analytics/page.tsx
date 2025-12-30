"use client";

import { useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  Activity,
  Star,
  BarChart3,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAdminAnalytics } from "@/hooks/useApi";

export default function AdminAnalyticsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30d");
  const { data: analyticsData, isLoading: analyticsLoading } = useAdminAnalytics();

  const loading = sessionLoading || analyticsLoading;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  const { overview, growth, topProducts, topVendors, categoryData, dailyRevenue } = analyticsData || {};

  const totalProductsSold = topProducts?.reduce((sum: number, p: any) => sum + (p.totalSales || 0), 0) || 0;
  const topCategory = categoryData?.sort((a: any, b: any) => b.count - a.count)?.[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground"> Comprehensive platform insights and metrics </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">${(overview?.totalRevenue ?? 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalUsers || 0}</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{(growth?.userGrowth ?? 0).toFixed(1)}% this month
              </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalProducts || 0}</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{(growth?.productGrowth ?? 0).toFixed(1)}% this month
              </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalOrders || 0}</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{(growth?.orderGrowth ?? 0).toFixed(1)}% this month
              </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Products Sold Analytics </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
              <TabsTrigger value="details">Detailed List</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Products Sold</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold gradient-text">{totalProductsSold.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Best Selling Product</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold truncate">{topProducts?.[0]?.title || "N/A"}</div>
                    <p className="text-xs text-muted-foreground mt-1"> {topProducts?.[0]?.totalSales || 0} units sold </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold capitalize">{topCategory?.category || "N/A"}</div>
                    <p className="text-xs text-muted-foreground mt-1"> {topCategory?.count || 0} products </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sales Trend (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dailyRevenue?.slice(-7).map((day: any, index: number) => {
                      const maxOrders = Math.max(...dailyRevenue.slice(-7).map((d: any) => d.orders));
                      const percentage = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 0;
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground"> {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} </span>
                            <span className="font-medium">{day.orders} sales</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full gradient-bg transition-all" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              <div className="grid gap-4">
                {categoryData?.map((category: any, index: number) => {
                  const totalProducts = categoryData.reduce((sum: number, c: any) => sum + c.count, 0);
                  const percentage = totalProducts > 0 ? (category.count / totalProducts) * 100 : 0;
                  return (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold capitalize">{category.category}</h3>
                            <p className="text-sm text-muted-foreground"> {category.count} products ({percentage.toFixed(1)}%) </p>
                          </div>
                          <Badge variant="secondary" className="text-lg font-bold"> {category.count} </Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full gradient-bg" style={{ width: `${percentage}%` }} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="details">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Units Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts?.map((product: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-muted-foreground">#{index + 1}</span>
                          {index === 0 && <Badge className="gradient-bg">Top</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize"> {product.category} </Badge>
                      </TableCell>
                        <TableCell className="text-right">${(product.price ?? 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold">{product.totalSales || 0}</span>
                      </TableCell>
                      <TableCell className="text-right font-bold"> ${((product.price || 0) * (product.totalSales || 0)).toFixed(2)} </TableCell>
                      <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{(product.rating ?? 0).toFixed(1)}</span>
                          </div>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium"> Platform Rating </CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topVendors?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Selling products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">
                ${overview?.totalOrders > 0 ? ((overview?.totalRevenue ?? 0) / overview.totalOrders).toFixed(2) : "0.00"}
              </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts?.slice(0, 5).map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted" >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background font-bold"> {index + 1} </div>
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground"> {product.totalSales || 0} sales </p>
                    </div>
                  </div>
                    <div className="text-right">
                      <p className="font-semibold">${(product.price ?? 0).toFixed(2)}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <p className="text-sm text-muted-foreground">{(product.rating ?? 0).toFixed(1)}</p>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVendors?.slice(0, 5).map((vendor: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted" >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background font-bold"> {index + 1} </div>
                    <div>
                      <p className="font-medium">{vendor.storeName || vendor.name}</p>
                      <p className="text-sm text-muted-foreground"> {vendor.totalSales || 0} sales </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(vendor.totalEarnings || 0).toFixed(2)}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <p className="text-sm text-muted-foreground">{(vendor.rating || 0).toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { description: "New user registered", time: "2 minutes ago" },
              { description: "Product approved: Premium WordPress Theme", time: "15 minutes ago" },
              { description: "Order completed: $299.00", time: "1 hour ago" },
              { description: "Withdrawal processed: $1,250.00", time: "3 hours ago" },
              { description: "New vendor application", time: "5 hours ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border" >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <p className="font-medium">{activity.description}</p>
                </div>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
