
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function OrderManagement() {
    const orders = [
        { id: "ORD001", vendor: "Vendor A", date: "2024-07-27", amount: "$1,250", status: "Pending" },
        { id: "ORD002", vendor: "Vendor B", date: "2024-07-26", amount: "$850", status: "Shipped" },
        { id: "ORD003", vendor: "Vendor C", date: "2024-07-25", amount: "$2,500", status: "Delivered" },
    ];
    return (
        <Card className="glassmorphic">
            <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Recent orders from vendors.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.vendor}</TableCell>
                                <TableCell>{order.date}</TableCell>
                                <TableCell>{order.amount}</TableCell>
                                <TableCell><Badge>{order.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
