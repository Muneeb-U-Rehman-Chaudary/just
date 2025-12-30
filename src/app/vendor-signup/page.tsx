"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Store, DollarSign, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRegister, useVendorProfileUpdate } from "@/hooks/useApi";
import { useSession } from "@/hooks/useSession";

export default function VendorSignupPage() {
  const router = useRouter();
  const { refetch } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    storeDescription: "",
    bio: ""
  });

  const registerMutation = useRegister();
  const updateProfileMutation = useVendorProfileUpdate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: "vendor"
    }, {
      onSuccess: async (data) => {
        if (data.token) {
          localStorage.setItem("bearer_token", data.token);
          document.cookie = `bearer_token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
        }

        // Update vendor profile with store details
        updateProfileMutation.mutate({
          storeName: formData.storeName,
          storeDescription: formData.storeDescription,
          bio: formData.bio
        }, {
          onSuccess: async () => {
            toast.success("Vendor account created successfully!");
            await refetch();
            router.push("/vendor");
          },
          onError: () => {
            toast.error("Account created but failed to set up vendor profile. Please update in settings.");
            router.push("/vendor");
          }
        });
      }
    });
  };

  const loading = registerMutation.isPending || updateProfileMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-bg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">DigiVerse</span>
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Already have an account?</p>
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Side - Benefits */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Start Selling on <span className="gradient-text">DigiVerse</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Join thousands of vendors earning passive income by selling premium digital products
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-bg shrink-0">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Your Own Storefront</h3>
                    <p className="text-muted-foreground">
                      Create a beautiful store to showcase your digital products with your own branding
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-bg shrink-0">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Keep 85% of Sales</h3>
                    <p className="text-muted-foreground">
                      Industry-leading revenue share. We only take 15% commission on your sales
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-bg shrink-0">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Powerful Analytics</h3>
                    <p className="text-muted-foreground">
                      Track your sales, revenue, and customer insights with detailed analytics
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-bg shrink-0">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Fast Withdrawals</h3>
                    <p className="text-muted-foreground">
                      Get paid quickly with multiple payment methods including JazzCash, Easypaisa, and Nayapay
                    </p>
                  </div>
                </div>
              </div>

              <Card className="border-2 gradient-border bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Package className="h-8 w-8 gradient-text shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Ready to Get Started?</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your vendor account in minutes and start selling your digital products today. No setup fees or monthly charges!
                      </p>
                      <div className="flex items-center gap-2 text-sm font-medium gradient-text">
                        <span>Join 8,000+ successful vendors</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Signup Form */}
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Create Vendor Account</CardTitle>
                <CardDescription>
                  Fill in your details to start your selling journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name *</Label>
                    <Input
                      id="storeName"
                      name="storeName"
                      type="text"
                      placeholder="My Digital Store"
                      value={formData.storeName}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeDescription">Store Description *</Label>
                    <Textarea
                      id="storeDescription"
                      name="storeDescription"
                      placeholder="Tell customers about your store and products..."
                      value={formData.storeDescription}
                      onChange={handleChange}
                      required
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">About You (Optional)</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Share your experience and expertise..."
                      value={formData.bio}
                      onChange={handleChange}
                      rows={2}
                    />
                  </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <PasswordInput
                          id="password"
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          autoComplete="off"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <PasswordInput
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          autoComplete="off"
                          className="h-11"
                        />
                      </div>
                    </div>

                  <Button
                    type="submit"
                    className="w-full gradient-bg h-11 text-base"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Vendor Account"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
