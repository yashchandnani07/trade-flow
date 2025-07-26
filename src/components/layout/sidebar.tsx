
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/icons/logo";
import {
  BarChart2,
  Gavel,
  Home,
  LogOut,
  Package,
  Settings,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { state } = useSidebar();
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
        <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive
              tooltip={{ children: "Dashboard" }}
            >
              <Link href="#">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Orders" }}>
              <Link href="#">
                <Package />
                <span>Orders</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Bidding" }}>
              <Link href="#">
                <Gavel />
                <span>Bidding</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Suppliers" }}>
              <Link href="#">
                <Users />
                <span>Suppliers</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Reviews" }}>
              <Link href="#">
                <Star />
                <span>Reviews</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
            <AvatarImage src="https://placehold.co/40x40" alt="User" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="font-semibold text-sm truncate">Alex Doe</p>
            <p className="text-xs text-muted-foreground truncate">
              alex.doe@example.com
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 ml-auto group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
