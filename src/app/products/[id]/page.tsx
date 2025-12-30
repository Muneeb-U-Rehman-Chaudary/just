"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import {
  Star,
  ShoppingCart,
  Download,
  Package,
  Check,
  ExternalLink,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Shield,
  RefreshCw,
  FileCode,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProduct, useCreateReview } from "@/hooks/useApi";
import { useCart } from "@/hooks/useCart";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;

  const { data: productData, isLoading: loading } = useProduct(id);
  const { addToCart } = useCart();
  const createReview = useCreateReview();

  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const product = productData?.product;

  const handleAddToCart = async () => {
    if (!session?.user) {
      toast.error("Please sign in to add items to cart");
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    addToCart.mutate(product.productId);
  };

  const handleBuyNow = () => {
    if (!session?.user) {
      toast.error("Please sign in to purchase");
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    router.push(`/checkout?products=${product.productId}`);
  };

  const handleSubmitReview = async () => {
    if (!session?.user) {
      toast.error("Please sign in to write a review");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please write a review");
      return;
    }

    createReview.mutate({
      productId: product.productId,
      rating: reviewRating,
      comment: reviewComment,
    }, {
      onSuccess: () => {
        setReviewComment("");
        setReviewRating(5);
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product not found</h1>
          <p className="text-muted-foreground mb-4">
            The product you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
  const tags = product.tags ? (typeof product.tags === "string" ? JSON.parse(product.tags) : product.tags) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-foreground">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                <SafeImage
                  src={images[selectedImage]}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsZoomed(true)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              {images.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative aspect-square rounded overflow-hidden border-2 transition-all hover:border-primary/50 ${
                        selectedImage === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                      }`}
                    >
                      <SafeImage src={img} alt={`${product.title} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="capitalize">{product.category.replace("-", " ")}</Badge>
                  {product.featured && <Badge className="gradient-bg">Featured</Badge>}
                </div>
                <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                      />
                    ))}
                    <span className="ml-1 font-medium">{product.rating?.toFixed(1)}</span>
                    <span className="ml-1 text-sm text-muted-foreground">({product.totalReviews} reviews)</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Download className="h-4 w-4 mr-1" />
                    {product.totalSales} sales
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={product.vendor?.image} />
                      <AvatarFallback className="gradient-bg text-white">
                        {product.vendor?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{product.vendor?.storeName || product.vendor?.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        {product.vendor?.rating?.toFixed(1)} • {product.vendor?.totalSales} sales
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/vendors/${product.vendorId}`}>View Store</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold gradient-text">${product.price?.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">One-time payment</span>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 gradient-bg" size="lg" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex-1" 
                    onClick={handleAddToCart}
                    disabled={addToCart.isPending}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {addToCart.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                </div>

                {product.demoUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={product.demoUrl} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Live Preview
                    </Link>
                  </Button>
                )}
              </div>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-primary" />
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />Lifetime updates</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />{product.licenseType || "Commercial license"}</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />6 months support</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />Instant download</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="description" className="mb-12">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.totalReviews})</TabsTrigger>
              <TabsTrigger value="changelog">Changelog</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="pt-6 prose prose-sm max-w-none">
                  <p className="leading-relaxed">{product.description}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6 space-y-6">
              {session?.user && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold">Write a Review</h3>
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                            <Star className={`h-6 w-6 ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review">Your Review</Label>
                      <Textarea id="review" placeholder="Share your thoughts..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={4} />
                    </div>
                    <Button onClick={handleSubmitReview} disabled={createReview.isPending} className="gradient-bg">
                      {createReview.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {product.reviews?.map((review: any) => (
                  <Card key={review.reviewId}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.customer?.image} />
                          <AvatarFallback className="gradient-bg text-white">{review.customer?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{review.customer?.name}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="changelog" className="mt-6">
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  {product.changelog ? (
                    <pre className="whitespace-pre-wrap font-sans text-left">{product.changelog}</pre>
                  ) : (
                    <>
                      <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No changelog available</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
          <DialogContent className="max-w-4xl">
            <div className="relative aspect-square w-full">
              <SafeImage src={images[selectedImage]} alt={product.title} fill className="object-contain" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}
