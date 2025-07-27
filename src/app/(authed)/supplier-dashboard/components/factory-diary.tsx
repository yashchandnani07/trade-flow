
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function FactoryDiary() {
    return (
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle>Factory Diary</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No new entries.</p>
            </CardContent>
        </Card>
    );
}
