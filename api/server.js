// api/server.js (using OpenAI Responses API with streaming)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const config = require('./config');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs'); // Add this for createReadStream
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
const STATIC_SYSTEM_PROMPT = require('./static-prompt');

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
    
    // Create or retrieve the user's conversation history
    if (!userConversations[userId]) {
      userConversations[userId] = {};
    }

    // Wait for vector store to be ready
    if (!vectorStoreId) {
      res.write(`data: ${JSON.stringify({ error: 'Vector store not ready yet.' })}\n\n`);
      return res.end();
    }
    
    console.log('Making Responses API call with:', {
      model: config.model,
      input: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      previousResponseId: userConversations[userId].lastResponseId,
      vectorStoreId,
    });
    
    try {
      const response = await openai.responses.create({
        model: config.model,
        stream: true,
        instructions: STATIC_SYSTEM_PROMPT,
        input: message,
        ...(userConversations[userId].lastResponseId ? 
          { previous_response_id: userConversations[userId].lastResponseId } : {}),
        tools: [
          {
            type: 'file_search',
            vector_store_ids: [vectorStoreId]
          }
        ]
      });
      
      let responseId = null;
      
      // Send an initial message to keep the connection alive
      res.write(`data: ${JSON.stringify({ init: true })}\n\n`);
      
      // Replace the existing chunk handling loop with this corrected version:
      for await (const chunk of response) {
        // Store response ID when available
        if (chunk.id && !responseId) {
          responseId = chunk.id;
        }

        // Extract delta content from chunks
        if (chunk.type === 'response.output_text.delta' && chunk.delta) {
          // Debug logging
          console.log('Delta content:', chunk.delta);

          // Send the delta content immediately
          res.write(`data: ${JSON.stringify({ chunk: chunk.delta })}\n\n`);
          // Force flush the response stream
          res.flushHeaders();
        }
      }
      
      // Save response ID for future conversations if available
      if (responseId) {
        userConversations[userId].lastResponseId = responseId;
      }
      
      console.log('Stream complete');
      console.log('Response ID saved:', responseId);
      
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