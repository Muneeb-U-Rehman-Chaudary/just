"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Store, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "@/hooks/useSession";
import { useLogin } from "@/hooks/useApi";

export default function LoginPage() {
  const router = useRouter();
  const { refetch } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate(
      { email, password, rememberMe },
      {
        onSuccess: async (data) => {
          if (data.token) {
            localStorage.setItem("bearer_token", data.token);
            document.cookie = `bearer_token=${data.token}; path=/; max-age=${rememberMe ? 2592000 : 86400}; SameSite=Lax`;
          }

          toast.success("Welcome back! Redirecting...");
          await refetch();
          await new Promise(resolve => setTimeout(resolve, 200));

          if (data.user?.role === "admin") {
            router.push("/admin");
          } else if (data.user?.role === "vendor") {
            router.push("/vendor");
          } else {
            router.push("/dashboard");
          }
        },
        onError: (error: Error) => {
          toast.error(error.message || "Invalid email or password. Please check your credentials and try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-bg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">DigiVerse</span>
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden sm:block">Don't have an account?</p>
            <Button variant="outline" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Welcome Back to <span className="gradient-text">DigiVerse</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Access your dashboard and manage your digital products marketplace
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-bg shrink-0">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">50,000+ Digital Products</h3>
                    <p className="text-muted-foreground">
                      Browse and purchase from our vast collection of premium digital products
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-bg shrink-0">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Vendor Dashboard</h3>
                    <p className="text-muted-foreground">
                      Manage your store, track sales, and grow your business
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-bg shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Secure Transactions</h3>
                    <p className="text-muted-foreground">
                      Your data and payments are protected with enterprise-grade security
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-bg shrink-0">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Instant Downloads</h3>
                    <p className="text-muted-foreground">
                      Get immediate access to your purchases with automatic license keys
                    </p>
                  </div>
                </div>
              </div>

              <Card className="border-2 gradient-border bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Want to become a vendor?</h4>
                    <p className="text-sm text-muted-foreground">
                      Join thousands of successful vendors and start earning passive income by selling your digital products.
                    </p>
                    <Button className="gradient-bg w-full" asChild>
                      <Link href="/vendor-signup">Create Vendor Account</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="off"
                      className="h-11"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-bg h-11 text-base"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link href="/signup" className="text-primary hover:underline font-medium">
                        Sign up as a customer
                      </Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Want to sell products?{" "}
                      <Link href="/vendor-signup" className="text-primary hover:underline font-medium">
                        Create vendor account
                      </Link>
                    </p>
                  </div>
                </form>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">Demo Credentials:</p>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-muted">
                      <span className="font-medium">Admin:</span> admin@digiverse.com / Admin@123
                    </div>
                    <div className="p-2 rounded bg-muted">
                      <span className="font-medium">Vendor:</span> vendor@digiverse.com / Vendor@123
                    </div>
                    <div className="p-2 rounded bg-muted">
                      <span className="font-medium">Customer:</span> customer@digiverse.com / Customer@123
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
