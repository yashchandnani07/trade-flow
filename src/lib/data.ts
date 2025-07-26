import type { Order, Review, Supplier } from "@/lib/types";

export const mockOrders: Order[] = [
  { id: "ORD001", product: "Organic Cotton T-Shirts", customer: "EcoThreads Inc.", date: "2024-05-15", amount: "$2,500.00", status: "Delivered" },
  { id: "ORD002", product: "Recycled PET Bottles", customer: "GreenPlast Corp.", date: "2024-05-18", amount: "$10,200.00", status: "Shipped" },
  { id: "ORD003", product: "Fairtrade Coffee Beans", customer: "The Daily Grind", date: "2024-05-20", amount: "$800.00", status: "Shipped" },
  { id: "ORD004", product: "Bamboo Toothbrushes", customer: "BrushWell Co.", date: "2024-05-21", amount: "$1,150.00", status: "Pending" },
  { id: "ORD005", product: "Handmade Leather Wallets", customer: "Artisan Goods", date: "2024-05-22", amount: "$3,200.00", status: "Delivered" },
  { id: "ORD006", product: "Custom Circuit Boards", customer: "Tech Innovators", date: "2024-05-23", amount: "$15,000.00", status: "Pending" },
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


export const mockReviews: Review[] = [
    {
        id: "1",
        supplierId: "stellar-solutions",
        author: "Sarah Johnson",
        avatar: "SJ",
        date: "2024-05-20",
        rating: 5,
        comment: "Exceptional quality and fantastic communication. The order arrived ahead of schedule. Will definitely work with them again!",
    },
    {
        id: "2",
        supplierId: "stellar-solutions",
        author: "Michael Chen",
        avatar: "MC",
        date: "2024-05-18",
        rating: 4,
        comment: "Very reliable supplier. The products are consistent and pricing is competitive. Minor delay in the last shipment but they were proactive in communicating it.",
    },
    {
        id: "3",
        supplierId: "apex-logistics",
        author: "David Garcia",
        avatar: "DG",
        date: "2024-05-12",
        rating: 5,
        comment: "A pleasure to work with. They are always accommodating to our custom requests and deliver high-quality results every time. Highly recommended.",
    },
];
