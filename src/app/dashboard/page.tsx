"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Package,
  ShoppingBag,
  Download,
  DollarSign,
  Key,
  FileDown,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Copy,
  ExternalLink,
  Eye,
  Calendar,
  CreditCard,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useOrders } from "@/hooks/useApi";

interface OrderItem {
  productId: number;
  price: number;
  licenseKey: string;
  title: string;
  downloadUrl: string;
}

interface Order {
  id: number;
  orderId: number;
  customerId: string;
  items: OrderItem[] | string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  orderDate: string;
  downloadStatus: string;
}

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: ordersData, isLoading: loading } = useOrders();
  const orders: Order[] = ordersData?.orders || [];

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const parseItems = (items: OrderItem[] | string): OrderItem[] => {
    if (typeof items === "string") {
      try {
        return JSON.parse(items);
      } catch {
        return [];
      }
    }
    return items || [];
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getAllProducts = () => {
    const products: (OrderItem & { orderId: number; orderDate: string; paymentStatus: string })[] = [];
    orders.forEach((order) => {
      const items = parseItems(order.items);
      items.forEach((item) => {
        products.push({
          ...item,
          orderId: order.orderId || order.id,
          orderDate: order.orderDate,
          paymentStatus: order.paymentStatus,
        });
      });
    });
    return products;
  };

  const filteredProducts = getAllProducts().filter((product) =>
    product.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedOrders = orders.filter((o) => o.paymentStatus === "completed");
  const totalProducts = getAllProducts().length;
  const downloadableProducts = getAllProducts().filter((p) => p.downloadUrl && completedOrders.some(o => (o.orderId || o.id) === p.orderId));
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{session.user.name}</span>!
          </h1>
          <p className="text-muted-foreground">
            Manage your purchased products, licenses, and downloads from your personal dashboard.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">All time purchases</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Products Owned</CardTitle>
              <Package className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">Digital products</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Downloads Available</CardTitle>
              <Download className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{downloadableProducts.length}</div>
              <p className="text-xs text-muted-foreground">Ready to download</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Lifetime spending</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">My Products</span>
            </TabsTrigger>
            <TabsTrigger value="licenses" className="gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">Licenses</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="gap-2">
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">Downloads</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription>Your latest purchase history</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => {
                        const items = parseItems(order.items);
                        return (
                          <div
                            key={order.orderId || order.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">Order #{order.orderId || order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {items.length} item(s) • {new Date(order.orderDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={
                                  order.paymentStatus === "completed"
                                    ? "default"
                                    : order.paymentStatus === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className={order.paymentStatus === "completed" ? "bg-green-500" : ""}
                              >
                                {order.paymentStatus === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {order.paymentStatus === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                {order.paymentStatus === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                                {order.paymentStatus}
                              </Badge>
                              <span className="font-semibold">${order.totalAmount?.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  )}
                  {orders.length > 5 && (
                    <Button variant="link" className="w-full mt-4" onClick={() => setActiveTab("products")}>
                      View all orders
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start gap-3" variant="outline" asChild>
                    <Link href="/products">
                      <Package className="h-4 w-4" />
                      Browse Products
                    </Link>
                  </Button>
                  <Button className="w-full justify-start gap-3" variant="outline" onClick={() => setActiveTab("downloads")}>
                    <Download className="h-4 w-4" />
                    View Downloads
                  </Button>
                  <Button className="w-full justify-start gap-3" variant="outline" onClick={() => setActiveTab("licenses")}>
                    <Key className="h-4 w-4" />
                    Manage Licenses
                  </Button>
                  <Button className="w-full justify-start gap-3" variant="outline" asChild>
                    <Link href="/orders">
                      <CreditCard className="h-4 w-4" />
                      Order History
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {filteredProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Recently Purchased Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.slice(0, 6).map((product, idx) => (
                      <div
                        key={`${product.productId}-${idx}`}
                        className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold line-clamp-1">{product.title}</h4>
                          <Badge variant="outline" className="shrink-0">
                            ${product.price?.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(product.orderDate).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          {product.downloadUrl && product.paymentStatus === "completed" && (
                            <Button size="sm" className="flex-1 gradient-bg" asChild>
                              <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/products/${product.productId}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      My Products ({filteredProducts.length})
                    </CardTitle>
                    <CardDescription>All products you have purchased</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProducts.length > 0 ? (
                  <div className="space-y-4">
                    {filteredProducts.map((product, idx) => (
                      <div
                        key={`${product.productId}-${idx}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{product.title}</h4>
                            <Badge variant={product.paymentStatus === "completed" ? "default" : "secondary"} className={product.paymentStatus === "completed" ? "bg-green-500" : ""}>
                              {product.paymentStatus}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(product.orderDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              ${product.price?.toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3" />
                              Order #{product.orderId}
                            </span>
                          </div>
                          {product.licenseKey && (
                            <div className="flex items-center gap-2 mt-2">
                              <Key className="h-3 w-3 text-muted-foreground" />
                              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                {product.licenseKey.substring(0, 20)}...
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2"
                                onClick={() => copyToClipboard(product.licenseKey)}
                              >
                                {copiedKey === product.licenseKey ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {product.downloadUrl && product.paymentStatus === "completed" && (
                            <Button size="sm" className="gradient-bg" asChild>
                              <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/products/${product.productId}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {searchQuery ? "No products found" : "No products yet"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try a different search term"
                        : "Start shopping to see your products here"}
                    </p>
                    {!searchQuery && (
                      <Button className="gradient-bg" asChild>
                        <Link href="/products">Browse Products</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="licenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  License Keys
                </CardTitle>
                <CardDescription>
                  Manage and copy your product license keys
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredProducts.filter((p) => p.licenseKey).length > 0 ? (
                  <div className="space-y-4">
                    {filteredProducts
                      .filter((p) => p.licenseKey)
                      .map((product, idx) => (
                        <div
                          key={`license-${product.productId}-${idx}`}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{product.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Order #{product.orderId} • {new Date(product.orderDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              variant={product.paymentStatus === "completed" ? "default" : "secondary"}
                              className={product.paymentStatus === "completed" ? "bg-green-500" : ""}
                            >
                              {product.paymentStatus === "completed" ? "Active" : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                            <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                            <code className="flex-1 font-mono text-sm break-all">
                              {product.licenseKey}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(product.licenseKey)}
                              className="shrink-0"
                            >
                              {copiedKey === product.licenseKey ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Key className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No licenses yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Purchase products to receive license keys
                    </p>
                    <Button className="gradient-bg" asChild>
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  Available Downloads
                </CardTitle>
                <CardDescription>
                  Download your purchased products
                </CardDescription>
              </CardHeader>
              <CardContent>
                {downloadableProducts.length > 0 ? (
                  <div className="space-y-4">
                    {downloadableProducts.map((product, idx) => (
                      <div
                        key={`download-${product.productId}-${idx}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1 flex-1">
                          <h4 className="font-semibold">{product.title}</h4>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Purchased: {new Date(product.orderDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3" />
                              Order #{product.orderId}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button className="gradient-bg" asChild>
                            <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href={`/products/${product.productId}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileDown className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No downloads available</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete a purchase to access your downloads
                    </p>
                    <Button className="gradient-bg" asChild>
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
