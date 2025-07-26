
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const orders = [
    { id: "ORD001", vendor: "The Chaat Corner", date: "2024-05-28", amount: "₹25,000", status: "fulfilled" },
    { id: "ORD002", vendor: "Mumbai Bites", date: "2024-05-27", amount: "₹15,000", status: "pending" },
    { id: "ORD003", vendor: "Juice Junction", date: "2024-05-26", amount: "₹35,000", status: "fulfilled" },
    { id: "ORD004", vendor: "Rolls & Bowls", date: "2024-05-25", amount: "₹45,000", status: "shipped" },
];

const OrderManagement = () => {
    return (
        <Card className="bg-glass">
            <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and manage incoming and historical orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.vendor}</TableCell>
                                <TableCell>{order.amount}</TableCell>
                                <TableCell>
                                    <Badge variant={order.status === 'fulfilled' ? 'default' : order.status === 'pending' ? 'secondary' : 'outline'} className="capitalize">
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm">View Details</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default OrderManagement;
