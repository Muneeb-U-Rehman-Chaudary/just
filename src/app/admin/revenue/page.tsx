"use client";

import { useAdminRevenue } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, ShoppingBag, Receipt } from "lucide-react";

export default function AdminRevenuePage() {
  const { data, isLoading } = useAdminRevenue();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const revenue = {
    totalEarnings: data?.revenue?.totalEarnings ?? 0,
    totalCommission: data?.revenue?.totalCommission ?? 0,
    totalSales: data?.revenue?.totalSales ?? 0
  };
  const transactions = data?.transactions || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <DollarSign className="h-8 w-8 gradient-text" />
          Revenue Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track platform earnings and commission collected from vendors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${revenue.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gross sales volume handled
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${revenue.totalCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total net platform earnings
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{revenue.totalSales}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Number of successful transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Recent Platform Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Gross Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net to Vendor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((tx: any) => (
                      <TableRow key={tx._id}>
                        <TableCell className="font-medium">
                          {new Date(tx.transactionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{tx.vendorName}</TableCell>
                        <TableCell className="font-semibold">${(tx.amount ?? 0).toFixed(2)}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          +${(tx.commissionAmount ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium">
                          ${(tx.netAmount ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={tx.status === "completed" ? "default" : "secondary"}
                            className={tx.status === "completed" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No revenue transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
