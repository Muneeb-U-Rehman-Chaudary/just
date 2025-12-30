"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SafeImage from "./SafeImage";
import { Star, ShoppingCart, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  id?: number;
  productId?: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  totalReviews: number;
  totalSales: number;
  images: string[];
  category: string;
  featured?: boolean;
  sponsored?: boolean;
  vendor?: {
    name: string;
    storeName?: string;
  };
}

export default function ProductCard({
  product,
}: {
  product: ProductCardProps;
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const productId = product.productId || product.id;

  const categoryColors: Record<string, string> = {
    "wordpress-theme": "bg-blue-500/10 text-blue-600",
    plugin: "bg-purple-500/10 text-purple-600",
    template: "bg-green-500/10 text-green-600",
    "ui-kit": "bg-orange-500/10 text-orange-600",
    design: "bg-pink-500/10 text-pink-600",
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;
    setAdding(true);
    try {
      await addToCart.mutateAsync(productId);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 border border-border/40 rounded-3xl bg-white hover:border-primary/40">
        <Link href={`/products/${productId}`} className="block relative">
          <div className="relative aspect-3/3 overflow-hidden bg-[#F8F9FB] m-4 rounded-2xl border border-gray-100">
            <SafeImage
            src={product.images}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />

          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300" />

          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.featured && (
              <Badge className="bg-primary border-none text-[7px] font-semibold uppercase tracking-widest py-0.5 px-2 rounded-full shadow-none">
                Elite Asset
              </Badge>
            )}
            {product.sponsored && (
              <Badge className="bg-yellow-400 text-black border-none text-[7px] font-semibold uppercase tracking-widest py-0.5 px-2 rounded-full shadow-none">
                Promoted
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className={`${categoryColors[product.category] || "bg-gray-100 text-gray-600"} border-none text-[8px] font-semibold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md`}
          >
            {product.category?.replace("-", " ")}
          </Badge>
          <div className="flex items-center gap-1.5 text-[9px] font-semibold text-gray-400 uppercase tracking-widest">
            <Download className="h-3 w-3" />
            <span>{product.totalSales || 0}</span>
          </div>
        </div>

        <div className="space-y-1">
          <Link href={`/products/${productId}`}>
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors tracking-tight text-gray-900">
              {product.title}
            </h3>
          </Link>
          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed font-medium h-7">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          {product.vendor && (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                {product.vendor.storeName?.charAt(0) || product.vendor.name.charAt(0)}
              </div>
              <span className="text-[8px] font-semibold text-gray-500 uppercase tracking-widest truncate max-w-[70px]">
                {product.vendor.storeName || product.vendor.name}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded-full">
            <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" />
            <span className="text-[8px] font-semibold text-yellow-700">
              {(product.rating || 0).toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between mt-0.5">
        <div className="flex flex-col">
          <span className="text-[8px] font-semibold text-gray-300 uppercase tracking-widest mb-0.5">Investment</span>
          <span className="text-lg font-bold text-gray-900 tracking-tighter">
            ${product.price?.toFixed(2)}
          </span>
          </div>
            <Button
              className={`rounded-md h-9 px-14 font-semibold shadow-none transition-all duration-300 flex items-center gap-1.5 ${
                adding ? 'bg-gray-200 text-gray-500' : 'bg-primary text-white active:scale-95'
              }`}
            onClick={handleAddToCart}
            disabled={adding}
          >
            {adding ? (
              <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <>
              <div className="w-4 flex items-center justify-center gap-3">
                <ShoppingCart className="h-3.5 w-3.5" />
                Get
                </div>
              </>
            )}
          </Button>
      </CardFooter>
    </Card>
  );
}
