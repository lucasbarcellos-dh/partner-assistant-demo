// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Data sources - in a real app, these would come from databases or APIs
const dataSources = {
  dashboard: {
    sales: {
      weekly: { total: 12450, change: 12, prev: 11116 },
      orders: { count: 430, avgValue: 28.95 },
      popular: ["Chicken Parmesan", "Margherita Pizza", "Tiramisu"],
      busyHours: {
        weekdays: "6-8 PM",
        weekends: "12-2 PM"
      },
      inventory: {
        alerts: ["chicken breast", "tomatoes", "heavy cream"]
      }
    }
  },
  reviews: {
    overall: { rating: 4.2, count: 20 },
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
        rating: 3
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
    }
  },
  operations: {
    staff: { fullTime: 12, partTime: 8 },
    promotions: [
      "10% off orders over $50",
      "Free delivery on Mondays"
    ],
    reservations: {
      upcoming: { largeParties: 5, weekend: true }
    }
  }
};

// Base system prompt
const BASE_SYSTEM_PROMPT = `
You are an AI assistant for restaurant owners using a restaurant management application.
Your role is to:
- Answer restaurant owners' questions about their business data
- Provide recommendations for improving operations
- Help identify trends and opportunities
- Offer supportive guidance based on actual performance metrics

Keep responses concise, relevant, and focused on actionable insights that would help the restaurant owner improve their business.
`;

// Keep a simple conversation memory for the demo
// In a real application, this would be stored in a database
let conversationHistory = [];

// Helper function to get relevant context based on user query
function getRelevantContext(query) {
  const queryLower = query.toLowerCase();
  let relevantData = {};
  
  // Check for sales/revenue related queries
  if (queryLower.includes('sales') || queryLower.includes('revenue') || queryLower.includes('money')) {
    relevantData.dashboard = { sales: dataSources.dashboard.sales };
  }
  
  // Check for menu/food related queries
  if (queryLower.includes('menu') || queryLower.includes('food') || queryLower.includes('dish') || 
      queryLower.includes('popular')) {
    relevantData.dashboard = relevantData.dashboard || {};
    relevantData.dashboard.sales = relevantData.dashboard.sales || {};
    relevantData.dashboard.sales.popular = dataSources.dashboard.sales.popular;
  }
  
  // Check for review related queries
  if (queryLower.includes('review') || queryLower.includes('feedback') || queryLower.includes('rating')) {
    relevantData.reviews = dataSources.reviews;
  }
  
  // Check for order related queries
  if (queryLower.includes('order') || queryLower.includes('delivery') || queryLower.includes('issue')) {
    relevantData.orders = dataSources.orders;
  }
  
  // Check for staff/operation related queries
  if (queryLower.includes('staff') || queryLower.includes('employee') || queryLower.includes('operation') ||
      queryLower.includes('schedule') || queryLower.includes('promo')) {
    relevantData.operations = dataSources.operations;
  }
  
  // If no specific match, provide all data
  if (Object.keys(relevantData).length === 0) {
    return dataSources;
  }
  
  return relevantData;
}

