require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const config = require('./config');
const { setupVectorStore } = require('./utils/vectorStore');

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
const SYSTEM_PROMPT = require('./static-prompt');

// Store user conversations (in a real app, this would be in a database)
const userConversations = {};

let vectorStoreId = null;

(async () => {
  vectorStoreId = await setupVectorStore(openai);
})();

// Assistant endpoint with streaming
app.get('/api/assistant', async (req, res) => {
  try {
    const { message, userId = 'default-user' } = req.query;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Wait for vector store to be ready
    if (!vectorStoreId) {
      res.write(`data: ${JSON.stringify({ error: 'Vector store not ready yet.' })}\n\n`);
      return res.end();
    }
    
    // Get previous response id for this user
    let previousResponseId = userConversations[userId]?.lastResponseId || null;

    try {
      const response = await openai.responses.create({
        model: config.model,
        previous_response_id: previousResponseId,
        store: true,
        stream: true,
        instructions: SYSTEM_PROMPT,
        input: message,
        tools: [
          {
            type: 'file_search',
            vector_store_ids: [vectorStoreId]
          }
        ]
      });
      
      // Send an initial message to keep the connection alive
      res.write(`data: ${JSON.stringify({ init: true })}\n\n`);
      
      for await (const chunk of response) {
        // Extract delta content from chunks
        if (chunk.type === 'response.output_text.delta' && chunk.delta) {
          res.write(`data: ${JSON.stringify({ chunk: chunk.delta })}\n\n`);
          res.flushHeaders();
        }

        if (chunk.type === 'response.completed') {
          // Store the response id for this user
          if (!userConversations[userId]) userConversations[userId] = {};
          userConversations[userId].lastResponseId = chunk.response.id;
        }
      }

      // Send completion message
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      
    } catch (error) {
      console.error('Error from OpenAI Responses API:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // Send error as SSE
      res.write(`data: ${JSON.stringify({ 
        error: 'OpenAI API error', 
        details: error.message,
        status: error.status || 'unknown'
      })}\n\n`);
      res.end();
    }
    
  } catch (error) {
    console.error('General error in assistant endpoint:', error);
    res.write(`data: ${JSON.stringify({ error: 'Server error', details: error.message })}\n\n`);
    res.end();
  }
});

// Add a new endpoint to reset conversation history
app.post('/api/reset', async (req, res) => {
  try {
    const { userId = 'default-user' } = req.body;
    
    // Clear conversation history
    if (userConversations[userId]) {
      userConversations[userId] = {};
    }
    
    res.json({ success: true, message: 'Conversation history reset successfully' });
  } catch (error) {
    console.error('Error resetting conversation:', error);
    res.status(500).json({ error: 'Failed to reset conversation' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});