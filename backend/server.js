require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
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

// Import the system prompt content
const STATIC_SYSTEM_PROMPT = require('./static-prompt');

// Store user conversations (in a real app, this would be in a database)
const userConversations = {};

// Assistant endpoint with streaming
app.get('/api/assistant', async (req, res) => {
  try {
    const { message, userId = 'default-user' } = req.query;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Create or retrieve the user's conversation history
    if (!userConversations[userId]) {
      userConversations[userId] = [];
    }
    
    // Add the new user message
    userConversations[userId].push({
      role: "user",
      content: message
    });
    
    // Ensure we don't exceed the maximum conversation history
    if (userConversations[userId].length > config.maxConversationHistory * 2) {
      // Keep only the most recent messages (pairs of user and assistant messages)
      userConversations[userId] = userConversations[userId].slice(-config.maxConversationHistory * 2);
    }
    
    // Build the messages array for the API call
    const messages = [
      {
        role: "system",
        content: STATIC_SYSTEM_PROMPT
      },
      ...userConversations[userId]
    ];
    
    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    let responseContent = '';
    
    // Call the Chat Completions API with streaming enabled
    const stream = await openai.chat.completions.create({
      model: config.model,
      messages: messages,
      temperature: 0.7,
      stream: true,
    });
    
    // Process the stream
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      
      if (content) {
        // Append to the full response
        responseContent += content;
        
        // Send the chunk to the client
        res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
      }
    }
    
    // Store the assistant's response in the conversation history
    userConversations[userId].push({
      role: "assistant",
      content: responseContent
    });
    
    // Send the end event
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    // Send error as SSE
    res.write(`data: ${JSON.stringify({ error: 'Failed to process request' })}\n\n`);
    res.end();
  }
});

// Add a new endpoint to reset conversation history
app.post('/api/reset', async (req, res) => {
  try {
    const { userId = 'default-user' } = req.body;
    
    // Clear conversation history
    if (userConversations[userId]) {
      userConversations[userId] = [];
    }
    
    res.json({ success: true, message: 'Conversation history reset successfully' });
  } catch (error) {
    console.error('Error resetting conversation:', error);
    res.status(500).json({ error: 'Failed to reset conversation' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});