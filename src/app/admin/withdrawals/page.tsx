"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "@/hooks/useApi";

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [rejectWithdrawal, setRejectWithdrawal] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveWithdrawal, setApproveWithdrawal] = useState<any>(null);
  const [proofImage, setProofImage] = useState("");

  const { data, isLoading } = useAdminWithdrawals({ status: statusFilter });
  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();

    const withdrawals = data?.withdrawals || [];
    const stats = {
      total: data?.stats?.total ?? 0,
      pending: data?.stats?.pending ?? 0,
      approved: data?.stats?.approved ?? 0,
      completed: data?.stats?.completed ?? 0,
      rejected: data?.stats?.rejected ?? 0,
      totalAmount: data?.stats?.totalAmount ?? 0
    };
  
    const handleApprove = () => {
      if (!approveWithdrawal) return;
      approveMutation.mutate({ id: approveWithdrawal.id, proofImage }, {
        onSuccess: () => {
          setApproveWithdrawal(null);
          setProofImage("");
        }
      });
    };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectMutation.mutate({ id: rejectWithdrawal.id, reason: rejectReason }, {
      onSuccess: () => {
        setRejectWithdrawal(null);
        setRejectReason("");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Withdrawal Management</h1>
        <p className="text-muted-foreground">
          Review and process vendor withdrawal requests
        </p>
      </div>

      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Declined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">To vendors</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests ({withdrawals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal: any) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">
                      #{withdrawal.id}
                    </TableCell>
                    <TableCell>{withdrawal.vendorId}</TableCell>
                    <TableCell className="font-semibold">
                      ${(withdrawal.amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-[200px] truncate">
                        {typeof withdrawal.bankDetails === "string"
                          ? withdrawal.bankDetails
                          : JSON.stringify(withdrawal.bankDetails)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          withdrawal.status === "approved" || withdrawal.status === "completed"
                            ? "default"
                            : withdrawal.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(withdrawal.requestDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {withdrawal.status === "pending" && (
                        <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => setApproveWithdrawal(withdrawal)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => setRejectWithdrawal(withdrawal)}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No withdrawal requests
              </h3>
              <p className="text-muted-foreground">
                Vendor withdrawal requests will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectWithdrawal} onOpenChange={() => setRejectWithdrawal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this withdrawal request
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Insufficient earnings balance, incorrect bank details..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectWithdrawal(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!approveWithdrawal} onOpenChange={() => setApproveWithdrawal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
            <DialogDescription>
              Confirm approval of this withdrawal request. You can optionally provide a proof of payment image.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="proofImage">Proof of Payment Image URL</Label>
              <Input
                id="proofImage"
                value={proofImage}
                onChange={(e) => setProofImage(e.target.value)}
                placeholder="https://example.com/receipt.jpg"
              />
              <p className="text-xs text-muted-foreground">
                This image will be sent to the vendor in their notification.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveWithdrawal(null);
                setProofImage("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Approving..." : "Approve Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
