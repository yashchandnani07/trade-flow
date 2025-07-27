
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar as BaseSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart2,
  Home,
  LogOut,
  Package,
  Settings,
  Star,
  Users,
  Truck,
  Gavel,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const vendorNavItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/bidding", icon: Gavel, label: "Bidding" },
    { href: "/dashboard#tracking", icon: Truck, label: "Tracking" },
    { href: "/dashboard#history", icon: Package, label: "Order History" },
    { href: "/supplier", icon: Users, label: "Suppliers" },
    { href: "/supplier/review", icon: MessageSquare, label: "Leave a Review" },
];

const supplierNavItems = [
    { href: "/supplier-dashboard", icon: Home, label: "Dashboard" },
    { href: "/supplier-dashboard#bids", icon: Gavel, label: "Bids" },
];

const commonNavItems = [
    { href: "#", icon: BarChart2, label: "Reports" },
];


export function AppSidebar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { state, toggleSidebar } = useSidebar();

    const navItems = user?.role === 'supplier' ? supplierNavItems : vendorNavItems;

  return (
    <BaseSidebar
      className={cn(
        "border-r-0 dark:bg-card dark:border-r",
        "light:glassmorphic",
        "backdrop-blur-2xl transition-all duration-300"
      )}
      collapsible="icon"
    >
      <SidebarHeader>
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <span
            className="font-bold text-lg group-data-[collapsible=icon]:opacity-0 transition-opacity duration-300"
            data-testid="brand-name"
          >
            TradeFlow
          </span>
          <Button 
              variant="ghost"
              size="icon"
              className="bg-glass/15 border-0 text-white hover:bg-glass/25 transition-all duration-300"
              onClick={toggleSidebar}
          >
              <ChevronLeft className={cn("transition-transform", state === "collapsed" && "rotate-180")} />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, className:"dark:bg-popover dark:text-popover-foreground" }}
                className="light:text-white/80 light:hover:text-white light:data-[active=true]:bg-glass-active light:data-[active=true]:text-white transition-all transform nav-link-shine"
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
            <div className="my-2 border-t border-glass-border group-data-[collapsible=icon]:mx-2" />
           {commonNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, className:"dark:bg-popover dark:text-popover-foreground" }}
                className="light:text-white/80 light:hover:text-white light:data-[active=true]:bg-glass-active light:data-[active=true]:text-white transition-all transform nav-link-shine"
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: "Settings", className:"dark:bg-popover dark:text-popover-foreground" }} className="light:text-white/80 light:hover:text-white nav-link-shine">
                <Link href="#">
                    <Settings />
                    <span>Settings</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        <div className="border-t border-glass-border -mx-2 my-2" />
        <div className={cn("flex items-center gap-3 p-2 rounded-lg transition-all", "light:bg-glass/8 light:border light:border-glass-border", "group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center")}>
          <Avatar>
            <AvatarImage src={`https://placehold.co/40x40?text=${user?.businessName?.[0].toUpperCase()}`} data-ai-hint="person portrait" alt="User" />
            <AvatarFallback>{user?.businessName?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 transition-opacity duration-300">
            <p className="font-semibold text-sm truncate">{user?.businessName || user?.phoneNumber}</p>
            <p className="text-xs text-muted-foreground truncate light:text-white/70">
              {user?.role}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 ml-auto group-data-[collapsible=icon]:hidden light:text-white/70 hover:light:bg-glass-hover hover:light:text-white"
            onClick={() => logout(router)}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </BaseSidebar>
  );
}
