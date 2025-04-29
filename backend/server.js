// backend/server.js (enhanced version)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
// Import the enhanced data sources
const dataSources = require('./dataSources');
const config = require('./config');

const app = express();
const port = config.port;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Base system prompt
const BASE_SYSTEM_PROMPT = `
You are an AI assistant inside a store/restaurant management application used by vendors to manage orders and their business. Your role is to:
- Answer vendors' questions about their business data
- Provide recommendations for improving operations
- Help identify trends and opportunities
- Offer supportive guidance based on actual performance metrics

Keep responses concise, relevant, and focused on actionable insights that would help the restaurant owner improve their business.

Only provide directions to features or functionality in the application if the directions are explicitly mentioned in this prompt.
`;

// Keep a simple conversation memory for the demo
// In a real application, this would be stored in a database
let conversationHistory = [];

// Helper function to get relevant context based on user query
function getRelevantContext(query) {
  const queryLower = query.toLowerCase();
  
  // Define topic keywords with their corresponding data paths
  const topicMap = {
    sales: ['dashboard.sales'],
    revenue: ['dashboard.sales'],
    money: ['dashboard.sales'],
    
    menu: ['dashboard.sales.popular', 'dashboard.sales.menu'],
    food: ['dashboard.sales.popular'],
    dish: ['dashboard.sales.popular'],
    popular: ['dashboard.sales.popular'],
    
    review: ['reviews'],
    feedback: ['reviews'],
    rating: ['reviews'],
    
    order: ['orders'],
    delivery: ['orders'],
    issue: ['orders'],
    
    staff: ['operations'],
    employee: ['operations'],
    operation: ['operations'],
    schedule: ['operations'],
    promo: ['operations.promotions'],
    
    help: ['helpCenter'],
    guide: ['helpCenter'],
    article: ['helpCenter'],
    'how to': ['helpCenter'],
    tips: ['helpCenter']
  };
  
  // Find matching topics in the query
  const matchedPaths = new Set();
  for (const [topic, paths] of Object.entries(topicMap)) {
    if (queryLower.includes(topic)) {
      paths.forEach(path => matchedPaths.add(path));
    }
  }
  
  // If nothing matched, return all data
  if (matchedPaths.size === 0) {
    return dataSources;
  }
  
  // Build the response object from the matched paths
  const relevantData = {};
  matchedPaths.forEach(path => {
    const parts = path.split('.');
    let current = relevantData;
    let sourceData = dataSources;
    
    // Traverse the path and build the object structure
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // Last part - assign the value
        current[part] = sourceData[part];
      } else {
        // Create intermediate object if needed
        current[part] = current[part] || {};
        current = current[part];
        sourceData = sourceData[part] || {};
      }
    }
  });
  
  return relevantData;
}

// Enhanced formatContextData function to handle the richer data structure
function formatContextData(contextData) {
  // Define formatters for each data section
  const formatters = {
    dashboard: (data) => {
      let result = "DASHBOARD DATA:\n";
      if (data.sales) {
        const sales = data.sales;
        if (sales.weekly) {
          result += `- Total sales this week: $${sales.weekly.total} (up ${sales.weekly.change}% from last week: $${sales.weekly.prev})\n`;
        }
        if (sales.orders) {
          result += `- Total orders: ${sales.orders.count} (average order value: $${sales.orders.avgValue})\n`;
        }
        if (sales.popular && sales.popular.length > 0) {
          const popularItems = sales.popular.map(item => `${item.name} (${item.orders} orders)`).join(', ');
          result += `- Most popular items: ${popularItems}\n`;
        }
        if (sales.busyHours) {
          result += `- Busiest hours: ${sales.busyHours.weekdays} weekdays, ${sales.busyHours.weekends} weekends\n`;
        }
        if (sales.menu && sales.menu.alerts && sales.menu.alerts.length > 0) {
          const alerts = sales.menu.alerts.map(alert => `${alert.item} (${alert.status})`).join(', ');
          result += `- Current inventory alerts: ${alerts}\n`;
        }
      }
      return result + "\n";
    },
    
    reviews: (data) => {
      let result = "CUSTOMER REVIEWS (Last 7 Days):\n";
      if (data.overall) {
        result += `- Overall rating: ${data.overall.rating}/5 stars (${data.overall.count} new reviews)\n`;
      }
      if (data.positive && data.positive.length > 0) {
        const positiveMentions = data.positive.map(item => `${item.topic} (${item.mentions} mentions)`).join(', ');
        result += `- Positive mentions: ${positiveMentions}\n`;
      }
      if (data.critical && data.critical.length > 0) {
        const criticalMentions = data.critical.map(item => `${item.topic} (${item.mentions} mentions)`).join(', ');
        result += `- Critical mentions: ${criticalMentions}\n`;
      }
      if (data.recent && data.recent.length > 0) {
        result += "- Recent reviews:\n";
        data.recent.slice(0, 2).forEach(review => {
          result += `  * "${review.text}" - ${review.author} (${review.rating} stars, ${review.date})\n`;
        });
      }
      return result + "\n";
    },
    
    orders: (data) => {
      let result = "ORDER HISTORY:\n";
      if (data.repeat) {
        result += `- Repeat customers: ${data.repeat.percentage}% of orders\n`;
      }
      if (data.delivery) {
        result += `- Average delivery time: ${data.delivery.avgTime} minutes\n`;
      }
      if (data.sources) {
        result += `- Order sources: Direct website (${data.sources.direct}%), Food delivery apps (${data.sources.apps}%)\n`;
      }
      if (data.issues) {
        result += `- Most common issues: Delayed deliveries (${data.issues.delayed.percentage}%), Incorrect items (${data.issues.incorrect.percentage}%)\n`;
      }
      if (data.recent && data.recent.length > 0) {
        result += "- Recent orders:\n";
        data.recent.forEach(order => {
          const time = new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          result += `  * ${order.orderId}: ${order.customer} ordered ${order.items.join(', ')} - $${order.total} at ${time}\n`;
        });
      }
      return result + "\n";
    },
    
    operations: (data) => {
      let result = "BUSINESS OPERATIONS:\n";
      if (data.staff) {
        result += `- Staff scheduled this week: ${data.staff.fullTime} full-time, ${data.staff.partTime} part-time\n`;
      }
      if (data.promotions && data.promotions.length > 0) {
        result += "- Current promotions:\n";
        data.promotions.forEach(promo => {
          result += `  * ${promo.description} (code: ${promo.code})\n`;
        });
      }
      if (data.reservations) {
        result += `- Upcoming reservations: ${data.reservations.totalReservations} total, including ${data.reservations.largeParties} parties of 6+ people this weekend\n`;
      }
      return result + "\n";
    },
    
    helpCenter: (data) => {
      let result = "HELP CENTER ARTICLES:\n";
      if (data.articles && data.articles.length > 0) {
        data.articles.forEach(article => {
          result += `- ${article.title}: ${article.summary}\n`;
        });
      }
      return result;
    }
  };
  
  let formattedContext = "";
  
  // Process each section using its formatter
  for (const [section, data] of Object.entries(contextData)) {
    if (formatters[section] && Object.keys(data).length > 0) {
      formattedContext += formatters[section](data);
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
      model: config.model, // Use the appropriate model for your needs
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