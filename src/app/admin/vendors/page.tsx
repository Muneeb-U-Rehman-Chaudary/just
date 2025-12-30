"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Store,
  Search,
  Star,
  Package,
  DollarSign,
  TrendingUp,
  Sparkles,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminVendors, useAdminSponsors, useSponsorVendor, useRemoveSponsorVendor } from "@/hooks/useApi";

export default function AdminVendorsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSponsorDialog, setShowSponsorDialog] = useState(false);
  const [showRemoveSponsorDialog, setShowRemoveSponsorDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [sponsorTier, setSponsorTier] = useState<string>("standard");
  const [sponsorDuration, setSponsorDuration] = useState<string>("30");

  const { data: vendorsData, isLoading: vendorsLoading } = useAdminVendors();
  const { data: sponsorsData, isLoading: sponsorsLoading } = useAdminSponsors();
  
  const sponsorMutation = useSponsorVendor();
  const removeSponsorMutation = useRemoveSponsorVendor();

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push("/login");
      } else if (session?.user?.role !== "admin") {
        router.push("/");
      }
    }
  }, [session, isPending, router]);

  const vendors = vendorsData?.vendors || [];
  const activeSponsors = sponsorsData?.sponsors || [];
  const sponsoredVendorIds = new Set(activeSponsors.filter((s: any) => s.type === "vendor").map((s: any) => s.vendor?.id));

  const handleSponsor = async () => {
    if (selectedVendor) {
      sponsorMutation.mutate({
        id: selectedVendor.id,
        tier: sponsorTier,
        duration: parseInt(sponsorDuration),
        type: "vendor"
      }, {
        onSuccess: () => {
          setShowSponsorDialog(false);
          setSelectedVendor(null);
        }
      });
    }
  };

  const handleRemoveSponsor = async () => {
    if (selectedVendor) {
      removeSponsorMutation.mutate(selectedVendor.id, {
        onSuccess: () => {
          setShowRemoveSponsorDialog(false);
          setSelectedVendor(null);
        }
      });
    }
  };

  const filteredVendors = vendors.filter((vendor: any) =>
    vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isPending || vendorsLoading || sponsorsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Vendor Management</h1>
        <p className="text-muted-foreground">View and manage all platform vendors</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Vendors</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{vendors.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sponsored</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{sponsoredVendorIds.size}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Rating</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{(vendors.reduce((sum: number, v: any) => sum + (v.rating || 0), 0) / (vendors.length || 1)).toFixed(1)}</div></CardContent>
        </Card>
        <Card className="gradient-bg text-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">Total Sales</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{vendors.reduce((sum: number, v: any) => sum + (v.totalSales || 0), 0)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor: any) => {
                const isSponsored = sponsoredVendorIds.has(vendor.id);
                return (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium flex items-center gap-2">
                          {vendor.name}
                          {isSponsored && <Badge className="gradient-bg text-white text-[10px] h-4"><Sparkles className="h-2 w-2 mr-1" /> Sponsored</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground">{vendor.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        {vendor.storeName}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{vendor.productCount || 0}</Badge></TableCell>
                    <TableCell>{vendor.totalSales || 0}</TableCell>
                    <TableCell>${(vendor.totalEarnings || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/vendors/${vendor.id}`}>View</Link>
                        </Button>
                        {isSponsored ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setShowRemoveSponsorDialog(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="gradient-bg"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setShowSponsorDialog(true);
                            }}
                          >
                            <Sparkles className="h-4 w-4 mr-1" /> Sponsor
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sponsor Dialog */}
      <Dialog open={showSponsorDialog} onOpenChange={setShowSponsorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sponsor Vendor</DialogTitle>
            <DialogDescription>Activate sponsorship for {selectedVendor?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tier</Label>
              <Select value={sponsorTier} onValueChange={setSponsorTier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard - $49</SelectItem>
                  <SelectItem value="premium">Premium - $99</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input type="number" value={sponsorDuration} onChange={(e) => setSponsorDuration(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSponsorDialog(false)}>Cancel</Button>
            <Button onClick={handleSponsor} disabled={sponsorMutation.isPending} className="gradient-bg">Sponsor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Sponsor Dialog */}
      <Dialog open={showRemoveSponsorDialog} onOpenChange={setShowRemoveSponsorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Sponsorship</DialogTitle>
            <DialogDescription>Are you sure you want to remove sponsorship for {selectedVendor?.name}?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveSponsorDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveSponsor} disabled={removeSponsorMutation.isPending}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
