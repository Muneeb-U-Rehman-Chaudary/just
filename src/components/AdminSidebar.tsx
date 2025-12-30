"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Wallet,
  DollarSign as DollarIcon,
  Store,
  Trophy,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdminSidebarProps {
  notificationCount?: number;
  messageCount?: number;
}

export default function AdminSidebar({ notificationCount = 0, messageCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Vendors",
      href: "/admin/vendors",
      icon: Store,
    },
    {
      title: "Sponsors",
      href: "/admin/sponsors",
      icon: Trophy,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
    },
      {
        title: "Revenue",
        href: "/admin/revenue",
        icon: DollarIcon,
      },
    {
      title: "Withdrawals",
      href: "/admin/withdrawals",
      icon: Wallet,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
    },
    {
      title: "Contact",
      href: "/admin/contact",
      icon: MessageSquare,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];


  return (
    <div
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Admin Panel</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const showBadge = item.title === "Notifications" && notificationCount > 0;
          const showMessageBadge = item.title === "Contact" && messageCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative",
                isActive
                  ? "gradient-bg text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", collapsed && "mx-auto")} />
              {!collapsed && <span>{item.title}</span>}
              {showBadge && (
                <span className={cn(
                  "flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold",
                  collapsed ? "absolute -top-1 -right-1 h-4 w-4 min-w-4" : "ml-auto h-5 min-w-5 px-1"
                )}>
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
              {showMessageBadge && (
                <span className={cn(
                  "flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold",
                  collapsed ? "absolute -top-1 -right-1 h-4 w-4 min-w-4" : "ml-auto h-5 min-w-5 px-1"
                )}>
                  {messageCount > 99 ? "99+" : messageCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className={cn("w-full justify-start", collapsed && "justify-center")}
          asChild
        >
          <Link href="/">
            {!collapsed ? "Back to Store" : "←"}
          </Link>
        </Button>
      </div>
    </div>
  );
}