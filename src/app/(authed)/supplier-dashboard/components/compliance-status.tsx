
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ComplianceStatus() {
    return (
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-green-500 font-semibold">All documents are up-to-date.</p>
            </CardContent>
        </Card>
    );
}
