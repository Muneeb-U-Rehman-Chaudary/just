import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-[400px] w-full border border-gray-100 rounded-[1.5rem]" />
                <Skeleton className="h-[400px] w-full border border-gray-100 rounded-[1.5rem]" />
              </div>
              <Skeleton className="h-[500px] w-full border border-gray-100 rounded-[1.5rem]" />
            </div>
          </div>
        </div>
      </div>
    }>
      <CheckoutClient />
    </Suspense>
  );
}
