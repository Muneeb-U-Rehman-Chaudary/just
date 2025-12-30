"use client";

import { useState } from "react";
import { useSession } from "@/hooks/useSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, DollarSign, Clock, CheckCircle2, XCircle, History, Plus, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useVendorStats, useVendorWithdrawals, useWithdrawVendor } from "@/hooks/useApi";

export default function VendorWithdrawalsPage() {
  const { data: session } = useSession();
  const { data: statsData, isLoading: statsLoading } = useVendorStats();
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useVendorWithdrawals();
  const withdrawMutation = useWithdrawVendor();

  const [showRequest, setShowRequest] = useState(false);
  const [form, setForm] = useState({ amount: "", bankDetails: "", notes: "" });

  const loading = statsLoading || withdrawalsLoading;
  const stats = statsData?.stats;
  const withdrawals = withdrawalsData?.withdrawals || [];

  const handleSubmit = () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount < 10) {
      toast.error("Minimum withdrawal amount is $10");
      return;
    }
    if (!form.bankDetails.trim()) {
      toast.error("Please enter your bank/payment details");
      return;
    }
    const available = (stats?.totalEarnings || 0) - (stats?.withdrawnAmount || 0);
    if (amount > available) {
      toast.error("Insufficient balance");
      return;
    }

    withdrawMutation.mutate({ 
      amount, 
      method: "Bank Transfer", // Default or from form if added
      accountDetails: form.bankDetails 
    }, {
      onSuccess: () => {
        setShowRequest(false);
        setForm({ amount: "", bankDetails: "", notes: "" });
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const available = (stats?.totalEarnings || 0) - (stats?.withdrawnAmount || 0);
  const pending = withdrawals.filter((w: any) => w.status === "pending").reduce((s: number, w: any) => s + w.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Withdrawals</h1>
          <p className="text-muted-foreground">Request payouts and view withdrawal history</p>
        </div>
        <Button onClick={() => setShowRequest(true)} className="gradient-bg" disabled={available < 10}>
          <Plus className="mr-2 h-4 w-4" /> Request Withdrawal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${available.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${pending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.withdrawnAmount || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime payouts</p>
          </CardContent>
        </Card>
      </div>

      {available < 10 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div>
              <h3 className="font-semibold">Minimum Balance Required</h3>
              <p className="text-sm text-muted-foreground">You need at least $10 to request a withdrawal</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4" /> Withdrawal History</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {withdrawals.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Bank Details</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Processed Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w: any) => (
                      <TableRow key={w.withdrawalId}>
                        <TableCell>#{w.withdrawalId}</TableCell>
                        <TableCell className="font-semibold">${w.amount.toFixed(2)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{w.bankDetails}</TableCell>
                        <TableCell>{new Date(w.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>{w.processedDate ? new Date(w.processedDate).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          <Badge variant={w.status === "completed" ? "default" : w.status === "pending" ? "secondary" : "destructive"}>
                            {w.status === "completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {w.status === "rejected" && <XCircle className="mr-1 h-3 w-3" />}
                            {w.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                            {w.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-16">
                  <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No withdrawals yet</h3>
                  <p className="text-muted-foreground">Request your first withdrawal when you have earnings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showRequest} onOpenChange={setShowRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>Enter the amount you want to withdraw and your payment details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">${available.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input id="amount" type="number" min="10" max={available} placeholder="Enter amount (min $10)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankDetails">Payment Details *</Label>
              <Textarea id="bankDetails" placeholder="Enter your PayPal email, bank account details, or other payment method..." rows={3} value={form.bankDetails} onChange={(e) => setForm({ ...form, bankDetails: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" placeholder="Any additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequest(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={withdrawMutation.isPending} className="gradient-bg">
              {withdrawMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
