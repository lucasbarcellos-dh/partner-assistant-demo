// context/restaurantData.js
const restaurantData = {
    // Dashboard metrics
    dashboardMetrics: {
      currentWeek: {
        totalSales: 12450,
        salesGrowth: 12, // percentage
        totalOrders: 430,
        averageOrderValue: 28.95,
        popularItems: [
          { name: "Chicken Parmesan", orders: 78 },
          { name: "Margherita Pizza", orders: 65 },
          { name: "Tiramisu", orders: 43 }
        ],
        busiestHours: [
          { dayType: "weekdays", timeRange: "6-8 PM" },
          { dayType: "weekends", timeRange: "12-2 PM" }
        ],
        inventoryAlerts: [
          { item: "Chicken breast", status: "low" },
          { item: "Tomatoes", status: "low" },
          { item: "Heavy cream", status: "low" }
        ]
      },
      previousWeek: {
        totalSales: 11116,
        totalOrders: 410,
        averageOrderValue: 27.11
      }
    },
    
    // Customer reviews
    customerReviews: {
      lastSevenDays: {
        overallRating: 4.2,
        newReviewCount: 14,
        positiveTopics: [
          { topic: "Delivery speed", mentions: 7 },
          { topic: "Food quality", mentions: 5 }
        ],
        criticalTopics: [
          { topic: "Missing items", mentions: 2 },
          { topic: "Incorrect orders", mentions: 1 }
        ],
        recentReviews: [
          {
            customer: "John S.",
            rating: 3,
            text: "The food was excellent as always, but it took a bit longer than usual to arrive.",
            date: "2025-04-27"
          },
          {
            customer: "Maria L.",
            rating: 5,
            text: "Perfect meal! Delivery was fast and everything was hot when it arrived.",
            date: "2025-04-26"
          },
          {
            customer: "Raj P.",
            rating: 4,
            text: "Great food, good service. The new online menu is much easier to navigate.",
            date: "2025-04-25"
          }
        ]
      }
    },
    
    // Order history
    orderHistory: {
      repeatCustomerPercentage: 65,
      averageDeliveryTime: 32, // minutes
      orderSources: [
        { source: "Direct website", percentage: 45 },
        { source: "Food delivery apps", percentage: 55 }
      ],
      commonIssues: [
        { issue: "Delayed deliveries", percentage: 4 },
        { issue: "Incorrect items", percentage: 2 }
      ],
      recentOrders: [
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
    
    // Business operations
    businessOperations: {
      staffScheduled: {
        fullTime: 12,
        partTime: 8
      },
      activePromotions: [
        { description: "10% off orders over $50", code: "SAVE10" },
        { description: "Free delivery on Mondays", code: "MONDAYFREE" }
      ],
      upcomingReservations: {
        largeParties: 5, // parties of 6+ people this weekend
        totalReservations: 28
      }
    },
    
    // Help center articles (summaries)
    helpCenterArticles: [
      {
        title: "Managing Inventory Alerts",
        summary: "Set up automatic alerts when inventory items fall below threshold levels. Configure alerts in Settings > Inventory > Alert Thresholds."
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
  };
  
  export default restaurantData;