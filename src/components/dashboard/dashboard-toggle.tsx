"use client";

import { usePathname, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Users, LayoutDashboard } from "lucide-react";

export function DashboardToggle() {
  const router = useRouter();
  const pathname = usePathname();

  const isSupplierView = pathname.startsWith("/supplier");

  const handleToggle = (checked: boolean) => {
    if (checked) {
      router.push("/supplier");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-glass p-2 rounded-lg">
      <Label htmlFor="dashboard-toggle" className="flex items-center gap-1 cursor-pointer">
        <LayoutDashboard className="h-4 w-4" />
        <span className="text-xs font-medium">Vendor</span>
      </Label>
      <Switch
        id="dashboard-toggle"
        checked={isSupplierView}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary"
      />
      <Label htmlFor="dashboard-toggle" className="flex items-center gap-1 cursor-pointer">
        <Users className="h-4 w-4" />
        <span className="text-xs font-medium">Supplier</span>
      </Label>
    </div>
  );
}
