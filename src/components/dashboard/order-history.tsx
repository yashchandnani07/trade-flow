
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "@/lib/firebase";
import type { Order } from "@/lib/types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertTriangle } from "lucide-react";


const statusVariantMap = {
    delivered: "default",
    shipped: "secondary",
    pending: "outline",
    cancelled: "destructive"
} as const;

export function OrderHistory({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { user } = useAuth();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  const ordersCollection = React.useMemo(() => collection(db, 'orders'), []);
  const ordersQuery = React.useMemo(() => {
    if (!user) return null;
    return query(ordersCollection, where("vendorId", "==", user.uid));
  }, [ordersCollection, user]);

  const [orders, loading, error] = useCollectionData(ordersQuery, { idField: 'id' });

  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
        if (!date?.from || !order.deliveryTimestamp) return true;
        const orderDate = (order.deliveryTimestamp as any).toDate();
        if (date.to) {
            return orderDate >= date.from && orderDate <= date.to;
        }
        return orderDate >= date.from;
    }) as Order[];
  }, [orders, date]);


  return (
    <Card className={cn("glassmorphic", className)}>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
                Review your recent B2B and factory orders.
            </CardDescription>
        </div>
        <div className={cn("grid gap-2 mt-4 md:mt-0")}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full md:w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Supplier ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
            ))}
            {error && (
                <TableRow>
                    <TableCell colSpan={4}>
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error.message}</AlertDescription>
                        </Alert>
                    </TableCell>
                </TableRow>
            )}
            {!loading && filteredOrders.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No orders found for the selected period.
                    </TableCell>
                </TableRow>
            )}
            {!loading && filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                <TableCell className="font-medium">{order.supplierId}</TableCell>
                <TableCell>
                  <Badge variant={statusVariantMap[order.status]} className="capitalize">{order.status}</Badge>
                </TableCell>
                <TableCell>{order.deliveryTimestamp ? format((order.deliveryTimestamp as any).toDate(), "PPP") : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
