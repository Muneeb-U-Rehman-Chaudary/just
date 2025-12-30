"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CheckCircle,
  Download,
  Copy,
  Key,
  Package,
  Calendar,
  CreditCard,
  FileText,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function OrderDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/orders/" + params.id);
    } else if (session?.user && params.id) {
      fetchOrder();
    }
  }, [session, isPending, params.id, router]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const foundOrder = data.orders?.find((o: any) => o.orderId === parseInt(params.id as string));
      setOrder(foundOrder);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("License key copied to clipboard!");
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order not found</h1>
          <p className="text-muted-foreground mb-6">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>

        {/* Success Banner */}
        {isSuccess && (
          <Alert className="mb-8 border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Order Successful!</strong> Your payment has been processed and your
              digital products are now available for download below.
            </AlertDescription>
          </Alert>
        )}

        {/* Order Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">Order #{order.orderId}</h1>
            <Badge
              variant={
                order.paymentStatus === "completed"
                  ? "default"
                  : order.paymentStatus === "pending"
                  ? "secondary"
                  : "destructive"
              }
              className={order.paymentStatus === "completed" ? "gradient-bg" : ""}
            >
              {order.paymentStatus.toUpperCase()}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(order.orderDate).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {order.paymentMethod.toUpperCase()}
            </div>
            {order.transactionId && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {order.transactionId}
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {items.map((item: any, index: number) => (
              <div key={index}>
                {index > 0 && <Separator className="my-6" />}
                <div className="space-y-4">
                  {/* Product Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-2xl font-bold gradient-text">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    {item.downloadUrl && order.paymentStatus === "completed" && (
                      <Button className="gradient-bg" asChild>
                        <a href={item.downloadUrl} download target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* License Key */}
                  {item.licenseKey && (
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">License Key</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-background px-4 py-3 rounded border font-mono text-sm break-all">
                          {item.licenseKey}
                        </code>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(item.licenseKey)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>Keep this license key safe. You'll need it to activate your product.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
              <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing Fee</span>
              <span className="font-medium text-green-600">$0.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">$0.00</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Total Paid</span>
              <span className="text-2xl font-bold gradient-text">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Download Instructions */}
        {order.paymentStatus === "completed" && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Instructions
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>Click the "Download" button above to get your digital products</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>Save your license keys in a secure location for future use</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>You can access your downloads anytime from your orders page</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>Check the product documentation for installation instructions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>Contact the vendor if you need support or assistance</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Support */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Need help with your order?{" "}
            <Link href="/dashboard" className="text-primary hover:underline">
              Visit Dashboard
            </Link>
            {" or "}
            <a href="mailto:support@digiverse.com" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    }>
      <OrderDetailContent />
    </Suspense>
  );
}
