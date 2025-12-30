"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Star, TrendingUp, Eye, Clock, CheckCircle2, XCircle, Package, Info, Crown, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVendorSponsorRequests, useProducts, useCreateSponsorRequest } from "@/hooks/useApi";

export default function VendorSponsorshipPage() {
  const { data: sponsorData, isLoading: sponsorLoading } = useVendorSponsorRequests();
  const { data: productsData, isLoading: productsLoading } = useProducts({ vendorId: "me", status: "approved" });
  const createSponsorMutation = useCreateSponsorRequest();

  const [showRequest, setShowRequest] = useState(false);
  const [form, setForm] = useState({ type: "vendor", productId: "", tier: "standard", message: "" });

  const requests = sponsorData?.requests || [];
  const activeSponsors = sponsorData?.activeSponsors || [];
  const products = productsData?.products || [];

  const handleSubmit = async () => {
    if (form.type === "product" && !form.productId) {
      return;
    }

    createSponsorMutation.mutate(form, {
      onSuccess: () => {
        setShowRequest(false);
        setForm({ type: "vendor", productId: "", tier: "standard", message: "" });
      }
    });
  };

  const tierPricing = {
    standard: { vendor: 49, product: 29 },
    premium: { vendor: 99, product: 59 },
  };

  if (sponsorLoading || productsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sponsorship</h1>
          <p className="text-muted-foreground">Promote your store and products on the homepage</p>
        </div>
        <Button onClick={() => setShowRequest(true)} className="gradient-bg">
          <Sparkles className="mr-2 h-4 w-4" /> Request Sponsorship
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" /> Vendor Sponsorship
            </CardTitle>
            <CardDescription>Get your store featured on the homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Featured in "Top Vendors" section</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Priority listing in vendor directory</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Increased visibility and traffic</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Special "Sponsored" badge</div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold">$49</span>
                <span className="text-muted-foreground">/month (Standard)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">$99</span>
                <span className="text-muted-foreground">/month (Premium)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" /> Product Sponsorship
            </CardTitle>
            <CardDescription>Boost individual product visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Featured in "Featured Products"</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Top placement in category</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> "Sponsored" product badge</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Higher search ranking</div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-muted-foreground">/month (Standard)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">$59</span>
                <span className="text-muted-foreground">/month (Premium)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeSponsors.length > 0 && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" /> Active Sponsorships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSponsors.map((s: any) => (
                <div key={s.sponsorId} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                  <div>
                    <p className="font-medium">{s.type === "vendor" ? "Vendor Sponsorship" : s.productTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.tier} tier • Expires {new Date(s.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Sponsorship Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <Card>
            <CardContent className="p-0">
              {requests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Monthly Fee</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((r: any) => (
                      <TableRow key={r.requestId}>
                        <TableCell className="capitalize">{r.type}</TableCell>
                        <TableCell>{r.productTitle || "-"}</TableCell>
                        <TableCell className="capitalize">{r.tier}</TableCell>
                        <TableCell>${r.monthlyFee}/mo</TableCell>
                        <TableCell>{new Date(r.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "approved" ? "default" : r.status === "pending" ? "secondary" : "destructive"}>
                            {r.status === "approved" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {r.status === "rejected" && <XCircle className="mr-1 h-3 w-3" />}
                            {r.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-16">
                  <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No sponsorship requests</h3>
                  <p className="text-muted-foreground mb-4">Request sponsorship to boost your visibility</p>
                  <Button onClick={() => setShowRequest(true)}>Request Sponsorship</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showRequest} onOpenChange={setShowRequest}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Sponsorship</DialogTitle>
            <DialogDescription>Choose your sponsorship type and tier</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sponsorship Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v, productId: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor">Vendor Sponsorship</SelectItem>
                  <SelectItem value="product">Product Sponsorship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.type === "product" && (
              <div className="space-y-2">
                <Label>Select Product</Label>
                <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose a product" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p: any) => (
                      <SelectItem key={p.productId} value={String(p.productId)}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {products.length === 0 && (
                  <p className="text-sm text-yellow-600">You need approved products to sponsor</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Tier</Label>
              <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium (Priority Placement)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Monthly Fee</p>
              <p className="text-2xl font-bold">
                ${tierPricing[form.tier as keyof typeof tierPricing][form.type as keyof typeof tierPricing.standard]}/month
              </p>
            </div>

            <div className="space-y-2">
              <Label>Message (Optional)</Label>
              <Textarea placeholder="Any additional information..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequest(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createSponsorMutation.isPending || (form.type === "product" && !form.productId)} className="gradient-bg">
              {createSponsorMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
