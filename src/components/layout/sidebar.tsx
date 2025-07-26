
"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/icons/logo";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function AppSidebar() {
    const { user, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo />
          <span
            className="font-bold text-lg group-data-[collapsible=icon]:hidden duration-300"
            data-testid="brand-name"
          >
            TradeFlow
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive
              tooltip={{ children: "Dashboard" }}
            >
              <Link href={user?.role === 'supplier' ? "/supplier-dashboard" : "/dashboard"}>
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {user?.role === 'supplier' && (
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: "Bids" }}>
                <Link href="/supplier-dashboard#bids">
                  <Gavel />
                  <span>Bids</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {user?.role !== 'supplier' && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: "Bidding" }}>
                  <Link href="/bidding">
                    <Gavel />
                    <span>Bidding</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: "Tracking" }}>
                  <Link href="/dashboard#tracking">
                    <Truck />
                    <span>Tracking</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: "History" }}>
                  <Link href="/dashboard#history">
                    <Package />
                    <span>Order History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: "Suppliers" }}>
                  <Link href="/supplier">
                    <Users />
                    <span>Suppliers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: "Reviews" }}>
                  <Link href="/dashboard#reviews">
                    <Star />
                    <span>Reviews</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Reports" }}>
              <Link href="#">
                <BarChart2 />
                <span>Reports</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Settings" }}>
              <Link href="#">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="border-t border-sidebar-border -mx-2 my-2" />
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <Avatar>
            <AvatarImage src={`https://placehold.co/40x40?text=${user?.email?.[0].toUpperCase()}`} alt="User" />
            <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="font-semibold text-sm truncate">{user?.businessName || user?.email}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 ml-auto group-data-[collapsible=icon]:hidden"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
