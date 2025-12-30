"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Search, User, Package, ShoppingCart, AlertCircle, CheckCircle, Filter, RefreshCw, CheckCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useAdminNotificationsList, useMarkAdminAllNotificationsRead } from "@/hooks/useApi";

export default function AdminNotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading: loading, refetch } = useAdminNotificationsList({
    type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 100
  });

  const markAllAsReadMutation = useMarkAdminAllNotificationsRead();

  const notifications = data?.notifications || [];
  const stats = data?.stats || {
    totalNotifications: 0,
    unreadCount: 0,
    readCount: 0,
    byType: {}
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-5 w-5" />;
      case "product":
        return <Package className="h-5 w-5" />;
      case "user":
        return <User className="h-5 w-5" />;
      case "sale":
        return <CheckCircle className="h-5 w-5" />;
      case "admin":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-blue-500/10 text-blue-500";
      case "product":
        return "bg-purple-500/10 text-purple-500";
      case "user":
        return "bg-green-500/10 text-green-500";
      case "sale":
        return "bg-emerald-500/10 text-emerald-500";
      case "admin":
        return "bg-orange-500/10 text-orange-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const filteredNotifications = notifications.filter((notification: any) => {
    const matchesSearch = 
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">All Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Monitor all platform notifications from users, vendors, and products
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleMarkAllAsRead} 
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotifications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.readCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.byType).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications, users, or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="order">Orders</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="sale">Sales</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Bell className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No notifications available yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900" : "hover:bg-muted/50"
                  }`}
                >
                  <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{notification.userName}</span>
                        {notification.userEmail && (
                          <span className="text-sm text-muted-foreground">
                            ({notification.userEmail})
                          </span>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="default" className="bg-blue-500">
                            New
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm mb-2">{notification.message}</p>

                    {notification.link && (
                      <Link href={notification.link}>
                        <Button variant="ghost" size="sm" className="h-8">
                          View Details →
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
