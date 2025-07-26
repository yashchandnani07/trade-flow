
import type { Order, Review, Supplier } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

export const mockOrders: Omit<Order, 'id'>[] = [
  {
    vendorId: "MOCK_VENDOR_1",
    supplierId: "stellar-solutions",
    supplierName: "Stellar Solutions",
    items: [{ name: "Eco-friendly Cups", quantity: 500 }],
    status: "Shipped",
    orderDate: Timestamp.fromDate(new Date('2024-07-20')),
    deliveryTimestamp: null,
    preDeliveryImage: "https://placehold.co/400x300.png",
    postDeliveryImage: null,
    rating: undefined,
    review: undefined,
  },
  {
    vendorId: "MOCK_VENDOR_1",
    supplierId: "apex-logistics",
    supplierName: "Apex Logistics",
    items: [{ name: "Shipping Boxes", quantity: 1000 }],
    status: "Order Placed",
    orderDate: Timestamp.fromDate(new Date('2024-07-22')),
    deliveryTimestamp: null,
    preDeliveryImage: null,
    postDeliveryImage: null,
  },
  {
    vendorId: "MOCK_VENDOR_2",
    supplierId: "stellar-solutions",
    supplierName: "Stellar Solutions",
    items: [{ name: "Recycled Cardboard", quantity: 200 }],
    status: "Received",
    orderDate: Timestamp.fromDate(new Date('2024-07-15')),
    deliveryTimestamp: Timestamp.fromDate(new Date('2024-07-18')),
    preDeliveryImage: "https://placehold.co/400x300.png",
    postDeliveryImage: "https://placehold.co/400x300.png",
    rating: 5,
    review: "The products were of excellent quality and arrived right on time. Great communication from the supplier!"
  },
];

export const mockSuppliers: Supplier[] = [
    {
        id: "stellar-solutions",
        name: "Stellar Solutions",
        description: "Leading provider of eco-friendly packaging materials. Committed to sustainability and quality.",
        rating: 4.8,
        reviewCount: 152,
        contact: {
            phone: "123-456-7890",
            email: "contact@stellarsolutions.com"
        },
        location: "San Francisco, CA",
        offerings: ["Biodegradable plastics", "Recycled cardboard", "Compostable containers"],
        hours: "Mon-Fri, 9am - 5pm PST",
        avatar: "SS"
    },
    {
        id: "apex-logistics",
        name: "Apex Logistics",
        description: "Global logistics and supply chain management. Fast, reliable, and efficient.",
        rating: 4.5,
        reviewCount: 210,
        contact: {
            phone: "987-654-3210",
            email: "support@apexlogistics.com"
        },
        location: "New York, NY",
        offerings: ["International Shipping", "Warehousing", "Freight Forwarding"],
        hours: "24/7 Support",
        avatar: "AL"
    },
    {
        id: "quantum-supplies",
        name: "Quantum Supplies",
        description: "High-quality raw materials for manufacturing and construction.",
        rating: 4.9,
        reviewCount: 320,
        contact: {
            phone: "555-123-4567",
            email: "sales@quantumsupplies.com"
        },
        location: "Houston, TX",
        offerings: ["Steel", "Lumber", "Industrial Chemicals"],
        hours: "Mon-Sat, 8am - 6pm CST",
        avatar: "QS"
    }
];


export const mockReviews: Omit<Review, 'timestamp'>[] = [
    {
        id: "1",
        supplierId: "stellar-solutions",
        vendorId: "MOCK_VENDOR_1",
        author: "Sarah Johnson",
        avatar: "SJ",
        rating: 5,
        comment: "Exceptional quality and fantastic communication. The order arrived ahead of schedule. Will definitely work with them again!",
        verified: true
    },
    {
        id: "2",
        supplierId: "stellar-solutions",
        vendorId: "MOCK_VENDOR_2",
        author: "Michael Chen",
        avatar: "MC",
        rating: 4,
        comment: "Very reliable supplier. The products are consistent and pricing is competitive. Minor delay in the last shipment but they were proactive in communicating it.",
        verified: true
    },
    {
        id: "3",
        supplierId: "apex-logistics",
        vendorId: "MOCK_VENDOR_3",
        author: "David Garcia",
        avatar: "DG",
        rating: 5,
        comment: "A pleasure to work with. They are always accommodating to our custom requests and deliver high-quality results every time. Highly recommended.",
        verified: true
    },
];
