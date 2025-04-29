// backend/server.js (with static prompt)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const STATIC_SYSTEM_PROMPT = require('./static-prompt');
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

// Keep a simple conversation memory for the demo
// In a real application, this would be stored in a database
let conversationHistory = [];

// Assistant endpoint
app.post('/api/assistant', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Add the new message to conversation history
    conversationHistory.push({ role: "user", content: message });
    
    // Create messages array with system prompt, conversation history, and current message
    const messages = [
      {
        role: "assistant",
        content: STATIC_SYSTEM_PROMPT
      },
      // Only include last 5 messages to avoid token limit issues
      ...conversationHistory.slice(-config.maxConversationHistory)
    ];
    
    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: config.model,
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