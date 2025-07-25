"use client";

import React, { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { generateAlert } from "@/app/actions";
import { Bell, Loader2 } from "lucide-react";
import type { Alert } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const priorityVariantMap = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

export function AlertsSection() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateAlert = () => {
    startTransition(async () => {
      const newAlertData = await generateAlert();
      if (newAlertData.alertTitle.includes("Error")) {
        toast({
            variant: "destructive",
            title: "AI Error",
            description: newAlertData.alertMessage,
        });
      } else {
        const newAlert: Alert = {
          ...newAlertData,
          id: Date.now().toString(),
          read: false,
        };
        setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
      }
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <span>AI-Enhanced Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[300px] pr-4">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bell className="w-12 h-12 mb-4" />
              <p className="text-sm">No new alerts.</p>
              <p className="text-xs">Click the button below to generate one.</p>
            </div>
          ) : (
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
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateAlert}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Generate New Alert
        </Button>
      </CardFooter>
    </Card>
  );
}
