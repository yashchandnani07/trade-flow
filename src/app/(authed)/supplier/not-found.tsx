
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md text-center bg-glass">
            <CardHeader>
                <div className="mx-auto bg-destructive/20 text-destructive rounded-full p-3 w-fit">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                <CardTitle className="mt-4">Supplier Not Found</CardTitle>
                <CardDescription>Sorry, we couldn't find the supplier you're looking for. It might have been moved or deleted.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/supplier">Back to Suppliers List</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}