// Format context for the prompt
function formatContextData(contextData) {
  let formattedContext = "";
  
  // Format dashboard data if available
  if (contextData.dashboard && contextData.dashboard.sales) {
    const sales = contextData.dashboard.sales;
    formattedContext += "DASHBOARD DATA:\n";
    if (sales.weekly) {
      formattedContext += `- Total sales this week: $${sales.weekly.total} (up ${sales.weekly.change}% from last week)\n`;
    }
    if (sales.orders) {
      formattedContext += `- Total orders: ${sales.orders.count} (average order value: $${sales.orders.avgValue})\n`;
    }
    if (sales.popular) {
      formattedContext += `- Most popular items: ${sales.popular.join(', ')}\n`;
    }
    if (sales.busyHours) {
      formattedContext += `- Busiest hours: ${sales.busyHours.weekdays} weekdays, ${sales.busyHours.weekends} weekends\n`;
    }
    if (sales.inventory && sales.inventory.alerts) {
      formattedContext += `- Current inventory alerts: Low on ${sales.inventory.alerts.join(', ')}\n`;
    }
    formattedContext += "\n";
  }
  
  // Format reviews data if available
  if (contextData.reviews) {
    const reviews = contextData.reviews;
    formattedContext += "CUSTOMER REVIEWS (Last 7 Days):\n";
    if (reviews.overall) {
      formattedContext += `- Overall rating: ${reviews.overall.rating}/5 stars (${reviews.overall.count} new reviews)\n`;
    }
    if (reviews.positive) {
      const positiveMentions = reviews.positive.map(item => `${item.topic} (${item.mentions} mentions)`).join(', ');
      formattedContext += `- Positive mentions: ${positiveMentions}\n`;
    }
    if (reviews.critical) {
      const criticalMentions = reviews.critical.map(item => `${item.topic} (${item.mentions} mentions)`).join(', ');
      formattedContext += `- Critical mentions: ${criticalMentions}\n`;
    }
    if (reviews.recent && reviews.recent.length > 0) {
      const recent = reviews.recent[0];
      formattedContext += `- Most recent review: "${recent.text}" - ${recent.author} (${recent.rating} stars)\n`;
    }
    formattedContext += "\n";
  }
  
  // Format order data if available
  if (contextData.orders) {
    const orders = contextData.orders;
    formattedContext += "ORDER HISTORY:\n";
    if (orders.repeat) {
      formattedContext += `- Repeat customers: ${orders.repeat.percentage}% of orders\n`;
    }
    if (orders.delivery) {
      formattedContext += `- Average delivery time: ${orders.delivery.avgTime} minutes\n`;
    }
    if (orders.sources) {
      formattedContext += `- Order sources: Direct website (${orders.sources.direct}%), Food delivery apps (${orders.sources.apps}%)\n`;
    }
    if (orders.issues) {
      formattedContext += `- Most common issues: Delayed deliveries (${orders.issues.delayed.percentage}%), Incorrect items (${orders.issues.incorrect.percentage}%)\n`;
    }
    formattedContext += "\n";
  }
  
  // Format operations data if available
  if (contextData.operations) {
    const ops = contextData.operations;
    formattedContext += "BUSINESS OPERATIONS:\n";
    if (ops.staff) {
      formattedContext += `- Staff scheduled this week: ${ops.staff.fullTime} full-time, ${ops.staff.partTime} part-time\n`;
    }
    if (ops.promotions) {
      formattedContext += `- Current promotions: ${ops.promotions.join(', ')}\n`;
    }
    if (ops.reservations && ops.reservations.upcoming) {
      formattedContext += `- Upcoming reservation requests: ${ops.reservations.upcoming.largeParties} parties of 6+ people this weekend\n`;
    }
  }
  
  return formattedContext;
}

// Assistant endpoint
app.post('/api/assistant', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Get relevant context based on the query
    const relevantContext = getRelevantContext(message);
    const formattedContext = formatContextData(relevantContext);
    
    // Build the final system prompt
    const finalSystemPrompt = `${BASE_SYSTEM_PROMPT}
    
You have access to the following information sources:

${formattedContext}`;
    
    // Add the new message to conversation history
    conversationHistory.push({ role: "user", content: message });
    
    // Create messages array with system prompt, conversation history, and current message
    const messages = [
      { role: "system", content: finalSystemPrompt },
      // Only include last 5 messages to avoid token limit issues
      ...conversationHistory.slice(-5)
    ];
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "o4-mini", // Use the appropriate model for your needs
      messages: messages
    });
    
    // Get the response content
    const responseContent = response.choices[0].message.content;
    
    // Add assistant response to conversation history
    conversationHistory.push({ role: "assistant", content: responseContent });
    
    // Send the response
    res.json({ 
      response: responseContent 
    });
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Add a new endpoint to reset conversation history (useful for demo)
app.post('/api/reset', (req, res) => {
  conversationHistory = [];
  res.json({ success: true, message: 'Conversation history reset successfully' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});