
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { generateAlerts } from "@/app/actions";
import { Bell, Loader2, PartyPopper } from "lucide-react";
import type { Alert } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const priorityVariantMap = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

export function AlertsSection() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      generateAlerts(user.uid)
        .then((newAlertsData) => {
          const newAlerts: Alert[] = newAlertsData.map((alertData) => ({
            ...alertData,
            id: Math.random().toString(36).substring(2, 9), // simple unique id
            read: false,
          }));
          setAlerts(newAlerts);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  return (
    <Card className="h-full flex flex-col glassmorphic">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <span>AI-Enhanced Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="mt-2">Checking for alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <PartyPopper className="w-12 h-12 mb-4 text-green-500" />
              <p className="font-semibold text-lg">All good!</p>
              <p className="text-sm">No items are expiring in the next 30 days.</p>
            </div>
          ) : (
             <ScrollArea className="h-[300px] w-full pr-4">
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <React.Fragment key={alert.id}>
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full mt-2",
                            alert.read ? "bg-muted" : "bg-primary"
                          )}
                          aria-label={alert.read ? "Read" : "Unread"}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">
                              {alert.alertTitle}
                            </p>
                            <Badge variant={priorityVariantMap[alert.priority]}>
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {alert.alertMessage}
                          </p>
                        </div>
                      </div>
                      {index < alerts.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </div>
            </ScrollArea>
          )}
      </CardContent>
    </Card>
  );
}
