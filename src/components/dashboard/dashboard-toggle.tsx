'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users, LayoutDashboard, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isSupplierView = pathname.startsWith('/supplier');

  const handleToggle = (checked: boolean) => {
    startTransition(() => {
      if (checked) {
        router.push('/supplier');
      } else {
        router.push('/');
      }
    });
  };

  return (
    <div className="flex items-center space-x-2 bg-glass p-2 rounded-lg">
      <Label
        htmlFor="dashboard-toggle"
        className="flex items-center gap-1 cursor-pointer"
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="text-xs font-medium">Vendor</span>
      </Label>
      <div className="relative flex items-center">
        <Switch
          id="dashboard-toggle"
          checked={isSupplierView}
          onCheckedChange={handleToggle}
          disabled={isPending}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary"
        />
        {isPending && (
          <Loader2 className="absolute h-4 w-4 animate-spin left-1/2 -translate-x-1/2 text-primary-foreground" />
        )}
      </div>
      <Label
        htmlFor="dashboard-toggle"
        className="flex items-center gap-1 cursor-pointer"
      >
        <Users className="h-4 w-4" />
        <span className="text-xs font-medium">Supplier</span>
      </Label>
    </div>
  );
}
