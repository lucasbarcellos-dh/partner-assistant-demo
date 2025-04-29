const dataSources = {
  dashboard: {
    sales: {
      weekly: { 
        total: 12450, 
        change: 12, 
        prev: 11116 
      },
      orders: { 
        count: 430, 
        avgValue: 28.95 
      },
      popular: [
        { name: "Chicken Parmesan", orders: 78 },
        { name: "Margherita Pizza", orders: 65 },
        { name: "Tiramisu", orders: 43 }
      ],
      busyHours: {
        weekdays: "6-8 PM",
        weekends: "12-2 PM"
      },
      menu: {
        alerts: [
          { item: "Chicken breast", status: "low" },
          { item: "Tomatoes", status: "low" },
          { item: "Heavy cream", status: "low" }
        ]
      }
    }
  },
  reviews: {
    overall: { 
      rating: 4.2, 
      count: 14,
      lastSevenDays: true
    },
    positive: [
      { topic: "Delivery speed", mentions: 7 },
      { topic: "Food quality", mentions: 5 }
    ],
    critical: [
      { topic: "Missing items", mentions: 2 },
      { topic: "Incorrect orders", mentions: 1 }
    ],
    recent: [
      {
        text: "The food was excellent as always, but it took a bit longer than usual to arrive.",
        author: "John S.",
        rating: 3,
        date: "2025-04-27"
      },
      {
        text: "Perfect meal! Delivery was fast and everything was hot when it arrived.",
        author: "Maria L.",
        rating: 5,
        date: "2025-04-26"
      },
      {
        text: "Great food, good service. The new online menu is much easier to navigate.",
        author: "Raj P.",
        rating: 4,
        date: "2025-04-25"
      }
    ]
  },
  orders: {
    repeat: { percentage: 65 },
    delivery: { avgTime: 32 },
    sources: { 
      direct: 45, 
      apps: 55 
    },
    issues: {
      delayed: { percentage: 4 },
      incorrect: { percentage: 2 }
    },
    recent: [
      {
        orderId: "ORD-4892",
        customer: "Emma W.",
        items: ["Fettuccine Alfredo", "Garlic Bread", "Tiramisu"],
        total: 42.75,
        timestamp: "2025-04-28T18:42:00"
      },
      {
        orderId: "ORD-4891",
        customer: "Michael T.",
        items: ["Chicken Parmesan", "Caesar Salad"],
        total: 31.95,
        timestamp: "2025-04-28T18:15:00"
      }
    ]
  },
  operations: {
    staff: { 
      fullTime: 12, 
      partTime: 8 
    },
    promotions: [
      { description: "10% off orders over $50", code: "SAVE10" },
      { description: "Free delivery on Mondays", code: "MONDAYFREE" }
    ],
    reservations: {
      largeParties: 5, 
      totalReservations: 28,
      weekend: true
    }
  },
  helpCenter: {
    articles: [
      {
        title: "Managing Menu Alerts",
        summary: "Set up automatic alerts when menu items fall below threshold levels. Configure alerts in Menu > Alert Thresholds."
      },
      {
        title: "Responding to Customer Reviews",
        summary: "Best practices for addressing customer feedback. Respond promptly, be professional, and offer solutions to issues mentioned."
      },
      {
        title: "Optimizing Delivery Times",
        summary: "Tips for reducing delivery times including kitchen workflow optimization and delivery zone management."
      }
    ]
  }
};

module.exports = dataSources;