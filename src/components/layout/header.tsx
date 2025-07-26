
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Search,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "../theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { href, name, isLast };
  });

  return (
    <header className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-4 px-4 sm:h-auto sm:px-6",
        "dark:border-b dark:bg-transparent dark:backdrop-blur-lg"
    )}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground light:text-white/80">
        <Link href="/dashboard" className="hover:text-foreground light:hover:text-white">
          Home
        </Link>
        {breadcrumbs.map(breadcrumb => (
          <React.Fragment key={breadcrumb.href}>
             <ChevronRight className="h-4 w-4" />
             <Link href={breadcrumb.href} className={cn(
                 breadcrumb.isLast ? 'font-semibold text-foreground light:text-white' : 'hover:text-foreground light:hover:text-white'
             )}>
              {breadcrumb.name}
            </Link>
          </React.Fragment>
        ))}
      </div>
      <div className="relative ml-auto flex items-center gap-4 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground light:text-white/80" />
        <Input
          type="search"
          placeholder="Search..."
          className={cn(
              "w-full rounded-lg pl-8 md:w-[200px] lg:w-[320px]",
              "dark:bg-secondary",
              "light:bg-glass/15 light:border-glass-border light:text-white light:placeholder:text-white/70"
          )}
        />
      </div>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full dark:border-border light:border-glass-border"
          >
            <Avatar>
              <AvatarImage src={`https://placehold.co/40x40?text=${user?.businessName?.[0].toUpperCase()}`} data-ai-hint="person portrait" alt="User Avatar" />
              <AvatarFallback>{user?.businessName?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="dark:bg-popover light:glassmorphic light:text-white">
          <DropdownMenuLabel className="light:text-white/90">{user?.businessName || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator className="light:bg-white/10" />
          <DropdownMenuItem className="light:focus:bg-glass-hover">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="light:focus:bg-glass-hover">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="light:bg-white/10" />
          <DropdownMenuItem onClick={logout} className="light:focus:bg-glass-hover">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
