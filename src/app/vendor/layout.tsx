"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  DollarSign,
  Wallet,
  BarChart3,
  Settings,
  MessageSquare,
  Star,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const sidebarLinks = [
  { href: "/vendor", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/vendor/products", icon: Package, label: "Products" },
  { href: "/vendor/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/vendor/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/vendor/notifications", icon: Bell, label: "Notifications" },
  { href: "/vendor/withdrawals", icon: Wallet, label: "Withdrawals" },
  { href: "/vendor/sponsorship", icon: Sparkles, label: "Sponsorship" },
  { href: "/vendor/contact", icon: MessageSquare, label: "Contact Admin" },
  { href: "/vendor/settings", icon: Settings, label: "Settings" },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push("/login?redirect=/vendor");
        return;
      }
      if (session.user.role !== "vendor") {
        router.push("/");
        return;
      }
      fetchNotifications();
    }
  }, [session, isPending, router]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/vendor/notifications?unreadOnly=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotificationCount(data.unreadCount || 0);
    } catch (e) {}
  };

  const handleLogout = async () => {
    localStorage.removeItem("bearer_token");
    document.cookie = "bearer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "vendor") return null;

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", mobile ? "p-4" : "p-6")}>
      <div className="mb-8">
        <Link href="/vendor" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">Vendor Panel</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const showNotifBadge = link.label === "Notifications" && notificationCount > 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative",
                isActive
                  ? "gradient-bg text-white"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="font-medium">{link.label}</span>
              {showNotifBadge && (
                <span className="ml-auto flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold h-5 min-w-5 px-1">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-4 mt-4">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
          <Package className="h-5 w-5" />
          <span className="font-medium">Back to Store</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:block w-64 border-r bg-card fixed h-screen">
        <Sidebar />
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <Sidebar mobile />
                </SheetContent>
              </Sheet>
              <h1 className="text-lg font-semibold">
                {sidebarLinks.find((l) => pathname === l.href || pathname.startsWith(l.href + "/"))?.label || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/vendor/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ""} />
                      <AvatarFallback className="gradient-bg text-white">
                        {session.user.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline font-medium">{session.user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/vendor/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}